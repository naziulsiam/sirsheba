'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/auth/password-input'
import { useAuthStore } from '@/store/auth-store'
import { Loader2, Lock } from 'lucide-react'

function LoginPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuthStore()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const id = sessionStorage.getItem('sirsheba_login_id')
        if (!id) { router.push('/login'); return }
        setIdentifier(id)
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            login({ id: data.user.id, email: data.user.email, name: data.user.name, nameBn: data.user.name || '', phone: data.user.phone, role: data.user.role })
            sessionStorage.removeItem('sirsheba_login_id')

            // Redirect based on role
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">পাসওয়ার্ড দিন</h2>
            <p className="text-sm text-muted-foreground mb-6">
                {identifier && <span className="font-medium text-foreground">{identifier}</span>}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="pw">পাসওয়ার্ড</Label>
                    <div className="mt-1">
                        <PasswordInput id="pw" value={password} onChange={setPassword} />
                    </div>
                </div>

                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

                <Button type="submit" className="w-full h-11" disabled={loading || !password}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'লগইন করুন'}
                </Button>
            </form>

            <div className="mt-4 space-y-2 text-center text-sm">
                <Link href="/login/pin" className="block text-muted-foreground">← PIN দিয়ে লগইন</Link>
                <Link href="/forgot-pin" className="block text-primary">পাসওয়ার্ড রিসেট করুন</Link>
            </div>
        </Card>
    )
}

export default function LoginPasswordPage() {
    return (
        <Suspense fallback={<Card className="p-6 h-64 animate-pulse bg-muted" />}>
            <LoginPasswordContent />
        </Suspense>
    )
}
