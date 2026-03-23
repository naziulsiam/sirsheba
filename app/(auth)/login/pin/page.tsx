'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PINPad } from '@/components/auth/pin-pad'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'

function LoginPINContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuthStore()
    const [identifier, setIdentifier] = useState('')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [attempts, setAttempts] = useState(3)

    useEffect(() => {
        const id = sessionStorage.getItem('sirsheba_login_id')
        if (!id) { router.push('/login'); return }
        setIdentifier(id)
    }, [router])

    const handleSubmit = async () => {
        if (pin.length < 4) return
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, pin }),
            })
            const data = await res.json()
            if (!res.ok) {
                setPin('')
                if (data.locked) { setError(data.error); return }
                setAttempts(data.remaining ?? attempts - 1)
                setError(data.error)
                return
            }
            login({ 
                id: data.user.id, 
                email: data.user.email, 
                name: data.user.name, 
                nameBn: data.user.name || '', 
                phone: data.user.phone, 
                role: data.user.role,
                subscription: data.user.subscription,
                subscriptionExpiry: data.user.subscriptionExpiry,
            })
            sessionStorage.removeItem('sirsheba_login_id')

            // Redirect based on role using hard navigation to ensure middleware sees new cookie immediately
            const from = searchParams.get('from')
            if (from) {
                window.location.href = from
            } else if (data.user.role === 'admin') {
                window.location.href = '/admin'
            } else {
                window.location.href = '/'
            }
        } catch {
            setError('সংযোগ ব্যর্থ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-1">PIN দিন</h2>
                <p className="text-sm text-muted-foreground">
                    {identifier && <span className="font-medium text-foreground">{identifier}</span>}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex justify-center">
                    <PINPad
                        value={pin}
                        onChange={setPin}
                        maxLength={6}
                        onSubmit={handleSubmit}
                        disabled={loading}
                    />
                </div>
            )}

            {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mt-4 text-center">
                    {error}
                </p>
            )}

            <div className="mt-4 space-y-2 text-center text-sm">
                <Link href="/login/password" className="block text-muted-foreground hover:text-foreground">
                    পাসওয়ার্ড দিয়ে লগইন করুন
                </Link>
                <Link href="/forgot-pin" className="block text-primary">PIN ভুলে গেছেন?</Link>
                <Link href="/login" className="block text-muted-foreground">← ফিরে যান</Link>
            </div>
        </Card>
    )
}

export default function LoginPINPage() {
    return (
        <Suspense fallback={<Card className="p-6 h-64 animate-pulse bg-muted" />}>
            <LoginPINContent />
        </Suspense>
    )
}
