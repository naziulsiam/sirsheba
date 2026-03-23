import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const status = await db.checkSubscriptionStatus(session.sub)
        
        return NextResponse.json({
            status: status.status,
            expiryDate: status.expiryDate,
            daysRemaining: status.daysRemaining,
            plan: status.status === 'active' ? 'pro' : 'free', // Simplified
        })
    } catch (err) {
        console.error('Subscription check error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
