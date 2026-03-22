import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP, otpExpiresAt } from '@/lib/auth-utils'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
    try {
        const { full_name, email, phone } = await req.json()

        if (!full_name || !email || !phone) {
            return NextResponse.json({ error: 'সব তথ্য প্রয়োজন' }, { status: 400 })
        }

        // Check duplicate email/phone
        const existingByEmail = await db.findTutorByEmail(email)
        if (existingByEmail) {
            return NextResponse.json({ error: 'এই ইমেইল আগেই নথিভুক্ত' }, { status: 409 })
        }
        const existingByPhone = await db.findTutorByPhone(phone)
        if (existingByPhone) {
            return NextResponse.json({ error: 'এই ফোন নম্বর আগেই নথিভুক্ত' }, { status: 409 })
        }

        const otp = generateOTP()
        const expires = otpExpiresAt()

        const tutor = await db.createTutor({
            full_name,
            email,
            phone,
            password_hash: null,
            pin_hash: null,
            email_verified: false,
            email_otp: otp,
            email_otp_expires_at: expires,
            plan_type: 'free',
            is_active: true,
        })

        await sendOTPEmail(email, full_name, otp)

        return NextResponse.json({ success: true, tutorId: tutor.id })
    } catch (err) {
        console.error('Register error:', err)
        return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 })
    }
}
