'use client'

import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { useStudents, useSMSLogs } from '@/hooks/use-store'
import { toBanglaNumber } from '@/lib/types'
import { ArrowLeft, MessageSquare, Check, Clock, X } from 'lucide-react'

export default function SMSHistoryPage() {
  const { getStudent, isHydrated: studentsHydrated } = useStudents()
  const { logs, isHydrated: logsHydrated } = useSMSLogs()

  const isHydrated = studentsHydrated && logsHydrated

  if (!isHydrated) {
    return (
      <AppShell title="SMS ইতিহাস">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-primary" />
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'পাঠানো হয়েছে'
      case 'pending':
        return 'পেন্ডিং'
      case 'failed':
        return 'ব্যর্থ'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-primary/10 text-primary'
      case 'pending':
        return 'bg-warning/10 text-warning-foreground'
      case 'failed':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const pendingCount = logs.filter(l => l.status === 'pending').length
  const sentCount = logs.filter(l => l.status === 'sent').length

  return (
    <AppShell title="SMS ইতিহাস">
      <div className="p-4">
        <Link href="/sms" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        {/* Summary */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card className="bg-warning/10 border-0 p-3 text-center">
            <Clock className="mx-auto h-5 w-5 text-warning-foreground" />
            <p className="text-xl font-bold">{toBanglaNumber(pendingCount)}</p>
            <p className="text-xs text-muted-foreground">পেন্ডিং</p>
          </Card>
          <Card className="bg-primary/10 border-0 p-3 text-center">
            <Check className="mx-auto h-5 w-5 text-primary" />
            <p className="text-xl font-bold">{toBanglaNumber(sentCount)}</p>
            <p className="text-xs text-muted-foreground">পাঠানো</p>
          </Card>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          {sortedLogs.map((log) => {
            const student = getStudent(log.studentId)
            return (
              <Card key={log.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chart-5/10">
                    <MessageSquare className="h-5 w-5 text-chart-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">
                        {student?.nameBn || 'অজানা'}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {getStatusText(log.status)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {log.recipientPhone}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {log.content}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(log.sentAt).toLocaleString('bn-BD')}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {sortedLogs.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              কোনো SMS ইতিহাস নেই
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
