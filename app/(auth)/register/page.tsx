'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { User, Phone, Mail, ArrowRight, Loader2 } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ full_name: '', phone: '', email: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            // Store email + name for next step
            sessionStorage.setItem('sirsheba_reg_email', form.email)
            sessionStorage.setItem('sirsheba_reg_name', form.full_name)
            // In dev mode (no Resend key), API returns the OTP directly
            if (data.devOtp) {
                sessionStorage.setItem('sirsheba_dev_otp', data.devOtp)
            }
            router.push('/verify-email')
        } catch {
            setError('সংযোগ ব্যর্থ। আবার চেষ্টা করুন।')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold mb-1">নতুন অ্যাকাউন্ট</h2>
            <p className="text-sm text-muted-foreground mb-6">আপনার তথ্য দিয়ে শুরু করুন</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">পুরো নাম *</Label>
                    <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="name"
                            placeholder="রহিম উদ্দিন"
                            value={form.full_name}
                            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="phone">মোবাইল নম্বর *</Label>
                    <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="email">ইমেইল *</Label>
                    <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="rahimuddin@gmail.com"
                            value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <><ArrowRight className="mr-2 h-4 w-4" />একাউন্ট তৈরি করুন</>
                    )}
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                আগেই অ্যাকাউন্ট আছে?{' '}
                <Link href="/login" className="text-primary font-medium">লগইন করুন</Link>
            </p>
        </Card>
    )
}
