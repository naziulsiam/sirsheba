'use client'

import { AppShell } from '@/components/app-shell'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { PendingFees } from '@/components/dashboard/pending-fees'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-4">
        {/* Summary Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <QuickActions />

        {/* Pending Fees Alert */}
        <PendingFees />

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </AppShell>
  )
}
