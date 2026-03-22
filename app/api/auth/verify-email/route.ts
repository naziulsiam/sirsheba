import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP, otpExpiresAt } from '@/lib/auth-utils'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json()

        if (!email || !otp) {
            return NextResponse.json({ error: 'তথ্য অসম্পূর্ণ' }, { status: 400 })
        }

        const tutor = await db.findTutorByEmail(email)
        if (!tutor) {
            return NextResponse.json({ error: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 })
        }

        // Check OTP
        if (tutor.email_otp !== otp) {
            return NextResponse.json({ error: 'কোড সঠিক নয়' }, { status: 400 })
        }

        // Check expiry
        if (!tutor.email_otp_expires_at || new Date(tutor.email_otp_expires_at) < new Date()) {
            return NextResponse.json({ error: 'কোডের মেয়াদ শেষ হয়ে গেছে' }, { status: 400 })
        }

        await db.updateTutor(tutor.id, {
            email_verified: true,
            email_otp: null,
            email_otp_expires_at: null,
        })

        return NextResponse.json({ success: true, tutorId: tutor.id })
    } catch (err) {
        console.error('Verify email error:', err)
        return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 })
    }
}

// Resend OTP
export async function PUT(req: NextRequest) {
    try {
        const { email } = await req.json()
        const tutor = await db.findTutorByEmail(email)
        if (!tutor) return NextResponse.json({ error: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 })

        const otp = generateOTP()
        await db.updateTutor(tutor.id, { email_otp: otp, email_otp_expires_at: otpExpiresAt() })
        await sendOTPEmail(email, tutor.full_name, otp)

        const isDev = !process.env.RESEND_API_KEY
        return NextResponse.json({ success: true, ...(isDev && { devOtp: otp }) })

    } catch (err) {
        console.error('Resend OTP error:', err)
        return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 })
    }
}
