'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStudents, useBatches, useFeePayments, useAttendance } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber, BANGLA_MONTHS } from '@/lib/types'
import { 
  ArrowLeft, Phone, MessageSquare, Banknote, Calendar, 
  Edit, Trash2, UserCheck, UserX, ChevronRight 
} from 'lucide-react'

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const { getStudent, deleteStudent, isHydrated: studentsHydrated } = useStudents()
  const { getBatch, isHydrated: batchesHydrated } = useBatches()
  const { getStudentPayments, isHydrated: paymentsHydrated } = useFeePayments()
  const { getStudentAttendance, isHydrated: attendanceHydrated } = useAttendance()

  const isHydrated = studentsHydrated && batchesHydrated && paymentsHydrated && attendanceHydrated

  if (!isHydrated) {
    return (
      <AppShell title="শিক্ষার্থী">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const student = getStudent(id)

  if (!student) {
    return (
      <AppShell title="শিক্ষার্থী">
        <div className="p-4 text-center py-20">
          <p className="text-muted-foreground">শিক্ষার্থী পাওয়া যায়নি</p>
          <Link href="/students">
            <Button className="mt-4">ফিরে যান</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const batch = getBatch(student.batchId)
  const payments = getStudentPayments(student.id)
  const attendance = getStudentAttendance(student.id)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const thisMonthPayments = payments.filter(
    p => p.month === currentMonth && p.year === currentYear
  )
  const paidThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0)
  const pendingThisMonth = student.monthlyFee - paidThisMonth

  // Attendance stats for current month
  const thisMonthAttendance = attendance.filter(a => {
    const date = new Date(a.date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })
  const presentCount = thisMonthAttendance.filter(a => a.status === 'present').length
  const absentCount = thisMonthAttendance.filter(a => a.status === 'absent').length

  const handleDelete = () => {
    if (confirm('আপনি কি নিশ্চিত এই শিক্ষার্থীকে মুছতে চান?')) {
      deleteStudent(student.id)
      router.push('/students')
    }
  }

  return (
    <AppShell title={student.nameBn}>
      <div className="p-4">
        <Link href="/students" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        {/* Profile Card */}
        <Card className="p-4 mb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {student.nameBn.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{student.nameBn}</h2>
              {student.nameEn && (
                <p className="text-sm text-muted-foreground">{student.nameEn}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {batch?.name || 'ব্যাচ নেই'}
              </p>
              <p className="text-xs text-muted-foreground">
                যোগদান: {new Date(student.joinDate).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2">
            <a
              href={`tel:${student.fatherPhone}`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                বাবা
              </Button>
            </a>
            {student.motherPhone && (
              <a
                href={`tel:${student.motherPhone}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  মা
                </Button>
              </a>
            )}
            <Link href={`/sms?student=${student.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </Button>
            </Link>
          </div>
        </Card>

        {/* Fee Status */}
        <Card className={`p-4 mb-4 ${pendingThisMonth > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Banknote className={`h-5 w-5 ${pendingThisMonth > 0 ? 'text-destructive' : 'text-primary'}`} />
              <h3 className="font-semibold">এই মাসের ফি</h3>
            </div>
            <Link href={`/fees/quick?student=${student.id}`}>
              <Button size="sm" className="h-8">
                ফি নিন
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">মোট ফি</p>
              <p className="font-semibold">{formatTaka(student.monthlyFee)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">পরিশোধিত</p>
              <p className="font-semibold text-primary">{formatTaka(paidThisMonth)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">বকেয়া</p>
              <p className={`font-semibold ${pendingThisMonth > 0 ? 'text-destructive' : 'text-primary'}`}>
                {formatTaka(pendingThisMonth)}
              </p>
            </div>
          </div>
        </Card>

        {/* Attendance Stats */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-chart-2" />
              <h3 className="font-semibold">এই মাসের উপস্থিতি</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-primary">{toBanglaNumber(presentCount)}</p>
                <p className="text-xs text-muted-foreground">দিন উপস্থিত</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
              <UserX className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-lg font-bold text-destructive">{toBanglaNumber(absentCount)}</p>
                <p className="text-xs text-muted-foreground">দিন অনুপস্থিত</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Payments */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">সাম্প্রতিক ফি</h3>
            <Link href={`/fees/history?student=${student.id}`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                সব দেখুন
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              কোনো ফি রেকর্ড নেই
            </p>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                  <div>
                    <p className="text-sm font-medium">{BANGLA_MONTHS[payment.month - 1]} {toBanglaNumber(payment.year)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{formatTaka(payment.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/students/${student.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Edit className="mr-2 h-4 w-4" />
              সম্পাদনা
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
