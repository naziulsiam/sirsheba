import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
    verifyPassword, verifyPin, signToken, setSessionCookie,
    checkPinAttempts, recordFailedPinAttempt, resetPinAttempts,
} from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const { identifier, pin, password } = await req.json()

        if (!identifier) return NextResponse.json({ error: 'ইমেইল বা ফোন প্রয়োজন' }, { status: 400 })
        if (!pin && !password) return NextResponse.json({ error: 'PIN বা পাসওয়ার্ড প্রয়োজন' }, { status: 400 })

        // Find tutor by email or phone
        const isEmail = identifier.includes('@')
        const tutor = isEmail
            ? await db.findTutorByEmail(identifier)
            : await db.findTutorByPhone(identifier)

        if (!tutor) return NextResponse.json({ error: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 })
        if (!tutor.is_active) return NextResponse.json({ error: 'অ্যাকাউন্ট নিষ্ক্রিয়' }, { status: 403 })
        if (!tutor.email_verified) return NextResponse.json({ error: 'ইমেইল যাচাই করুন' }, { status: 403 })
        if (!tutor.password_hash) return NextResponse.json({ error: 'পাসওয়ার্ড সেট করুন' }, { status: 403 })

        let authenticated = false

        if (pin) {
            // PIN login
            if (!tutor.pin_hash) return NextResponse.json({ error: 'PIN সেট করা নেই' }, { status: 403 })
            const { allowed, remaining } = checkPinAttempts(tutor.id)
            if (!allowed) {
                return NextResponse.json({ error: `অনেক ভুল চেষ্টা। ১৫ মিনিট অপেক্ষা করুন।`, locked: true }, { status: 429 })
            }
            authenticated = await verifyPin(pin, tutor.pin_hash)
            if (!authenticated) {
                recordFailedPinAttempt(tutor.id)
                return NextResponse.json({ error: `PIN ভুল। ${remaining - 1} চেষ্টা বাকি।`, remaining: remaining - 1 }, { status: 401 })
            }
            resetPinAttempts(tutor.id)
        } else if (password) {
            // Password login
            authenticated = await verifyPassword(password, tutor.password_hash)
            if (!authenticated) return NextResponse.json({ error: 'পাসওয়ার্ড ভুল' }, { status: 401 })
        }

        const token = await signToken({ sub: tutor.id, email: tutor.email, name: tutor.full_name })
        await setSessionCookie(token)

        return NextResponse.json({
            success: true,
            user: { id: tutor.id, name: tutor.full_name, email: tutor.email, phone: tutor.phone, role: tutor.role },
        })
    } catch (err) {
        console.error('Login error:', err)
        return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 })
    }
}
