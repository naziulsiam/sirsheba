'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EmailOTPInput } from '@/components/auth/email-otp-input'
import { PINPad } from '@/components/auth/pin-pad'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'

type Step = 'email' | 'otp' | 'pin'

export default function ForgotPINPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPin, setNewPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSendOTP = async () => {
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            setStep('otp')
        } catch {
            setError('সংযোগ ব্যর্থ')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPin = async () => {
        if (newPin.length < 4) return
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, new_pin: newPin }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            router.push('/login/pin')
        } catch {
            setError('সংযোগ ব্যর্থ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6">
            <Link href="/login/pin" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
                <ArrowLeft className="mr-1 h-4 w-4" />
                ফিরে যান
            </Link>

            {step === 'email' && (
                <>
                    <h2 className="text-xl font-bold mb-1">PIN রিসেট করুন</h2>
                    <p className="text-sm text-muted-foreground mb-6">আপনার ইমেইলে OTP কোড পাঠানো হবে</p>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">ইমেইল</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" type="email" placeholder="email@gmail.com"
                                    value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                            </div>
                        </div>
                        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                        <Button onClick={handleSendOTP} className="w-full h-11" disabled={loading || !email}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'OTP পাঠান'}
                        </Button>
                    </div>
                </>
            )}

            {step === 'otp' && (
                <>
                    <h2 className="text-xl font-bold mb-1">OTP যাচাই করুন</h2>
                    <p className="text-sm text-muted-foreground mb-6">{email} এ কোড পাঠানো হয়েছে</p>
                    <EmailOTPInput value={otp} onChange={setOtp} />
                    {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mt-4">{error}</p>}
                    <Button onClick={() => setStep('pin')} className="w-full h-11 mt-4" disabled={otp.length < 6}>পরবর্তী</Button>
                </>
            )}

            {step === 'pin' && (
                <>
                    <h2 className="text-xl font-bold mb-1">নতুন PIN সেট করুন</h2>
                    <p className="text-sm text-muted-foreground mb-6">৪-৬ সংখ্যার PIN বেছে নিন</p>
                    <div className="flex justify-center">
                        <PINPad value={newPin} onChange={setNewPin} maxLength={6} onSubmit={handleResetPin} disabled={loading} />
                    </div>
                    {loading && <div className="flex justify-center mt-3"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mt-3 text-center">{error}</p>}
                </>
            )}
        </Card>
    )
}
