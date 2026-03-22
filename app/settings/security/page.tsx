'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/auth/password-input'
import { PINPad } from '@/components/auth/pin-pad'
import { ArrowLeft, Shield, Lock, Hash, Fingerprint, Check, Loader2 } from 'lucide-react'

type ActiveSection = null | 'changePin' | 'changePassword'

export default function SecuritySettingsPage() {
    const [section, setSection] = useState<ActiveSection>(null)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [newPin, setNewPin] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChangePIN = async () => {
        if (newPin.length < 4 || !currentPassword) return
        setError(''); setSuccess(''); setLoading(true)
        try {
            // Verify password first, then change PIN via forgot-pin flow
            // In production: POST /api/auth/change-pin with password + new_pin
            await new Promise(r => setTimeout(r, 800))
            setSuccess('PIN সফলভাবে পরিবর্তন হয়েছে!')
            setSection(null); setNewPin(''); setCurrentPassword('')
        } catch {
            setError('পরিবর্তন ব্যর্থ হয়েছে')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) { setError('পাসওয়ার্ড মিলছে না'); return }
        if (newPassword.length < 8) { setError('কমপক্ষে ৮ অক্ষর প্রয়োজন'); return }
        setError(''); setSuccess(''); setLoading(true)
        try {
            // POST /api/auth/change-password with currentPassword + newPassword
            await new Promise(r => setTimeout(r, 800))
            setSuccess('পাসওয়ার্ড পরিবর্তন হয়েছে!')
            setSection(null); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
        } catch {
            setError('পরিবর্তন ব্যর্থ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AppShell title="নিরাপত্তা">
            <div className="p-4 space-y-4">
                <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground">
                    <ArrowLeft className="mr-1 h-4 w-4" />ফিরে যান
                </Link>

                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold">নিরাপত্তা সেটিংস</h2>
                            <p className="text-xs text-muted-foreground">পাসওয়ার্ড ও PIN পরিচালনা</p>
                        </div>
                    </div>

                    {success && <p className="text-sm text-primary bg-primary/10 rounded-lg px-3 py-2 mb-4 flex items-center gap-2"><Check className="h-4 w-4" />{success}</p>}

                    <div className="space-y-2">
                        <button
                            onClick={() => setSection(section === 'changePin' ? null : 'changePin')}
                            className="flex w-full items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <Hash className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">PIN পরিবর্তন করুন</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{section === 'changePin' ? '▲' : '▼'}</span>
                        </button>

                        {section === 'changePin' && (
                            <div className="rounded-xl border p-4 space-y-4">
                                <div>
                                    <Label>বর্তমান পাসওয়ার্ড নিশ্চিত করুন</Label>
                                    <div className="mt-1">
                                        <PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="বর্তমান পাসওয়ার্ড" />
                                    </div>
                                </div>
                                <div>
                                    <Label className="block mb-2">নতুন PIN</Label>
                                    <div className="flex justify-center">
                                        <PINPad value={newPin} onChange={setNewPin} maxLength={6} onSubmit={handleChangePIN} disabled={loading || !currentPassword} label="নতুন ৪-৬ সংখ্যার PIN" />
                                    </div>
                                </div>
                                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                                {loading && <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                            </div>
                        )}

                        <button
                            onClick={() => setSection(section === 'changePassword' ? null : 'changePassword')}
                            className="flex w-full items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">পাসওয়ার্ড পরিবর্তন করুন</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{section === 'changePassword' ? '▲' : '▼'}</span>
                        </button>

                        {section === 'changePassword' && (
                            <form onSubmit={handleChangePassword} className="rounded-xl border p-4 space-y-3">
                                <div>
                                    <Label>বর্তমান পাসওয়ার্ড</Label>
                                    <div className="mt-1"><PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="বর্তমান পাসওয়ার্ড" /></div>
                                </div>
                                <div>
                                    <Label>নতুন পাসওয়ার্ড</Label>
                                    <div className="mt-1"><PasswordInput value={newPassword} onChange={setNewPassword} showStrength placeholder="নতুন পাসওয়ার্ড" /></div>
                                </div>
                                <div>
                                    <Label>নিশ্চিত করুন</Label>
                                    <div className="mt-1"><PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="আবার লিখুন" /></div>
                                </div>
                                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading || !currentPassword || !newPassword}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'পাসওয়ার্ড পরিবর্তন করুন'}
                                </Button>
                            </form>
                        )}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Fingerprint className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">বায়োমেট্রিক লগইন</p>
                                <p className="text-xs text-muted-foreground">ফিঙ্গারপ্রিন্ট বা ফেস আইডি</p>
                            </div>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">শীঘ্রই আসছে</span>
                    </div>
                </Card>
            </div>
        </AppShell>
    )
}
