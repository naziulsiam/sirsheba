'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStudents, useFeePayments } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber, BANGLA_MONTHS } from '@/lib/types'
import { ArrowLeft, Banknote, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

function FeeHistoryContent() {
  const searchParams = useSearchParams()
  const studentFilter = searchParams.get('student')

  const { students, getStudent, isHydrated: studentsHydrated } = useStudents()
  const { payments, isHydrated: paymentsHydrated } = useFeePayments()

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const isHydrated = studentsHydrated && paymentsHydrated

  if (!isHydrated) {
    return (
      <AppShell title="ফি ইতিহাস">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const filteredPayments = payments
    .filter(p => {
      if (studentFilter && p.studentId !== studentFilter) return false
      return p.month === selectedMonth && p.year === selectedYear
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(y => y - 1)
    } else {
      setSelectedMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(y => y + 1)
    } else {
      setSelectedMonth(m => m + 1)
    }
  }

  const student = studentFilter ? getStudent(studentFilter) : null

  return (
    <AppShell title={student ? `${student.nameBn} - ফি` : 'ফি ইতিহাস'}>
      <div className="p-4">
        <Link 
          href={studentFilter ? `/students/${studentFilter}` : '/'}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        {/* Month Selector */}
        <Card className="mb-4 p-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goToPrevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="font-semibold">
                {BANGLA_MONTHS[selectedMonth - 1]} {toBanglaNumber(selectedYear)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Summary */}
        <Card className="mb-4 bg-primary/5 border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট আয়</p>
              <p className="text-xl font-bold text-primary">{formatTaka(totalAmount)}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {toBanglaNumber(filteredPayments.length)} টি লেনদেন
          </p>
        </Card>

        {/* Payment List */}
        <div className="space-y-2">
          {filteredPayments.map((payment) => {
            const paymentStudent = getStudent(payment.studentId)
            return (
              <Card key={payment.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    {!studentFilter && (
                      <p className="font-medium">{paymentStudent?.nameBn || 'অজানা'}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.date).toLocaleDateString('bn-BD')}
                    </div>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatTaka(payment.amount)}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredPayments.length === 0 && (
          <div className="py-12 text-center">
            <Banknote className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              এই মাসে কোনো লেনদেন নেই
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default function FeeHistoryPage() {
  return (
    <Suspense fallback={
      <AppShell title="ফি ইতিহাস">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    }>
      <FeeHistoryContent />
    </Suspense>
  )
}
