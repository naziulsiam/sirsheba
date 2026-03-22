import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPin } from '@/lib/auth'
import { generateOTP, otpExpiresAt } from '@/lib/auth-utils'
import { sendOTPEmail } from '@/lib/email'

// Step 1: Request OTP for PIN reset
export async function POST(req: NextRequest) {
    try {
        const { email, otp, new_pin } = await req.json()

        if (!email) return NextResponse.json({ error: 'ইমেইল প্রয়োজন' }, { status: 400 })

        const tutor = await db.findTutorByEmail(email)
        if (!tutor) return NextResponse.json({ error: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 })

        // If OTP and new_pin provided → reset PIN
        if (otp && new_pin) {
            if (tutor.email_otp !== otp) return NextResponse.json({ error: 'কোড সঠিক নয়' }, { status: 400 })
            if (!tutor.email_otp_expires_at || new Date(tutor.email_otp_expires_at) < new Date()) {
                return NextResponse.json({ error: 'কোডের মেয়াদ শেষ' }, { status: 400 })
            }
            if (!/^\d{4,6}$/.test(new_pin)) return NextResponse.json({ error: 'PIN ৪-৬ সংখ্যার হতে হবে' }, { status: 400 })

            const pin_hash = await hashPin(new_pin)
            await db.updateTutor(tutor.id, { pin_hash, email_otp: null, email_otp_expires_at: null })
            return NextResponse.json({ success: true, message: 'PIN পরিবর্তন হয়েছে' })
        }

        // Otherwise → send OTP
        const newOtp = generateOTP()
        await db.updateTutor(tutor.id, { email_otp: newOtp, email_otp_expires_at: otpExpiresAt() })
        await sendOTPEmail(email, tutor.full_name, newOtp)
        return NextResponse.json({ success: true, message: 'OTP পাঠানো হয়েছে' })
    } catch (err) {
        console.error('Forgot PIN error:', err)
        return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 })
    }
}
