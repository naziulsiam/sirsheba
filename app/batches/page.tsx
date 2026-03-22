'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useBatches, useStudents } from '@/hooks/use-store'
import { toBanglaNumber } from '@/lib/types'
import { ArrowLeft, Plus, Users, Clock, BookOpen, Edit, Trash2 } from 'lucide-react'

export default function BatchesPage() {
  const { batches, addBatch, updateBatch, deleteBatch, isHydrated: batchesHydrated } = useBatches()
  const { students, isHydrated: studentsHydrated } = useStudents()
  
  const [isOpen, setIsOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    schedule: '',
    subject: '',
  })

  const isHydrated = batchesHydrated && studentsHydrated

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBatch) {
      updateBatch(editingBatch, formData)
    } else {
      addBatch(formData)
    }
    setFormData({ name: '', schedule: '', subject: '' })
    setEditingBatch(null)
    setIsOpen(false)
  }

  const handleEdit = (batch: typeof batches[0]) => {
    setFormData({
      name: batch.name,
      schedule: batch.schedule,
      subject: batch.subject,
    })
    setEditingBatch(batch.id)
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    const studentCount = students.filter(s => s.batchId === id).length
    if (studentCount > 0) {
      alert(`এই ব্যাচে ${studentCount} জন শিক্ষার্থী আছে। প্রথমে তাদের অন্য ব্যাচে স্থানান্তর করুন।`)
      return
    }
    if (confirm('আপনি কি নিশ্চিত এই ব্যাচ মুছতে চান?')) {
      deleteBatch(id)
    }
  }

  if (!isHydrated) {
    return (
      <AppShell title="ব্যাচ">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="ব্যাচ">
      <div className="p-4">
        <Link href="/settings" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">সব ব্যাচ</h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setFormData({ name: '', schedule: '', subject: '' })
                setEditingBatch(null)
              }}>
                <Plus className="mr-1 h-4 w-4" />
                নতুন ব্যাচ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBatch ? 'ব্যাচ সম্পাদনা' : 'নতুন ব্যাচ'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">ব্যাচের নাম</Label>
                  <Input
                    id="name"
                    placeholder="যেমন: HSC Science 2026 (সোম-বুধ)"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="schedule">সময়সূচী</Label>
                  <Input
                    id="schedule"
                    placeholder="যেমন: সোমবার, বুধবার - সন্ধ্যা ৬টা"
                    value={formData.schedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">বিষয়</Label>
                  <Input
                    id="subject"
                    placeholder="যেমন: পদার্থবিদ্যা"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingBatch ? 'সংরক্ষণ করুন' : 'ব্যাচ যোগ করুন'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {batches.map((batch) => {
            const studentCount = students.filter(s => s.active && s.batchId === batch.id).length
            return (
              <Card key={batch.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{batch.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {batch.schedule}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {batch.subject}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {toBanglaNumber(studentCount)} জন শিক্ষার্থী
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(batch)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(batch.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {batches.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              কোনো ব্যাচ নেই
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
