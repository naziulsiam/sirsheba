'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useExams, useExamResults, useStudents, useBatches } from '@/hooks/use-store'
import { toBanglaNumber, calculateGPA, getGrade } from '@/lib/types'
import { ArrowLeft, Save, Check, FileText } from 'lucide-react'

export default function MarksEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { getExam, isHydrated: examsHydrated } = useExams()
  const { getExamResults, addResult, isHydrated: resultsHydrated } = useExamResults()
  const { students, isHydrated: studentsHydrated } = useStudents()
  const { getBatch, isHydrated: batchesHydrated } = useBatches()

  const [marks, setMarks] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isHydrated = examsHydrated && resultsHydrated && studentsHydrated && batchesHydrated

  const exam = isHydrated ? getExam(id) : null
  const existingResults = isHydrated ? getExamResults(id) : []
  
  // Initialize marks from existing results
  useState(() => {
    if (isHydrated && existingResults.length > 0) {
      const initialMarks: Record<string, string> = {}
      existingResults.forEach(r => {
        initialMarks[r.studentId] = r.marks.toString()
      })
      setMarks(initialMarks)
    }
  })

  if (!isHydrated) {
    return (
      <AppShell title="নম্বর দিন">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  if (!exam) {
    return (
      <AppShell title="পরীক্ষা">
        <div className="p-4 text-center py-20">
          <p className="text-muted-foreground">পরীক্ষা পাওয়া যায়নি</p>
          <Link href="/exams">
            <Button className="mt-4">ফিরে যান</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const activeStudents = students
    .filter(s => s.active)
    .sort((a, b) => a.nameBn.localeCompare(b.nameBn, 'bn'))

  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue <= exam.maxMarks) {
      setMarks(prev => ({ ...prev, [studentId]: value }))
    }
  }

  const handleSave = () => {
    setIsSaving(true)

    Object.entries(marks).forEach(([studentId, markValue]) => {
      const marksNum = parseInt(markValue) || 0
      if (marksNum >= 0) {
        const gpa = calculateGPA(marksNum, exam.maxMarks)
        addResult({
          examId: exam.id,
          studentId,
          marks: marksNum,
          gpa,
        })
      }
    })

    setShowSuccess(true)
    setTimeout(() => {
      router.push(`/exams/${exam.id}/results`)
    }, 1000)
  }

  const getStudentMark = (studentId: string) => {
    if (marks[studentId] !== undefined) return marks[studentId]
    const existing = existingResults.find(r => r.studentId === studentId)
    return existing ? existing.marks.toString() : ''
  }

  const enteredCount = Object.keys(marks).filter(k => marks[k]).length + 
    existingResults.filter(r => !marks[r.studentId]).length

  if (showSuccess) {
    return (
      <AppShell title="নম্বর দিন">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary animate-in zoom-in">
            <Check className="h-10 w-10 text-primary-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold text-primary">
            নম্বর সংরক্ষিত!
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="নম্বর দিন">
      <div className="p-4">
        <Link href="/exams" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        {/* Exam Info */}
        <Card className="mb-4 p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{exam.name}</p>
              <p className="text-xs text-muted-foreground">
                {exam.subject} • পূর্ণমান: {toBanglaNumber(exam.maxMarks)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {toBanglaNumber(enteredCount)}/{toBanglaNumber(activeStudents.length)} জনের নম্বর দেওয়া হয়েছে
          </p>
        </Card>

        {/* GPA Reference */}
        <Card className="mb-4 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">GPA স্কেল:</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-primary/10 rounded">A+ (৮০+) = ৫.০</span>
            <span className="px-2 py-1 bg-muted rounded">A (৭০-৭৯) = ৪.০</span>
            <span className="px-2 py-1 bg-muted rounded">A- (৬০-৬৯) = ৩.৫</span>
            <span className="px-2 py-1 bg-muted rounded">B (৫০-৫৯) = ৩.০</span>
            <span className="px-2 py-1 bg-muted rounded">C (৪০-৪৯) = ২.০</span>
            <span className="px-2 py-1 bg-destructive/10 rounded">F ({'<'}৩৩) = ০.০</span>
          </div>
        </Card>

        {/* Student List with Marks Input */}
        <div className="space-y-2 mb-4">
          {activeStudents.map((student) => {
            const batch = getBatch(student.batchId)
            const currentMark = getStudentMark(student.id)
            const markNum = parseInt(currentMark) || 0
            const grade = currentMark ? getGrade(markNum, exam.maxMarks) : '-'

            return (
              <Card key={student.id} className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {student.nameBn.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.nameBn}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {batch?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={exam.maxMarks}
                      value={currentMark}
                      onChange={(e) => handleMarksChange(student.id, e.target.value)}
                      className="w-20 h-10 text-center text-lg font-semibold"
                      placeholder="0"
                    />
                    <div className="w-10 text-center">
                      <span className={`text-sm font-bold ${
                        grade === 'F' ? 'text-destructive' : 
                        grade === 'A+' ? 'text-primary' : 
                        'text-muted-foreground'
                      }`}>
                        {grade}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Button
          onClick={handleSave}
          disabled={Object.keys(marks).length === 0 && existingResults.length === 0 || isSaving}
          className="w-full h-12"
        >
          <Save className="mr-2 h-5 w-5" />
          নম্বর সংরক্ষণ করুন
        </Button>
      </div>
    </AppShell>
  )
}
