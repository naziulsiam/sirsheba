'use client'

import { BottomNav } from './bottom-nav'
import { LanguageToggle } from './language-toggle'
import { GraduationCap, Wifi, WifiOff, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/use-translation'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
}

export function AppShell({ children, title }: AppShellProps) {
  const [isOnline, setIsOnline] = useState(true)
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const isHome = !title

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 gradient-primary shadow-elevated">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            {isHome ? (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-sm">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-[17px] font-bold leading-tight text-white tracking-tight">
                    {t('appName')}
                  </h1>
                  <p className="text-[10px] leading-tight text-white/75">
                    {t('appTagline')}
                  </p>
                </div>
              </>
            ) : (
              <h1 className="text-[17px] font-bold text-white tracking-tight">{title}</h1>
            )}
          </div>

          {/* Right side: connectivity + settings */}
          <div className="flex items-center gap-2">
            {/* Online indicator */}
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${isOnline
              ? 'bg-white/15 text-white'
              : 'bg-red-500/30 text-white'
              }`}>
              {isOnline
                ? <><Wifi className="h-3 w-3" /><span className="hidden xs:inline">{t('online')}</span></>
                : <><WifiOff className="h-3 w-3" /><span>{t('offline')}</span></>
              }
            </div>

            {/* Language toggle — always visible */}
            <LanguageToggle />

            {/* Settings shortcut on home */}
            {isHome && (
              <button 
                onClick={() => router.push('/settings')}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
