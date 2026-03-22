'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStudents, useFeePayments, useBatches } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber } from '@/lib/types'
import { AlertTriangle, ChevronRight, Phone } from 'lucide-react'

export function PendingFees() {
  const { students, isHydrated: studentsHydrated } = useStudents()
  const { payments, isHydrated: paymentsHydrated } = useFeePayments()
  const { getBatch, isHydrated: batchesHydrated } = useBatches()

  const isHydrated = studentsHydrated && paymentsHydrated && batchesHydrated

  if (!isHydrated) {
    return (
      <Card className="animate-pulse bg-muted p-4">
        <div className="h-32" />
      </Card>
    )
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  // Get students with pending fees
  const paidStudentIds = payments
    .filter(p => p.month === currentMonth && p.year === currentYear)
    .map(p => p.studentId)
  
  // Calculate partial payments
  const partialPayments = new Map<string, number>()
  payments
    .filter(p => p.month === currentMonth && p.year === currentYear)
    .forEach(p => {
      const current = partialPayments.get(p.studentId) || 0
      partialPayments.set(p.studentId, current + p.amount)
    })

  const pendingStudents = students
    .filter(s => s.active)
    .map(s => {
      const paid = partialPayments.get(s.id) || 0
      const pending = s.monthlyFee - paid
      const lastPayment = payments
        .filter(p => p.studentId === s.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      
      const daysSincePayment = lastPayment 
        ? Math.floor((Date.now() - new Date(lastPayment.date).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      return {
        ...s,
        pending,
        daysSincePayment,
        batch: getBatch(s.batchId),
      }
    })
    .filter(s => s.pending > 0)
    .sort((a, b) => b.daysSincePayment - a.daysSincePayment)

  const totalPending = pendingStudents.reduce((sum, s) => sum + s.pending, 0)

  if (pendingStudents.length === 0) {
    return (
      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-primary">সব ফি পরিশোধিত!</p>
            <p className="text-xs text-muted-foreground">এই মাসে কোনো বকেয়া নেই</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-destructive/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-destructive">
              বকেয়া ফি
            </h2>
            <p className="text-xs text-muted-foreground">
              মোট: {formatTaka(totalPending)}
            </p>
          </div>
        </div>
        <Link href="/fees/pending">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            সব দেখুন
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {pendingStudents.slice(0, 3).map((student) => (
          <Link
            key={student.id}
            href={`/students/${student.id}`}
            className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 transition-colors active:bg-muted"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-destructive/10 text-destructive text-sm">
                {student.nameBn.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{student.nameBn}</p>
              <p className="text-xs text-muted-foreground">
                {student.batch?.name || 'ব্যাচ নেই'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-destructive">
                {formatTaka(student.pending)}
              </p>
              {student.daysSincePayment > 30 && (
                <span className="inline-flex items-center rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                  {toBanglaNumber(student.daysSincePayment)} দিন
                </span>
              )}
            </div>
            <a
              href={`tel:${student.fatherPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <Phone className="h-4 w-4" />
            </a>
          </Link>
        ))}
      </div>
    </Card>
  )
}
