'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmailOTPInput } from '@/components/auth/email-otp-input'
import { Loader2, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    useEffect(() => {
        const e = sessionStorage.getItem('sirsheba_reg_email') || ''
        const n = sessionStorage.getItem('sirsheba_reg_name') || ''
        setEmail(e)
        setName(n)
        if (!e) router.push('/register')
    }, [router])

    useEffect(() => {
        if (resendCooldown > 0) {
            const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
            return () => clearTimeout(t)
        }
    }, [resendCooldown])

    useEffect(() => {
        if (otp.length === 6) handleVerify()
    }, [otp])

    const handleVerify = async () => {
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); setOtp(''); return }
            router.push('/set-password')
        } catch {
            setError('সংযোগ ব্যর্থ')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        try {
            await fetch('/api/auth/verify-email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            setResendCooldown(60)
            setOtp('')
        } finally {
            setResending(false)
        }
    }

    return (
        <Card className="p-6 text-center">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10 mb-4">
                <Mail className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">ইমেইল যাচাই</h2>
            <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium text-foreground">{email}</span> এ ৬ সংখ্যার কোড পাঠানো হয়েছে
            </p>
            <p className="text-xs text-muted-foreground mb-6">
                (ইনবক্স না পেলে স্প্যাম চেক করুন)
            </p>

            <div className="mb-6">
                <EmailOTPInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">
                    {error}
                </p>
            )}

            <Button
                onClick={handleVerify}
                disabled={otp.length < 6 || loading}
                className="w-full h-11 mb-4"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'যাচাই করুন'}
            </Button>

            <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="w-full text-sm"
            >
                {resendCooldown > 0 ? `${resendCooldown}s পরে পুনরায় পাঠান` : 'কোড আসেনি? আবার পাঠান'}
            </Button>
        </Card>
    )
}
