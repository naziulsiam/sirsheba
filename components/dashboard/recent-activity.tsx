'use client'

import { Card } from '@/components/ui/card'
import { useStudents, useFeePayments, useAttendance, useSMSLogs } from '@/hooks/use-store'
import { formatTaka, formatNumber, BANGLA_MONTHS, ENGLISH_MONTHS } from '@/lib/types'
import { Banknote, UserCheck, UserX, MessageSquare } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

interface Activity {
  id: string
  type: 'payment' | 'attendance_present' | 'attendance_absent' | 'sms' | 'new_student'
  studentName: string
  description: string
  timestamp: Date
  icon: typeof Banknote
  iconBg: string
  iconColor: string
}

export function RecentActivity() {
  const { students, isHydrated: studentsHydrated } = useStudents()
  const { payments, isHydrated: paymentsHydrated } = useFeePayments()
  const { attendance, isHydrated: attendanceHydrated } = useAttendance()
  const { logs, isHydrated: smsHydrated } = useSMSLogs()
  const { t, lang } = useTranslation()

  const isHydrated = studentsHydrated && paymentsHydrated && attendanceHydrated && smsHydrated

  if (!isHydrated) {
    return (
      <Card className="animate-pulse bg-muted p-4">
        <div className="h-48" />
      </Card>
    )
  }

  const getStudentName = (id: string) => {
    const student = students.find(s => s.id === id)
    if (!student) return t('error')
    return lang === 'bn' ? student.nameBn : student.nameEn
  }

  const activities: Activity[] = []

  // Add payments
  payments.forEach(p => {
    const monthName = lang === 'bn' ? BANGLA_MONTHS[p.month - 1] : ENGLISH_MONTHS[p.month - 1]
    activities.push({
      id: `payment-${p.id}`,
      type: 'payment',
      studentName: getStudentName(p.studentId),
      description: `${formatTaka(p.amount, lang)} ${t('paid')} (${monthName})`,
      timestamp: new Date(p.date),
      icon: Banknote,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    })
  })

  // Add attendance
  attendance.forEach(a => {
    activities.push({
      id: `attendance-${a.id}`,
      type: a.status === 'present' ? 'attendance_present' : 'attendance_absent',
      studentName: getStudentName(a.studentId),
      description: a.status === 'present' ? t('present') : t('absent'),
      timestamp: new Date(a.date),
      icon: a.status === 'present' ? UserCheck : UserX,
      iconBg: a.status === 'present' ? 'bg-primary/10' : 'bg-destructive/10',
      iconColor: a.status === 'present' ? 'text-primary' : 'text-destructive',
    })
  })

  // Add SMS logs
  logs.forEach(l => {
    activities.push({
      id: `sms-${l.id}`,
      type: 'sms',
      studentName: getStudentName(l.studentId),
      description: l.status === 'sent' ? t('success') : t('loading'),
      timestamp: new Date(l.sentAt),
      icon: MessageSquare,
      iconBg: 'bg-chart-5/10',
      iconColor: 'text-chart-5',
    })
  })

  // Sort by timestamp and take recent 10
  const recentActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return lang === 'bn' ? 'এইমাত্র' : 'Just now'
    if (minutes < 60) return `${formatNumber(minutes, lang)} ${lang === 'bn' ? 'মিনিট আগে' : 'min ago'}`
    if (hours < 24) return `${formatNumber(hours, lang)} ${lang === 'bn' ? 'ঘণ্টা আগে' : 'hours ago'}`
    if (days < 7) return `${formatNumber(days, lang)} ${lang === 'bn' ? 'দিন আগে' : 'days ago'}`
    return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')
  }

  if (recentActivities.length === 0) {
    return (
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t('recentActivity')}
        </h2>
        <p className="text-center text-sm text-muted-foreground py-8">
          {t('noActivity')}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        {t('recentActivity')}
      </h2>
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}>
                <Icon className={`h-4 w-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.studentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                {formatTime(activity.timestamp)}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
