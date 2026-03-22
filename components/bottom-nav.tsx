'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Plus, MessageSquare, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'হোম', labelEn: 'Home' },
  { href: '/students', icon: Users, label: 'শিক্ষার্থী', labelEn: 'Students' },
  { href: '/fees/quick', icon: Plus, label: 'ক্যাশ', labelEn: 'Cash', isMain: true },
  { href: '/sms', icon: MessageSquare, label: 'SMS', labelEn: 'SMS' },
  { href: '/settings', icon: Menu, label: 'মেনু', labelEn: 'Menu' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6 flex flex-col items-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="mt-1 text-xs font-medium text-primary">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[60px] flex-col items-center gap-1 py-2 transition-colors touch-target',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
