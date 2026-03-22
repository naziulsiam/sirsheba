'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStudents, useBatches, useFeePayments } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber } from '@/lib/types'
import { Search, Plus, Phone, MessageSquare, ChevronRight, Users } from 'lucide-react'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  
  const { students, isHydrated: studentsHydrated } = useStudents()
  const { batches, getBatch, isHydrated: batchesHydrated } = useBatches()
  const { payments, isHydrated: paymentsHydrated } = useFeePayments()

  const isHydrated = studentsHydrated && batchesHydrated && paymentsHydrated

  if (!isHydrated) {
    return (
      <AppShell title="শিক্ষার্থী">
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-20 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const filteredStudents = students
    .filter(s => s.active)
    .filter(s => {
      if (selectedBatch && s.batchId !== selectedBatch) return false
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          s.nameBn.toLowerCase().includes(searchLower) ||
          s.nameEn.toLowerCase().includes(searchLower) ||
          s.fatherPhone.includes(search) ||
          s.motherPhone.includes(search)
        )
      }
      return true
    })
    .map(s => {
      const studentPayments = payments.filter(
        p => p.studentId === s.id && p.month === currentMonth && p.year === currentYear
      )
      const paidAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0)
      const pending = s.monthlyFee - paidAmount
      return { ...s, pending, batch: getBatch(s.batchId) }
    })
    .sort((a, b) => a.nameBn.localeCompare(b.nameBn, 'bn'))

  const activeStudentCount = students.filter(s => s.active).length

  return (
    <AppShell title="শিক্ষার্থী">
      <div className="flex flex-col gap-4 p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Batch Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <Button
            variant={selectedBatch === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBatch(null)}
            className="shrink-0"
          >
            সব ({toBanglaNumber(activeStudentCount)})
          </Button>
          {batches.map((batch) => {
            const count = students.filter(s => s.active && s.batchId === batch.id).length
            return (
              <Button
                key={batch.id}
                variant={selectedBatch === batch.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBatch(batch.id)}
                className="shrink-0"
              >
                {batch.name.split(' ')[0]} ({toBanglaNumber(count)})
              </Button>
            )
          })}
        </div>

        {/* Student Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <Users className="mr-1 inline h-4 w-4" />
            {toBanglaNumber(filteredStudents.length)} জন শিক্ষার্থী
          </p>
          <Link href="/students/new">
            <Button size="sm" className="h-8">
              <Plus className="mr-1 h-4 w-4" />
              নতুন
            </Button>
          </Link>
        </div>

        {/* Student List */}
        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <Link key={student.id} href={`/students/${student.id}`}>
              <Card className="p-3 transition-colors active:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {student.nameBn.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{student.nameBn}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.batch?.name || 'ব্যাচ নেই'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        ফি: {formatTaka(student.monthlyFee)}
                      </span>
                      {student.pending > 0 && (
                        <span className="inline-flex items-center rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                          বকেয়া: {formatTaka(student.pending)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${student.fatherPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary touch-target"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={`sms:${student.fatherPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-chart-5/10 text-chart-5 touch-target"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              কোনো শিক্ষার্থী পাওয়া যায়নি
            </p>
            <Link href="/students/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                নতুন শিক্ষার্থী যোগ করুন
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
