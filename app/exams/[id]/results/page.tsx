'use client'

import { use } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useExams, useExamResults, useStudents, useBatches, useSMSLogs, useSettings } from '@/hooks/use-store'
import { toBanglaNumber, getGrade } from '@/lib/types'
import { fillTemplate, SMS_TEMPLATES } from '@/lib/sms-templates'
import { ArrowLeft, FileText, Trophy, Medal, Award, MessageSquare, Share2 } from 'lucide-react'

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { getExam, isHydrated: examsHydrated } = useExams()
  const { getExamResults, isHydrated: resultsHydrated } = useExamResults()
  const { getStudent, isHydrated: studentsHydrated } = useStudents()
  const { getBatch, isHydrated: batchesHydrated } = useBatches()
  const { addLog } = useSMSLogs()
  const { settings } = useSettings()

  const isHydrated = examsHydrated && resultsHydrated && studentsHydrated && batchesHydrated

  if (!isHydrated) {
    return (
      <AppShell title="ফলাফল">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const exam = getExam(id)
  const results = getExamResults(id)

  if (!exam) {
    return (
      <AppShell title="ফলাফল">
        <div className="p-4 text-center py-20">
          <p className="text-muted-foreground">পরীক্ষা পাওয়া যায়নি</p>
          <Link href="/exams">
            <Button className="mt-4">ফিরে যান</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  // Sort by marks (descending) for ranking
  const sortedResults = [...results]
    .map(r => ({
      ...r,
      student: getStudent(r.studentId),
      batch: getStudent(r.studentId) ? getBatch(getStudent(r.studentId)!.batchId) : null,
    }))
    .sort((a, b) => b.marks - a.marks)

  // Calculate statistics
  const totalMarks = results.reduce((sum, r) => sum + r.marks, 0)
  const avgMarks = results.length > 0 ? Math.round(totalMarks / results.length) : 0
  const highestMarks = results.length > 0 ? Math.max(...results.map(r => r.marks)) : 0
  const lowestMarks = results.length > 0 ? Math.min(...results.map(r => r.marks)) : 0
  const passCount = results.filter(r => (r.marks / exam.maxMarks) * 100 >= 33).length

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />
    return null
  }

  const handleSendAllResults = () => {
    const template = SMS_TEMPLATES.find(t => t.id === 'exam-result')
    if (!template) return

    results.forEach(result => {
      const student = getStudent(result.studentId)
      if (!student) return

      const content = fillTemplate(template.contentBn, {
        StudentName: student.nameBn,
        ExamName: exam.name,
        Marks: toBanglaNumber(result.marks),
        MaxMarks: toBanglaNumber(exam.maxMarks),
        GPA: toBanglaNumber(result.gpa),
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
    })

    alert(`${toBanglaNumber(results.length)} জন শিক্ষার্থীর ফলাফল SMS কিউতে যোগ হয়েছে।`)
  }

  return (
    <AppShell title="ফলাফল">
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
            <div className="flex-1">
              <p className="font-semibold">{exam.name}</p>
              <p className="text-xs text-muted-foreground">
                {exam.subject} • {new Date(exam.date).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{toBanglaNumber(avgMarks)}</p>
            <p className="text-xs text-muted-foreground">গড় নম্বর</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-chart-2">{toBanglaNumber(passCount)}/{toBanglaNumber(results.length)}</p>
            <p className="text-xs text-muted-foreground">পাশ</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{toBanglaNumber(highestMarks)}</p>
            <p className="text-xs text-muted-foreground">সর্বোচ্চ</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{toBanglaNumber(lowestMarks)}</p>
            <p className="text-xs text-muted-foreground">সর্বনিম্ন</p>
          </Card>
        </div>

        {/* Send Results Button */}
        <Button
          onClick={handleSendAllResults}
          variant="outline"
          className="w-full mb-4"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          সবার ফলাফল SMS করুন
        </Button>

        {/* Results List */}
        <h3 className="mb-2 font-semibold">মেধা তালিকা</h3>
        <div className="space-y-2">
          {sortedResults.map((result, index) => {
            const position = index + 1
            const grade = getGrade(result.marks, exam.maxMarks)
            const percentage = Math.round((result.marks / exam.maxMarks) * 100)

            return (
              <Card key={result.id} className={`p-3 ${position <= 3 ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                    {getRankIcon(position) || toBanglaNumber(position)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {result.student?.nameBn.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {result.student?.nameBn || 'অজানা'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.batch?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {toBanglaNumber(result.marks)}/{toBanglaNumber(exam.maxMarks)}
                    </p>
                    <p className={`text-xs font-medium ${
                      grade === 'F' ? 'text-destructive' : 
                      grade === 'A+' ? 'text-primary' : 
                      'text-muted-foreground'
                    }`}>
                      {grade} ({toBanglaNumber(percentage)}%)
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {results.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              কোনো ফলাফল নেই
            </p>
            <Link href={`/exams/${exam.id}/marks`}>
              <Button className="mt-4">
                নম্বর দিন
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
