'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStudents, useBatches, useAttendance, useSMSLogs, useSettings } from '@/hooks/use-store'
import { toBanglaNumber } from '@/lib/types'
import { fillTemplate, SMS_TEMPLATES } from '@/lib/sms-templates'
import { 
  ArrowLeft, Calendar, ChevronLeft, ChevronRight, 
  UserCheck, UserX, Check, Users, MessageSquare, Send, Mic
} from 'lucide-react'
import { VoiceInputButton } from '@/components/voice-input-button'

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [sendAbsentSMS, setSendAbsentSMS] = useState(true)

  const { students, isHydrated: studentsHydrated } = useStudents()
  const { batches, isHydrated: batchesHydrated } = useBatches()
  const { attendance, markAttendance, getDateAttendance, isHydrated: attendanceHydrated } = useAttendance()
  const { addLog } = useSMSLogs()
  const { settings } = useSettings()

  const isHydrated = studentsHydrated && batchesHydrated && attendanceHydrated

  if (!isHydrated) {
    return (
      <AppShell title="উপস্থিতি">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const dateAttendance = getDateAttendance(selectedDate)
  const attendanceMap = new Map(dateAttendance.map(a => [a.studentId, a.status]))

  const filteredStudents = students
    .filter(s => s.active)
    .filter(s => !selectedBatch || s.batchId === selectedBatch)
    .sort((a, b) => a.nameBn.localeCompare(b.nameBn, 'bn'))

  const presentCount = filteredStudents.filter(s => attendanceMap.get(s.id) === 'present').length
  const absentCount = filteredStudents.filter(s => attendanceMap.get(s.id) === 'absent').length
  const unmarkedCount = filteredStudents.filter(s => !attendanceMap.has(s.id)).length

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent') => {
    const student = students.find(s => s.id === studentId)
    
    markAttendance({
      studentId,
      date: selectedDate,
      status,
      batchId: student?.batchId || '',
    })

    // Send SMS for absent
    if (status === 'absent' && sendAbsentSMS && student) {
      const template = SMS_TEMPLATES.find(t => t.id === 'absence-alert')
      if (template) {
        const formattedDate = new Date(selectedDate).toLocaleDateString('bn-BD')
        const content = fillTemplate(template.contentBn, {
          StudentName: student.nameBn,
          Date: formattedDate,
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
  }

  const handleMarkAllPresent = () => {
    filteredStudents.forEach(student => {
      if (!attendanceMap.has(student.id)) {
        markAttendance({
          studentId: student.id,
          date: selectedDate,
          status: 'present',
          batchId: student.batchId,
        })
      }
    })
  }

  const goToPrevDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <AppShell title="উপস্থিতি">
      <div className="p-4">
        <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        {/* Date Selector */}
        <Card className="mb-4 p-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goToPrevDay}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString('bn-BD', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {isToday && (
                  <span className="text-xs text-primary">আজকে</span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Batch Filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <Button
            variant={selectedBatch === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBatch(null)}
            className="shrink-0"
          >
            সব
          </Button>
          {batches.map((batch) => (
            <Button
              key={batch.id}
              variant={selectedBatch === batch.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBatch(batch.id)}
              className="shrink-0"
            >
              {batch.name.split(' ')[0]}
            </Button>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Card className="bg-primary/10 border-0 p-3 text-center">
            <UserCheck className="mx-auto h-5 w-5 text-primary" />
            <p className="text-xl font-bold text-primary">{toBanglaNumber(presentCount)}</p>
            <p className="text-[10px] text-muted-foreground">উপস্থিত</p>
          </Card>
          <Card className="bg-destructive/10 border-0 p-3 text-center">
            <UserX className="mx-auto h-5 w-5 text-destructive" />
            <p className="text-xl font-bold text-destructive">{toBanglaNumber(absentCount)}</p>
            <p className="text-[10px] text-muted-foreground">অনুপস্থিত</p>
          </Card>
          <Card className="bg-muted border-0 p-3 text-center">
            <Users className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="text-xl font-bold">{toBanglaNumber(unmarkedCount)}</p>
            <p className="text-[10px] text-muted-foreground">বাকি</p>
          </Card>
        </div>

        {/* Send SMS to Absent Parents */}
        {absentCount > 0 && (
          <Card className="p-4 mb-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">
                  {toBanglaNumber(absentCount)} জন অনুপস্থিত
                </p>
                <p className="text-xs text-muted-foreground">
                  অভিভাবকদের SMS পাঠাতে চান?
                </p>
              </div>
              <Link
                href={`/sms?template=absence-alert&absentDate=${selectedDate}`}
              >
                <Button size="sm" variant="destructive">
                  <Send className="mr-1 h-4 w-4" />
                  SMS পাঠান
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        {unmarkedCount > 0 && (
          <div className="mb-4 flex gap-2">
            <Button onClick={handleMarkAllPresent} className="flex-1">
              <Check className="mr-2 h-4 w-4" />
              সবাই উপস্থিত
            </Button>
            <Button
              variant={sendAbsentSMS ? 'default' : 'outline'}
              size="icon"
              onClick={() => setSendAbsentSMS(!sendAbsentSMS)}
              className="w-11"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Student List */}
        <div className="space-y-2">
          {filteredStudents.map((student) => {
            const status = attendanceMap.get(student.id)
            const batch = batches.find(b => b.id === student.batchId)

            return (
              <Card key={student.id} className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`font-semibold ${
                      status === 'present' ? 'bg-primary/10 text-primary' :
                      status === 'absent' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {student.nameBn.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.nameBn}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {batch?.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'present')}
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all touch-target ${
                        status === 'present'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      <UserCheck className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(student.id, 'absent')}
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all touch-target ${
                        status === 'absent'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      }`}
                    >
                      <UserX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              কোনো শিক্ষার্থী নেই
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
