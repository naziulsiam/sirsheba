'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSMSLogs } from './use-store'

export interface QueueItem {
  id: string
  type: 'sms' | 'payment' | 'attendance'
  description: string
  createdAt: string
  data: unknown
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const { logs: smsLogs, updateLogStatus } = useSMSLogs()

  useEffect(() => {
    // Track online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Build queue from pending SMS logs and other offline actions
    const pendingSMS = smsLogs
      .filter(log => log.status === 'pending')
      .map(log => ({
        id: log.id,
        type: 'sms' as const,
        description: `SMS to ${log.recipientPhone}`,
        createdAt: log.sentAt,
        data: log,
      }))

    setQueue(pendingSMS)
  }, [smsLogs])

  const sync = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isSyncing) return

    setIsSyncing(true)

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mark all pending as sent (mock)
    queue.forEach(item => {
      if (item.type === 'sms') {
        updateLogStatus(item.id, 'sent')
      }
    })

    setIsSyncing(false)
  }, [isOnline, queue, isSyncing, updateLogStatus])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      sync()
    }
  }, [isOnline, queue.length, sync])

  const pendingCount = queue.length

  return {
    isOnline,
    queue,
    pendingCount,
    isSyncing,
    sync,
  }
}
