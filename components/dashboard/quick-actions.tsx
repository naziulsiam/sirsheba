'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Plus, ClipboardList, Bell, FileText } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import type { TranslationKey } from '@/lib/translations'

const actions: { href: string; icon: React.ElementType; key: TranslationKey; color: string }[] = [
  {
    href: '/fees/quick',
    icon: Plus,
    key: 'collectFee',
    color: 'bg-primary text-primary-foreground',
  },
  {
    href: '/attendance',
    icon: ClipboardList,
    key: 'attendance',
    color: 'bg-chart-2 text-card',
  },
  {
    href: '/sms?template=fee-reminder',
    icon: Bell,
    key: 'sendSms',
    color: 'bg-warning text-warning-foreground',
  },
  {
    href: '/exams/new',
    icon: FileText,
    key: 'exams',
    color: 'bg-chart-5 text-card',
  },
]

export function QuickActions() {
  const { t } = useTranslation()

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        {t('quickActions')}
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
                {t(action.key)}
              </span>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
