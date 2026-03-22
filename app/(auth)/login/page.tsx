'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Phone, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [identifier, setIdentifier] = useState('')
    const [error, setError] = useState('')

    const handleNext = () => {
        if (!identifier.trim()) { setError('ইমেইল বা ফোন নম্বর দিন'); return }
        sessionStorage.setItem('sirsheba_login_id', identifier)
        router.push('/login/pin')
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold mb-1">লগইন</h2>
            <p className="text-sm text-muted-foreground mb-6">আপনার ইমেইল বা ফোন নম্বর দিন</p>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="identifier">ইমেইল / ফোন নম্বর</Label>
                    <div className="relative mt-1">
                        {identifier.includes('@')
                            ? <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            : <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        }
                        <Input
                            id="identifier"
                            type="text"
                            placeholder="01XXXXXXXXX বা email@gmail.com"
                            value={identifier}
                            onChange={e => { setIdentifier(e.target.value); setError('') }}
                            onKeyDown={e => e.key === 'Enter' && handleNext()}
                            className="pl-10"
                            autoFocus
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

                <Button onClick={handleNext} className="w-full h-11">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    পরবর্তী
                </Button>
            </div>

            <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
                <p>
                    <Link href="/forgot-pin" className="text-primary">PIN ভুলে গেছেন?</Link>
                </p>
                <p>
                    অ্যাকাউন্ট নেই?{' '}
                    <Link href="/register" className="text-primary font-medium">নিবন্ধন করুন</Link>
                </p>
            </div>
        </Card>
    )
}
