'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/auth/password-input'
import { ArrowLeft, Mail, Phone, Check, Loader2 } from 'lucide-react'

export default function ContactSettingsPage() {
    const [password, setPassword] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPhone, setNewPhone] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) { setError('পাসওয়ার্ড প্রয়োজন'); return }
        if (!newEmail && !newPhone) { setError('ইমেইল বা ফোন দিন'); return }

        setError(''); setLoading(true)
        try {
            // In production: PATCH /api/auth/contact { password, newEmail, newPhone }
            // Verified via OTP to new email/phone before saving
            await new Promise(r => setTimeout(r, 800))
            setSuccess(newEmail ? 'ইমেইল আপডেট করা হয়েছে! যাচাই করুন।' : 'ফোন আপডেট করা হয়েছে!')
            setNewEmail(''); setNewPhone(''); setPassword('')
        } catch {
            setError('আপডেট ব্যর্থ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AppShell title="যোগাযোগ তথ্য">
            <div className="p-4 space-y-4">
                <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground">
                    <ArrowLeft className="mr-1 h-4 w-4" />ফিরে যান
                </Link>

                <Card className="p-4">
                    <h2 className="font-semibold mb-1">ইমেইল / ফোন পরিবর্তন</h2>
                    <p className="text-xs text-muted-foreground mb-4">পরিবর্তনের জন্য পাসওয়ার্ড এবং OTP যাচাই প্রয়োজন</p>

                    {success && (
                        <p className="text-sm text-primary bg-primary/10 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                            <Check className="h-4 w-4" />{success}
                        </p>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <Label htmlFor="pw">বর্তমান পাসওয়ার্ড *</Label>
                            <div className="mt-1">
                                <PasswordInput id="pw" value={password} onChange={setPassword} placeholder="আপনার পাসওয়ার্ড নিশ্চিত করুন" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">নতুন ইমেইল</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" type="email" placeholder="নতুন ইমেইল (ঐচ্ছিক)"
                                    value={newEmail} onChange={e => setNewEmail(e.target.value)} className="pl-10" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phone">নতুন ফোন নম্বর</Label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="phone" type="tel" placeholder="01XXXXXXXXX (ঐচ্ছিক)"
                                    value={newPhone} onChange={e => setNewPhone(e.target.value)} className="pl-10" />
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'আপডেট করুন'}
                        </Button>
                    </form>
                </Card>
            </div>
        </AppShell>
    )
}
