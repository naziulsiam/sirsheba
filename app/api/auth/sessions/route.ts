import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// Mock sessions store - in production use Supabase login_sessions table
const sessions = new Map<string, { id: string; device: string; ip: string; lastActive: string; current: boolean }[]>()

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Return mock sessions for this user
    const userSessions = sessions.get(session.sub) || [
        {
            id: 'current',
            device: 'Current Device',
            ip: '127.0.0.1',
            lastActive: new Date().toISOString(),
            current: true,
        },
    ]

    return NextResponse.json({ sessions: userSessions })
}

export async function DELETE(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId } = await req.json()
    if (sessionId === 'current') {
        return NextResponse.json({ error: 'বর্তমান সেশন মুছতে পারবেন না' }, { status: 400 })
    }

    // Remove session from store
    const userSessions = sessions.get(session.sub) || []
    sessions.set(session.sub, userSessions.filter(s => s.id !== sessionId))

    return NextResponse.json({ success: true })
}
