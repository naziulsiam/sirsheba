'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { SessionCard } from '@/components/auth/session-card'
import { ArrowLeft, Loader2, Shield } from 'lucide-react'

interface Session {
    id: string
    device: string
    ip: string
    lastActive: string
    current?: boolean
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [revoking, setRevoking] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/auth/sessions')
            .then(r => r.json())
            .then(d => setSessions(d.sessions || []))
            .finally(() => setLoading(false))
    }, [])

    const handleRevoke = async (sessionId: string) => {
        setRevoking(sessionId)
        try {
            await fetch('/api/auth/sessions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            })
            setSessions(prev => prev.filter(s => s.id !== sessionId))
        } finally {
            setRevoking(null)
        }
    }

    return (
        <AppShell title="সক্রিয় সেশন">
            <div className="p-4 space-y-4">
                <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground">
                    <ArrowLeft className="mr-1 h-4 w-4" />ফিরে যান
                </Link>

                <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                        আপনি যে ডিভাইসগুলো থেকে লগইন করেছেন তার তালিকা
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map(session => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onRevoke={handleRevoke}
                                isRevoking={revoking === session.id}
                            />
                        ))}
                        {sessions.length === 0 && (
                            <p className="text-center py-8 text-muted-foreground text-sm">কোনো সক্রিয় সেশন নেই</p>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    )
}
