'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Plus, ClipboardList, Bell, FileText } from 'lucide-react'

const actions = [
  {
    href: '/fees/quick',
    icon: Plus,
    label: 'ক্যাশ এন্ট্রি',
    labelEn: 'Cash Entry',
    color: 'bg-primary text-primary-foreground',
  },
  {
    href: '/attendance',
    icon: ClipboardList,
    label: 'উপস্থিতি',
    labelEn: 'Attendance',
    color: 'bg-chart-2 text-card',
  },
  {
    href: '/sms?template=fee-reminder',
    icon: Bell,
    label: 'ফি স্মরণ',
    labelEn: 'Fee Reminder',
    color: 'bg-warning text-warning-foreground',
  },
  {
    href: '/exams/new',
    icon: FileText,
    label: 'নতুন পরীক্ষা',
    labelEn: 'New Exam',
    color: 'bg-chart-5 text-card',
  },
]

export function QuickActions() {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        দ্রুত কাজ
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-lg p-2 transition-transform active:scale-95"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-center text-[10px] font-medium text-muted-foreground leading-tight">
                {action.label}
              </span>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
