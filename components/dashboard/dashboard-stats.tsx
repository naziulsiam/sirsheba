'use client'

import { Card } from '@/components/ui/card'
import { useStudents, useFeePayments, useAttendance, useSMSLogs } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber } from '@/lib/types'
import { Banknote, AlertTriangle, Users, MessageSquare } from 'lucide-react'

export function DashboardStats() {
  const { students, isHydrated: studentsHydrated } = useStudents()
  const { getTodaysPayments, payments, isHydrated: paymentsHydrated } = useFeePayments()
  const { getDateAttendance, isHydrated: attendanceHydrated } = useAttendance()
  const { getPendingLogs, isHydrated: smsHydrated } = useSMSLogs()

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
      label: 'আজকের আয়',
      labelEn: "Today's Cash",
      value: formatTaka(todaysTotal),
      subtext: `${toBanglaNumber(todaysPayments.length)} জন থেকে`,
      icon: Banknote,
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      iconColor: 'text-primary',
    },
    {
      label: 'বকেয়া ফি',
      labelEn: 'Pending Fees',
      value: `${toBanglaNumber(pendingCount)} জন`,
      subtext: 'এই মাসে',
      icon: AlertTriangle,
      bgColor: pendingCount > 0 ? 'bg-destructive/10' : 'bg-muted',
      textColor: pendingCount > 0 ? 'text-destructive' : 'text-muted-foreground',
      iconColor: pendingCount > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      label: 'আজকের উপস্থিতি',
      labelEn: "Today's Attendance",
      value: `${toBanglaNumber(attendancePercent)}%`,
      subtext: `${toBanglaNumber(presentCount)}/${toBanglaNumber(activeStudents.length)} জন`,
      icon: Users,
      bgColor: 'bg-chart-2/10',
      textColor: 'text-chart-2',
      iconColor: 'text-chart-2',
    },
    {
      label: 'পেন্ডিং SMS',
      labelEn: 'Pending SMS',
      value: toBanglaNumber(pendingSMS),
      subtext: 'পাঠানো বাকি',
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
          <Card key={stat.label} className={`${stat.bgColor} border-0 p-3`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {stat.subtext}
                </p>
              </div>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
