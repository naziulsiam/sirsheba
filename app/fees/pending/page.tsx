'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useStudents, useBatches, useFeePayments, useAttendance } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber, BANGLA_MONTHS } from '@/lib/types'
import { ArrowLeft, AlertTriangle, Phone, MessageSquare, Banknote, Bell, UserCheck, UserX, Calendar, ChevronRight, Clock } from 'lucide-react'

export default function PendingFeesPage() {
  const { students, isHydrated: studentsHydrated } = useStudents()
  const { getBatch, isHydrated: batchesHydrated } = useBatches()
  const { payments, isHydrated: paymentsHydrated, getStudentPayments } = useFeePayments()
  const { getStudentAttendance, isHydrated: attendanceHydrated } = useAttendance()

  const [selectedStudent, setSelectedStudent] = useState<typeof pendingStudents[0] | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const isHydrated = studentsHydrated && batchesHydrated && paymentsHydrated && attendanceHydrated

  if (!isHydrated) {
    return (
      <AppShell title="বকেয়া ফি">
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-20 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Calculate pending for each student
  const pendingStudents = students
    .filter(s => s.active)
    .map(s => {
      const studentPayments = payments.filter(
        p => p.studentId === s.id && p.month === currentMonth && p.year === currentYear
      )
      const paidAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0)
      const pending = s.monthlyFee - paidAmount

      // Calculate days since last payment
      const allPayments = payments.filter(p => p.studentId === s.id)
      const lastPayment = allPayments.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]
      const daysSincePayment = lastPayment
        ? Math.floor((Date.now() - new Date(lastPayment.date).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      return {
        ...s,
        pending,
        paidAmount,
        daysSincePayment,
        batch: getBatch(s.batchId),
      }
    })
    .filter(s => s.pending > 0)
    .sort((a, b) => b.daysSincePayment - a.daysSincePayment)

  const totalPending = pendingStudents.reduce((sum, s) => sum + s.pending, 0)

  const handleShowHistory = (student: typeof pendingStudents[0]) => {
    setSelectedStudent(student)
    setShowHistory(true)
  }

  return (
    <AppShell title="বকেয়া ফি">
      <div className="p-4">
        <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        {/* Summary */}
        <Card className="mb-4 border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট বকেয়া</p>
              <p className="text-2xl font-bold text-destructive">{formatTaka(totalPending)}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {toBanglaNumber(pendingStudents.length)} জন শিক্ষার্থী
            </p>
            <Link href="/sms?template=fee-reminder&bulk=true">
              <Button size="sm" variant="destructive">
                <Bell className="mr-1 h-4 w-4" />
                সবাইকে স্মরণ
              </Button>
            </Link>
          </div>
        </Card>

        {/* Student List */}
        <div className="space-y-2">
          {pendingStudents.map((student) => (
            <Card key={student.id} className="p-3">
              <button
                onClick={() => handleShowHistory(student)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-destructive/10 text-destructive font-semibold">
                      {student.nameBn.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{student.nameBn}</p>
                      {student.daysSincePayment > 30 && (
                        <span className="inline-flex items-center rounded bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
                          {toBanglaNumber(student.daysSincePayment)} দিন
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.batch?.name || 'ব্যাচ নেই'}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        ফি: {formatTaka(student.monthlyFee)}
                      </span>
                      {student.paidAmount > 0 && (
                        <span className="text-primary">
                          পেয়েছি: {formatTaka(student.paidAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-destructive">
                      {formatTaka(student.pending)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">বকেয়া</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              </button>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <Link href={`/fees/quick?student=${student.id}`} className="flex-1">
                  <Button size="sm" className="w-full h-9">
                    <Banknote className="mr-1 h-4 w-4" />
                    ফি নিন
                  </Button>
                </Link>
                <a href={`tel:${student.fatherPhone}`}>
                  <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                </a>
                <Link href={`/sms?student=${student.id}&template=fee-reminder`}>
                  <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {pendingStudents.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Banknote className="h-8 w-8 text-primary" />
            </div>
            <p className="mt-4 text-lg font-semibold text-primary">
              সব ফি পরিশোধিত!
            </p>
            <p className="text-sm text-muted-foreground">
              এই মাসে কোনো বকেয়া নেই
            </p>
          </div>
        )}

        {/* Student History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {selectedStudent?.nameBn}
              </DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                {/* Profile Summary */}
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {selectedStudent.nameBn.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedStudent.batch?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ফোন: {selectedStudent.fatherPhone}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Fee Summary */}
                <Card className="p-4 border-destructive/30 bg-destructive/5">
                  <h4 className="text-sm font-semibold mb-2">বকেয়া সারাংশ</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">মাসিক ফি</p>
                      <p className="font-semibold">{formatTaka(selectedStudent.monthlyFee)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">পরিশোধিত</p>
                      <p className="font-semibold text-primary">{formatTaka(selectedStudent.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">বকেয়া</p>
                      <p className="font-semibold text-destructive">{formatTaka(selectedStudent.pending)}</p>
                    </div>
                  </div>
                </Card>

                {/* Payment History */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    ফি ইতিহাস
                  </h4>
                  {(() => {
                    const studentPayments = getStudentPayments(selectedStudent.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    return studentPayments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        কোনো ফি রেকর্ড নেই
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {studentPayments.slice(0, 5).map((payment) => (
                          <Card key={payment.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {BANGLA_MONTHS[payment.month - 1]} {toBanglaNumber(payment.year)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(payment.date).toLocaleDateString('bn-BD')}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold text-primary">{formatTaka(payment.amount)}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )
                  })()}
                </div>

                {/* Attendance Stats */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    এই মাসের উপস্থিতি
                  </h4>
                  {(() => {
                    const attendance = getStudentAttendance(selectedStudent.id)
                    const thisMonthAttendance = attendance.filter(a => {
                      const date = new Date(a.date)
                      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
                    })
                    const presentCount = thisMonthAttendance.filter(a => a.status === 'present').length
                    const absentCount = thisMonthAttendance.filter(a => a.status === 'absent').length
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        <Card className="p-3 bg-primary/10 text-center">
                          <UserCheck className="mx-auto h-4 w-4 text-primary mb-1" />
                          <p className="text-lg font-bold text-primary">{toBanglaNumber(presentCount)}</p>
                          <p className="text-xs text-muted-foreground">উপস্থিত</p>
                        </Card>
                        <Card className="p-3 bg-destructive/10 text-center">
                          <UserX className="mx-auto h-4 w-4 text-destructive mb-1" />
                          <p className="text-lg font-bold text-destructive">{toBanglaNumber(absentCount)}</p>
                          <p className="text-xs text-muted-foreground">অনুপস্থিত</p>
                        </Card>
                      </div>
                    )
                  })()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link 
                    href={`/fees/quick?student=${selectedStudent.id}`}
                    className="flex-1"
                    onClick={() => setShowHistory(false)}
                  >
                    <Button className="w-full">
                      <Banknote className="mr-2 h-4 w-4" />
                      ফি নিন
                    </Button>
                  </Link>
                  <Link 
                    href={`/sms?student=${selectedStudent.id}&template=fee-reminder`}
                    className="flex-1"
                    onClick={() => setShowHistory(false)}
                  >
                    <Button variant="destructive" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      স্মরণ পাঠান
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
