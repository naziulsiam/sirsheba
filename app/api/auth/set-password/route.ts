import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, hashPin, signToken, setSessionCookie } from '@/lib/auth'
import { validatePassword } from '@/lib/auth-utils'

export async function POST(req: NextRequest) {
    try {
        const { email, password, pin } = await req.json()

        if (!email || !password || !pin) {
            return NextResponse.json({ error: 'সব তথ্য প্রয়োজন' }, { status: 400 })
        }

        const tutor = await db.findTutorByEmail(email)
        if (!tutor) return NextResponse.json({ error: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 })
        if (!tutor.email_verified) return NextResponse.json({ error: 'ইমেইল যাচাই করুন' }, { status: 403 })

        // Validate password
        const pwCheck = validatePassword(password)
        if (!pwCheck.valid) return NextResponse.json({ error: pwCheck.message }, { status: 400 })

        // Validate PIN
        if (!/^\d{4,6}$/.test(pin)) {
            return NextResponse.json({ error: 'PIN ৪-৬ সংখ্যার হতে হবে' }, { status: 400 })
        }

        const [password_hash, pin_hash] = await Promise.all([
            hashPassword(password),
            hashPin(pin),
        ])

        await db.updateTutor(tutor.id, { password_hash, pin_hash })

        // Issue JWT and set cookie
        const token = await signToken({
            sub: tutor.id,
            email: tutor.email,
            name: tutor.full_name,
        })
        await setSessionCookie(token)

        return NextResponse.json({ success: true, user: { id: tutor.id, name: tutor.full_name, email: tutor.email } })
    } catch (err) {
        console.error('Set password error:', err)
        return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 })
    }
}
