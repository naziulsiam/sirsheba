'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Plus, MessageSquare, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import type { TranslationKey } from '@/lib/translations'

const navItems: { href: string; icon: React.ElementType; key: TranslationKey; isMain?: boolean }[] = [
  { href: '/', icon: Home, key: 'home' },
  { href: '/students', icon: Users, key: 'students' },
  { href: '/fees/quick', icon: Plus, key: 'cash', isMain: true },
  { href: '/sms', icon: MessageSquare, key: 'sms' },
  { href: '/settings', icon: LayoutGrid, key: 'menu' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/40 pb-safe shadow-elevated">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          const label = t(item.key)

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-5 flex flex-col items-center gap-0.5 press"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-elevated">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="mt-0.5 text-[10px] font-semibold text-primary">{label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[60px] flex-col items-center gap-1 py-1.5 transition-all press touch-target',
                isActive ? 'text-primary' : 'text-muted-foreground/70'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                isActive ? 'bg-primary/10' : ''
              )}>
                <Icon className={cn('h-5 w-5 transition-all', isActive && 'scale-110')} />
              </div>
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
