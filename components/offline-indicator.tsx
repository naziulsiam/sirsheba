'use client'

import { useOfflineQueue } from '@/hooks/use-offline-queue'
import { WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toBanglaNumber } from '@/lib/types'

export function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, sync } = useOfflineQueue()

  if (isOnline && pendingCount === 0) return null

  return (
    <div className={`fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 transition-all ${
      isOnline ? 'translate-y-0' : 'translate-y-0'
    }`}>
      <div className={`
        rounded-lg px-4 py-3 shadow-lg border
        ${isOnline 
          ? 'bg-chart-5/95 border-chart-5 text-white' 
          : 'bg-destructive/95 border-destructive text-destructive-foreground'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isOnline ? 'bg-white/20' : 'bg-white/20'}
            `}>
              {isOnline ? (
                <Cloud className="w-5 h-5" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">
                {isOnline ? 'সিঙ্ক করছে...' : 'অফলাইন মোড'}
              </p>
              <p className="text-xs opacity-90">
                {pendingCount > 0 
                  ? `${toBanglaNumber(pendingCount)}টি কাজ অপেক্ষমাণ`
                  : 'সব কাজ সিঙ্ক হয়েছে'
                }
              </p>
            </div>
          </div>

          {isOnline && pendingCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={sync}
              disabled={isSyncing}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {!isOnline && (
            <CloudOff className="w-5 h-5 opacity-60" />
          )}
        </div>

        {/* Progress bar for pending items */}
        {pendingCount > 0 && (
          <div className="mt-2 h-1 bg-black/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isSyncing ? 'animate-pulse' : ''}`}
              style={{
                width: isSyncing ? '60%' : '30%',
                backgroundColor: 'currentColor',
                opacity: 0.5
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
