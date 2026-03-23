'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/auth/password-input'
import { PINPad } from '@/components/auth/pin-pad'
import { useAuthStore } from '@/store/auth-store'
import { Loader2, Lock, Hash } from 'lucide-react'

type Step = 'password' | 'pin'

export default function SetPasswordPage() {
    const router = useRouter()
    const { login } = useAuthStore()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [step, setStep] = useState<Step>('password')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const e = sessionStorage.getItem('sirsheba_reg_email') || ''
        const n = sessionStorage.getItem('sirsheba_reg_name') || ''
        setEmail(e)
        setName(n)
        if (!e) router.push('/register')
    }, [router])

    const handlePasswordNext = () => {
        setError('')
        if (password !== confirmPassword) { setError('পাসওয়ার্ড মিলছে না'); return }
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            setError('পাসওয়ার্ড: ৮+ অক্ষর, একটি বড় হাতের অক্ষর, একটি সংখ্যা')
            return
        }
        setStep('pin')
    }

    const handleComplete = async () => {
        if (pin.length < 4) return
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, pin }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            login({ id: data.user.id, email: data.user.email, name: data.user.name, nameBn: data.user.name || '', phone: data.user.phone || '' })
            sessionStorage.removeItem('sirsheba_reg_email')
            sessionStorage.removeItem('sirsheba_reg_name')
            router.push('/welcome')
        } catch {
            setError('সংযোগ ব্যর্থ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6">
            {step === 'password' ? (
                <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">পাসওয়ার্ড সেট করুন</h2>
                    <p className="text-sm text-muted-foreground mb-6">মনে রাখবেন এবং সুরক্ষিত রাখুন</p>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pw">পাসওয়ার্ড</Label>
                            <div className="mt-1">
                                <PasswordInput id="pw" value={password} onChange={setPassword} showStrength placeholder="পাসওয়ার্ড লিখুন" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="cpw">পাসওয়ার্ড নিশ্চিত করুন</Label>
                            <div className="mt-1">
                                <PasswordInput id="cpw" value={confirmPassword} onChange={setConfirmPassword} placeholder="আবার লিখুন" />
                            </div>
                        </div>
                        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                        <Button onClick={handlePasswordNext} className="w-full h-11">পরবর্তী: PIN সেট করুন</Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Hash className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">PIN সেট করুন</h2>
                    <p className="text-sm text-muted-foreground mb-6">প্রতিদিন দ্রুত লগইনের জন্য</p>
                    <div className="flex justify-center mb-4">
                        <PINPad
                            value={pin}
                            onChange={setPin}
                            maxLength={6}
                            onSubmit={handleComplete}
                            disabled={loading}
                            label="৪-৬ সংখ্যার PIN বেছে নিন"
                        />
                    </div>
                    {loading && <div className="flex justify-center mt-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mt-3 text-center">{error}</p>}
                    <Button variant="ghost" onClick={() => setStep('password')} className="w-full mt-2">← ফিরে যান</Button>
                </>
            )}
        </Card>
    )
}
