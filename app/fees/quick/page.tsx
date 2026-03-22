'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStudents, useBatches, useFeePayments, useSMSLogs, useSettings } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber, BANGLA_MONTHS } from '@/lib/types'
import { fillTemplate, SMS_TEMPLATES } from '@/lib/sms-templates'
import { ArrowLeft, Search, Check, X, MessageSquare } from 'lucide-react'
import Link from 'next/link'

function QuickCashContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselectedStudentId = searchParams.get('student')

  const { students, isHydrated: studentsHydrated } = useStudents()
  const { getBatch, isHydrated: batchesHydrated } = useBatches()
  const { addPayment, payments, isHydrated: paymentsHydrated } = useFeePayments()
  const { addLog } = useSMSLogs()
  const { settings } = useSettings()

  const [step, setStep] = useState<'select' | 'amount' | 'confirm' | 'success'>(
    preselectedStudentId ? 'amount' : 'select'
  )
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(preselectedStudentId)
  const [amount, setAmount] = useState('')
  const [sendSMS, setSendSMS] = useState(true)

  const isHydrated = studentsHydrated && batchesHydrated && paymentsHydrated

  useEffect(() => {
    if (preselectedStudentId && isHydrated) {
      const student = students.find(s => s.id === preselectedStudentId)
      if (student) {
        setSelectedStudent(preselectedStudentId)
        // Calculate pending amount
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()
        const paid = payments
          .filter(p => p.studentId === preselectedStudentId && p.month === currentMonth && p.year === currentYear)
          .reduce((sum, p) => sum + p.amount, 0)
        const pending = student.monthlyFee - paid
        if (pending > 0) {
          setAmount(pending.toString())
        }
      }
    }
  }, [preselectedStudentId, isHydrated, students, payments])

  if (!isHydrated) {
    return (
      <AppShell title="ক্যাশ এন্ট্রি">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const student = selectedStudent ? students.find(s => s.id === selectedStudent) : null
  const batch = student ? getBatch(student.batchId) : null

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const getStudentPending = (studentId: string, monthlyFee: number) => {
    const paid = payments
      .filter(p => p.studentId === studentId && p.month === currentMonth && p.year === currentYear)
      .reduce((sum, p) => sum + p.amount, 0)
    return monthlyFee - paid
  }

  const filteredStudents = students
    .filter(s => s.active)
    .filter(s => {
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          s.nameBn.toLowerCase().includes(searchLower) ||
          s.nameEn.toLowerCase().includes(searchLower) ||
          s.fatherPhone.includes(search)
        )
      }
      return true
    })
    .map(s => ({
      ...s,
      pending: getStudentPending(s.id, s.monthlyFee),
      batch: getBatch(s.batchId),
    }))
    .sort((a, b) => b.pending - a.pending)

  const handleSelectStudent = (id: string) => {
    setSelectedStudent(id)
    const s = students.find(st => st.id === id)
    if (s) {
      const pending = getStudentPending(s.id, s.monthlyFee)
      setAmount(pending > 0 ? pending.toString() : s.monthlyFee.toString())
    }
    setStep('amount')
  }

  const handleConfirm = () => {
    if (!student || !amount) return

    const payment = addPayment({
      studentId: student.id,
      amount: parseInt(amount),
      date: new Date().toISOString().split('T')[0],
      month: currentMonth,
      year: currentYear,
      type: 'cash',
    })

    // Queue SMS
    if (sendSMS) {
      const template = SMS_TEMPLATES.find(t => t.id === 'fee-receipt')
      if (template) {
        const content = fillTemplate(template.contentBn, {
          StudentName: student.nameBn,
          Month: BANGLA_MONTHS[currentMonth - 1],
          Amount: toBanglaNumber(parseInt(amount)),
          TutorName: settings.nameBn,
        })
        addLog({
          studentId: student.id,
          templateId: template.id,
          content,
          sentAt: new Date().toISOString(),
          status: 'pending',
          recipientPhone: student.fatherPhone,
        })
      }
    }

    setStep('success')
  }

  const handleReset = () => {
    setSelectedStudent(null)
    setAmount('')
    setSearch('')
    setStep('select')
  }

  // Step 1: Select Student
  if (step === 'select') {
    return (
      <AppShell title="ক্যাশ এন্ট্রি">
        <div className="p-4">
          <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            ফিরে যান
          </Link>

          <h2 className="mb-4 text-lg font-semibold">শিক্ষার্থী নির্বাচন করুন</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectStudent(s.id)}
                className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors active:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${s.pending > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'} font-semibold`}>
                      {s.nameBn.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{s.nameBn}</p>
                    <p className="text-xs text-muted-foreground">{s.batch?.name}</p>
                  </div>
                  {s.pending > 0 ? (
                    <span className="text-sm font-semibold text-destructive">
                      {formatTaka(s.pending)}
                    </span>
                  ) : (
                    <span className="text-xs text-primary">পরিশোধিত</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  // Step 2: Enter Amount
  if (step === 'amount' && student) {
    const pending = getStudentPending(student.id, student.monthlyFee)
    
    return (
      <AppShell title="ক্যাশ এন্ট্রি">
        <div className="p-4">
          <button
            onClick={() => setStep('select')}
            className="mb-4 inline-flex items-center text-sm text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            অন্য শিক্ষার্থী
          </button>

          <Card className="p-4 mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {student.nameBn.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{student.nameBn}</p>
                <p className="text-xs text-muted-foreground">{batch?.name}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">মাসিক ফি:</span>
              <span className="font-medium">{formatTaka(student.monthlyFee)}</span>
            </div>
            {pending > 0 && (
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-destructive">বকেয়া:</span>
                <span className="font-medium text-destructive">{formatTaka(pending)}</span>
              </div>
            )}
          </Card>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              টাকার পরিমাণ
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                ৳
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-16 pl-12 text-3xl font-bold"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[1000, 2000, 3000, 4000, 5000, student.monthlyFee].map((amt) => (
              <Button
                key={amt}
                variant={amount === amt.toString() ? 'default' : 'outline'}
                onClick={() => setAmount(amt.toString())}
                className="h-12"
              >
                {formatTaka(amt)}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setStep('confirm')}
            disabled={!amount || parseInt(amount) <= 0}
            className="w-full h-14 text-lg"
          >
            পরবর্তী
          </Button>
        </div>
      </AppShell>
    )
  }

  // Step 3: Confirm
  if (step === 'confirm' && student) {
    return (
      <AppShell title="নিশ্চিত করুন">
        <div className="p-4">
          <button
            onClick={() => setStep('amount')}
            className="mb-4 inline-flex items-center text-sm text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            ফিরে যান
          </button>

          <Card className="p-6 text-center mb-4">
            <Avatar className="mx-auto h-16 w-16 mb-3">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {student.nameBn.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{student.nameBn}</p>
            <p className="text-sm text-muted-foreground">{batch?.name}</p>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">পরিমাণ</p>
              <p className="text-4xl font-bold text-primary">{formatTaka(parseInt(amount))}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {BANGLA_MONTHS[currentMonth - 1]} {toBanglaNumber(currentYear)}
              </p>
            </div>
          </Card>

          {/* SMS Toggle */}
          <Card className="p-4 mb-4">
            <button
              onClick={() => setSendSMS(!sendSMS)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-chart-5" />
                <div className="text-left">
                  <p className="font-medium">রসিদ SMS পাঠান</p>
                  <p className="text-xs text-muted-foreground">
                    অভিভাবকের ফোনে রসিদ পাঠাবে
                  </p>
                </div>
              </div>
              <div className={`h-6 w-11 rounded-full transition-colors ${sendSMS ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${sendSMS ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('amount')}
              className="flex-1 h-14"
            >
              <X className="mr-2 h-5 w-5" />
              বাতিল
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-14 text-lg"
            >
              <Check className="mr-2 h-5 w-5" />
              নিশ্চিত
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  // Step 4: Success
  if (step === 'success' && student) {
    return (
      <AppShell title="সফল!">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary animate-in zoom-in">
            <Check className="h-12 w-12 text-primary-foreground" />
          </div>
          
          <p className="mt-6 text-xl font-bold text-primary">ফি গৃহীত হয়েছে!</p>
          
          <Card className="mt-6 w-full p-4 text-center">
            <p className="text-sm text-muted-foreground">পরিমাণ</p>
            <p className="text-3xl font-bold text-primary">{formatTaka(parseInt(amount))}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {student.nameBn} • {BANGLA_MONTHS[currentMonth - 1]}
            </p>
            {sendSMS && (
              <p className="text-xs text-chart-5 mt-2">
                <MessageSquare className="inline h-3 w-3 mr-1" />
                SMS কিউতে আছে
              </p>
            )}
          </Card>

          <div className="mt-8 flex w-full gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              হোমে যান
            </Button>
            <Button
              onClick={handleReset}
              className="flex-1"
            >
              আরেকটি এন্ট্রি
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return null
}

export default function QuickCashPage() {
  return (
    <Suspense fallback={
      <AppShell title="ক্যাশ এন্ট্রি">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    }>
      <QuickCashContent />
    </Suspense>
  )
}
