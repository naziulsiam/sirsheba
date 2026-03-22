'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useExams } from '@/hooks/use-store'
import { ArrowLeft, Plus, Check } from 'lucide-react'

export default function NewExamPage() {
  const router = useRouter()
  const { addExam } = useExams()

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    subject: 'পদার্থবিদ্যা',
    maxMarks: 100,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newExam = addExam(formData)

    setShowSuccess(true)
    setTimeout(() => {
      router.push(`/exams/${newExam.id}/marks`)
    }, 1000)
  }

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (showSuccess) {
    return (
      <AppShell title="নতুন পরীক্ষা">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary animate-in zoom-in">
            <Check className="h-10 w-10 text-primary-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold text-primary">
            পরীক্ষা যোগ হয়েছে!
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="নতুন পরীক্ষা">
      <div className="p-4">
        <Link href="/exams" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              পরীক্ষার তথ্য
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">পরীক্ষার নাম *</Label>
                <Input
                  id="name"
                  placeholder="যেমন: Physics 1st Paper Test"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="date">তারিখ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">বিষয় *</Label>
                <Input
                  id="subject"
                  placeholder="যেমন: পদার্থবিদ্যা"
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="maxMarks">পূর্ণমান *</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  placeholder="100"
                  value={formData.maxMarks}
                  onChange={(e) => updateField('maxMarks', parseInt(e.target.value) || 0)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={!formData.name || !formData.date || !formData.subject || isSubmitting}
          >
            <Plus className="mr-2 h-5 w-5" />
            পরীক্ষা যোগ করুন
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
