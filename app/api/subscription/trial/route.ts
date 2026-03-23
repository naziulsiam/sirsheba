import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user already had a trial
        const tutor = await db.findTutorById(session.sub)
        if (!tutor) {
            return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
        }

        // Check if already has active subscription
        const status = await db.checkSubscriptionStatus(session.sub)
        if (status.status === 'active' || status.status === 'trial') {
            return NextResponse.json({ error: 'Already has active subscription' }, { status: 400 })
        }

        // Start 14-day trial
        await db.startTrial(session.sub, 14)

        return NextResponse.json({ success: true, message: 'Trial started' })
    } catch (err) {
        console.error('Trial start error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
