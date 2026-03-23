'use client'

import { Card } from '@/components/ui/card'
import { useStudents, useFeePayments, useAttendance, useSMSLogs } from '@/hooks/use-store'
import { formatTaka, formatNumber } from '@/lib/types'
import { Banknote, AlertTriangle, Users, MessageSquare } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export function DashboardStats() {
  const { students, isHydrated: studentsHydrated } = useStudents()
  const { getTodaysPayments, payments, isHydrated: paymentsHydrated } = useFeePayments()
  const { getDateAttendance, isHydrated: attendanceHydrated } = useAttendance()
  const { getPendingLogs, isHydrated: smsHydrated } = useSMSLogs()
  const { t, lang } = useTranslation()

  const isHydrated = studentsHydrated && paymentsHydrated && attendanceHydrated && smsHydrated

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-24 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  const todaysPayments = getTodaysPayments()
  const todaysTotal = todaysPayments.reduce((sum, p) => sum + p.amount, 0)

  const today = new Date().toISOString().split('T')[0]
  const todaysAttendance = getDateAttendance(today)
  const activeStudents = students.filter(s => s.active)
  const presentCount = todaysAttendance.filter(a => a.status === 'present').length
  const attendancePercent = activeStudents.length > 0
    ? Math.round((presentCount / activeStudents.length) * 100)
    : 0

  // Calculate pending fees - students who haven't paid this month
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const paidStudentIds = payments
    .filter(p => p.month === currentMonth && p.year === currentYear)
    .map(p => p.studentId)
  const pendingCount = activeStudents.filter(s => !paidStudentIds.includes(s.id)).length

  const pendingSMS = getPendingLogs().length

  const stats = [
    {
      label: t('todaysCash'),
      value: formatTaka(todaysTotal, lang),
      subtext: `${formatNumber(todaysPayments.length, lang)} ${t('persons')} ${t('from')}`,
      icon: Banknote,
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      iconColor: 'text-primary',
    },
    {
      label: t('pendingFees'),
      value: `${formatNumber(pendingCount, lang)} ${t('persons')}`,
      subtext: t('thisMonth'),
      icon: AlertTriangle,
      bgColor: pendingCount > 0 ? 'bg-destructive/10' : 'bg-muted',
      textColor: pendingCount > 0 ? 'text-destructive' : 'text-muted-foreground',
      iconColor: pendingCount > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      label: t('todaysAttendance'),
      value: `${formatNumber(attendancePercent, lang)}%`,
      subtext: `${formatNumber(presentCount, lang)}/${formatNumber(activeStudents.length, lang)} ${t('persons')}`,
      icon: Users,
      bgColor: 'bg-chart-2/10',
      textColor: 'text-chart-2',
      iconColor: 'text-chart-2',
    },
    {
      label: t('pendingSms'),
      value: formatNumber(pendingSMS, lang),
      subtext: t('sentRemaining'),
      icon: MessageSquare,
      bgColor: 'bg-chart-5/10',
      textColor: 'text-chart-5',
      iconColor: 'text-chart-5',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className={`${stat.bgColor} rounded-2xl shadow-card p-4 border border-border/40`}>
            <div className="flex items-start justify-between mb-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${stat.textColor}`}>
              {stat.value}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{stat.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}
