'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { useStudents, useBatches, useFeePayments, useSMSLogs, useSettings } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber, BANGLA_MONTHS } from '@/lib/types'
import { SMS_TEMPLATES, fillTemplate, getSMSCount } from '@/lib/sms-templates'
import { 
  ArrowLeft, MessageSquare, Send, Clock, Check, X, 
  Users, ChevronRight, FileText 
} from 'lucide-react'

function SMSContent() {
  const searchParams = useSearchParams()
  const preselectedStudent = searchParams.get('student')
  const preselectedTemplate = searchParams.get('template')
  const isBulk = searchParams.get('bulk') === 'true'

  const { students, isHydrated: studentsHydrated } = useStudents()
  const { getBatch, isHydrated: batchesHydrated } = useBatches()
  const { payments, isHydrated: paymentsHydrated } = useFeePayments()
  const { addLog, logs, isHydrated: logsHydrated } = useSMSLogs()
  const { settings } = useSettings()

  const [step, setStep] = useState<'template' | 'recipients' | 'compose' | 'sent'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(preselectedTemplate)
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    preselectedStudent ? [preselectedStudent] : []
  )
  const [message, setMessage] = useState('')
  const [sentCount, setSentCount] = useState(0)

  const isHydrated = studentsHydrated && batchesHydrated && paymentsHydrated && logsHydrated

  useEffect(() => {
    if (preselectedStudent && preselectedTemplate && isHydrated) {
      setStep('compose')
      generateMessage(preselectedTemplate, [preselectedStudent])
    } else if (preselectedTemplate && isBulk && isHydrated) {
      // Auto-select defaulters for fee reminder
      if (preselectedTemplate === 'fee-reminder') {
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()
        const defaulters = students
          .filter(s => s.active)
          .filter(s => {
            const paid = payments
              .filter(p => p.studentId === s.id && p.month === currentMonth && p.year === currentYear)
              .reduce((sum, p) => sum + p.amount, 0)
            return paid < s.monthlyFee
          })
          .map(s => s.id)
        setSelectedStudents(defaulters)
        setStep('recipients')
      }
    }
  }, [preselectedStudent, preselectedTemplate, isBulk, isHydrated, students, payments])

  const generateMessage = (templateId: string, studentIds: string[]) => {
    const template = SMS_TEMPLATES.find(t => t.id === templateId)
    if (!template || studentIds.length === 0) return

    const student = students.find(s => s.id === studentIds[0])
    if (!student) return

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const paid = payments
      .filter(p => p.studentId === student.id && p.month === currentMonth && p.year === currentYear)
      .reduce((sum, p) => sum + p.amount, 0)
    const pending = student.monthlyFee - paid

    const values: Record<string, string> = {
      StudentName: student.nameBn,
      Month: BANGLA_MONTHS[currentMonth - 1],
      Amount: toBanglaNumber(pending > 0 ? pending : student.monthlyFee),
      TutorName: settings.nameBn,
      Date: new Date().toLocaleDateString('bn-BD'),
    }

    setMessage(fillTemplate(template.contentBn, values))
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (preselectedStudent) {
      generateMessage(templateId, [preselectedStudent])
      setStep('compose')
    } else {
      setStep('recipients')
    }
  }

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    const allIds = students.filter(s => s.active).map(s => s.id)
    setSelectedStudents(prev => prev.length === allIds.length ? [] : allIds)
  }

  const handleProceedToCompose = () => {
    if (selectedTemplate && selectedStudents.length > 0) {
      generateMessage(selectedTemplate, selectedStudents)
      setStep('compose')
    }
  }

  const handleSend = () => {
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId)
      if (!student) return

      // Personalize message for each student
      const template = SMS_TEMPLATES.find(t => t.id === selectedTemplate)
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const paid = payments
        .filter(p => p.studentId === studentId && p.month === currentMonth && p.year === currentYear)
        .reduce((sum, p) => sum + p.amount, 0)
      const pending = student.monthlyFee - paid

      let personalizedMessage = message
      if (template) {
        personalizedMessage = fillTemplate(template.contentBn, {
          StudentName: student.nameBn,
          Month: BANGLA_MONTHS[currentMonth - 1],
          Amount: toBanglaNumber(pending > 0 ? pending : student.monthlyFee),
          TutorName: settings.nameBn,
          Date: new Date().toLocaleDateString('bn-BD'),
        })
      }

      addLog({
        studentId,
        templateId: selectedTemplate || undefined,
        content: personalizedMessage,
        sentAt: new Date().toISOString(),
        status: 'pending',
        recipientPhone: student.fatherPhone,
      })
    })

    setSentCount(selectedStudents.length)
    setStep('sent')
  }

  if (!isHydrated) {
    return (
      <AppShell title="SMS">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const { chars, smsCount } = getSMSCount(message)

  // Step 1: Select Template
  if (step === 'template') {
    return (
      <AppShell title="SMS পাঠান">
        <div className="p-4">
          <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            ফিরে যান
          </Link>

          <h2 className="mb-4 text-lg font-semibold">টেমপ্লেট নির্বাচন করুন</h2>

          <div className="space-y-2">
            {SMS_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors active:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-5/10">
                      <FileText className="h-5 w-5 text-chart-5" />
                    </div>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {template.contentBn.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>

          {/* SMS History Link */}
          <Link href="/sms/history" className="mt-6 block">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS ইতিহাস</p>
                    <p className="text-xs text-muted-foreground">
                      {toBanglaNumber(logs.length)} টি মেসেজ
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        </div>
      </AppShell>
    )
  }

  // Step 2: Select Recipients
  if (step === 'recipients') {
    const activeStudents = students.filter(s => s.active)
    
    return (
      <AppShell title="প্রাপক নির্বাচন">
        <div className="p-4">
          <button
            onClick={() => setStep('template')}
            className="mb-4 inline-flex items-center text-sm text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            টেমপ্লেট
          </button>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              প্রাপক ({toBanglaNumber(selectedStudents.length)}/{toBanglaNumber(activeStudents.length)})
            </h2>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedStudents.length === activeStudents.length ? 'সব বাদ দিন' : 'সব নির্বাচন'}
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            {activeStudents.map((student) => {
              const batch = getBatch(student.batchId)
              const isSelected = selectedStudents.includes(student.id)

              return (
                <button
                  key={student.id}
                  onClick={() => handleToggleStudent(student.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isSelected} />
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {student.nameBn.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.nameBn}</p>
                      <p className="text-xs text-muted-foreground">{batch?.name}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <Button
            onClick={handleProceedToCompose}
            disabled={selectedStudents.length === 0}
            className="w-full h-12"
          >
            <Users className="mr-2 h-5 w-5" />
            {toBanglaNumber(selectedStudents.length)} জনকে মেসেজ
          </Button>
        </div>
      </AppShell>
    )
  }

  // Step 3: Compose Message
  if (step === 'compose') {
    const template = SMS_TEMPLATES.find(t => t.id === selectedTemplate)

    return (
      <AppShell title="মেসেজ লিখুন">
        <div className="p-4">
          <button
            onClick={() => setStep(preselectedStudent ? 'template' : 'recipients')}
            className="mb-4 inline-flex items-center text-sm text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            ফিরে যান
          </button>

          {/* Recipients Summary */}
          <Card className="mb-4 p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {toBanglaNumber(selectedStudents.length)} জন প্রাপক
              </span>
              {selectedStudents.length === 1 && (
                <span className="text-sm text-muted-foreground">
                  ({students.find(s => s.id === selectedStudents[0])?.nameBn})
                </span>
              )}
            </div>
          </Card>

          {/* Template Info */}
          {template && (
            <Card className="mb-4 p-3 bg-chart-5/5 border-chart-5/20">
              <p className="text-xs text-chart-5 font-medium">{template.name}</p>
            </Card>
          )}

          {/* Message Input */}
          <div className="mb-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="আপনার মেসেজ লিখুন..."
              rows={6}
              className="resize-none"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{toBanglaNumber(chars)} অক্ষর</span>
              <span>{toBanglaNumber(smsCount)} SMS</span>
            </div>
          </div>

          {/* Preview */}
          <Card className="mb-4 p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">প্রিভিউ:</p>
            <p className="text-sm whitespace-pre-wrap">{message || 'মেসেজ লিখুন...'}</p>
          </Card>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-full h-12"
          >
            <Send className="mr-2 h-5 w-5" />
            পাঠান ({toBanglaNumber(selectedStudents.length)} জন)
          </Button>
        </div>
      </AppShell>
    )
  }

  // Step 4: Sent Confirmation
  if (step === 'sent') {
    return (
      <AppShell title="পাঠানো হয়েছে">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-chart-5 animate-in zoom-in">
            <Check className="h-12 w-12 text-card" />
          </div>
          
          <p className="mt-6 text-xl font-bold text-chart-5">SMS কিউতে যোগ হয়েছে!</p>
          
          <Card className="mt-6 w-full p-4 text-center">
            <p className="text-sm text-muted-foreground">পাঠানো হবে</p>
            <p className="text-3xl font-bold text-chart-5">{toBanglaNumber(sentCount)} জন</p>
            <p className="text-xs text-muted-foreground mt-2">
              ইন্টারনেট সংযোগ পেলে পাঠানো হবে
            </p>
          </Card>

          <div className="mt-8 flex w-full gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                হোমে যান
              </Button>
            </Link>
            <Link href="/sms/history" className="flex-1">
              <Button className="w-full">
                SMS ইতিহাস
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  return null
}

export default function SMSPage() {
  return (
    <Suspense fallback={
      <AppShell title="SMS">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    }>
      <SMSContent />
    </Suspense>
  )
}
