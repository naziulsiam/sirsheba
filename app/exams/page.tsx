'use client'

import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useExams, useExamResults, useStudents } from '@/hooks/use-store'
import { toBanglaNumber } from '@/lib/types'
import { ArrowLeft, Plus, FileText, Calendar, Users, ChevronRight, Trash2 } from 'lucide-react'

export default function ExamsPage() {
  const { exams, deleteExam, isHydrated: examsHydrated } = useExams()
  const { getExamResults, isHydrated: resultsHydrated } = useExamResults()
  const { students, isHydrated: studentsHydrated } = useStudents()

  const isHydrated = examsHydrated && resultsHydrated && studentsHydrated

  if (!isHydrated) {
    return (
      <AppShell title="পরীক্ষা">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const sortedExams = [...exams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const activeStudentCount = students.filter(s => s.active).length

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত এই পরীক্ষা মুছতে চান?')) {
      deleteExam(id)
    }
  }

  return (
    <AppShell title="পরীক্ষা">
      <div className="p-4">
        <Link href="/settings" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">সব পরীক্ষা</h2>
          <Link href="/exams/new">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              নতুন পরীক্ষা
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {sortedExams.map((exam) => {
            const results = getExamResults(exam.id)
            const hasResults = results.length > 0
            const resultsProgress = `${toBanglaNumber(results.length)}/${toBanglaNumber(activeStudentCount)}`

            return (
              <Card key={exam.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{exam.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(exam.date).toLocaleDateString('bn-BD')}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {exam.subject} • পূর্ণমান: {toBanglaNumber(exam.maxMarks)}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        ফলাফল: {resultsProgress} জন
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(exam.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link href={`/exams/${exam.id}/marks`} className="flex-1">
                    <Button variant="outline" className="w-full h-9">
                      নম্বর দিন
                    </Button>
                  </Link>
                  {hasResults && (
                    <Link href={`/exams/${exam.id}/results`} className="flex-1">
                      <Button className="w-full h-9">
                        ফলাফল দেখুন
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {exams.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              কোনো পরীক্ষা নেই
            </p>
            <Link href="/exams/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                নতুন পরীক্ষা যোগ করুন
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
