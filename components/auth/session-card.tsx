'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, Monitor, Tablet, LogOut, MapPin } from 'lucide-react'

interface Session {
    id: string
    device: string
    ip: string
    lastActive: string
    current?: boolean
}

interface SessionCardProps {
    session: Session
    onRevoke: (id: string) => void
    isRevoking?: boolean
}

function DeviceIcon({ device }: { device: string }) {
    const lower = device.toLowerCase()
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
        return <Smartphone className="h-5 w-5" />
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
        return <Tablet className="h-5 w-5" />
    }
    return <Monitor className="h-5 w-5" />
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
    const lastActive = new Date(session.lastActive)
    const now = new Date()
    const diffMs = now.getTime() - lastActive.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    const timeAgo = diffMins < 1
        ? 'এইমাত্র'
        : diffMins < 60
            ? `${diffMins} মিনিট আগে`
            : diffHours < 24
                ? `${diffHours} ঘন্টা আগে`
                : `${diffDays} দিন আগে`

    return (
        <Card className={`p-4 ${session.current ? 'border-primary/40 bg-primary/5' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${session.current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                    <DeviceIcon device={session.device} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{session.device}</p>
                        {session.current && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                                এই ডিভাইস
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {session.ip}
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    </div>
                </div>
                {!session.current && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRevoke(session.id)}
                        disabled={isRevoking}
                        className="text-destructive hover:text-destructive shrink-0"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </Card>
    )
}
