'use client'

import { BottomNav } from './bottom-nav'
import { GraduationCap, CheckCircle2, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
}

export function AppShell({ children, title }: AppShellProps) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">
              <GraduationCap className="h-5 w-5" />
              <CheckCircle2 className="h-3 w-3 -ml-1 -mt-2" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                {title || 'SirSheba'}
              </h1>
              {!title && (
                <p className="text-[10px] leading-tight opacity-80">
                  আপনার টিউশন, স্মার্টভাবে
                </p>
              )}
            </div>
          </div>
          
          {/* Online/Offline indicator */}
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            isOnline ? 'bg-primary-foreground/20' : 'bg-destructive/20'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>অনলাইন</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>অফলাইন</span>
              </>
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
