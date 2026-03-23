'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useAdmin } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber } from '@/lib/types'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Download,
  Ban,
  Eye,
  UserCog,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type TutorStatus = 'all' | 'active' | 'suspended' | 'inactive'
type TutorPlan = 'all' | 'free' | 'basic' | 'pro'

export default function TutorsPage() {
  const { tutors, updateTutorStatus, addTutor, deleteTutor } = useAdmin()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TutorStatus>('all')
  const [planFilter, setPlanFilter] = useState<TutorPlan>('all')
  const [selectedTutors, setSelectedTutors] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTutor, setNewTutor] = useState({
    name: '',
    phone: '',
    plan: 'basic' as const,
    monthlyFee: 499,
  })
  const itemsPerPage = 10

  // Filter tutors
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = 
      tutor.name.toLowerCase().includes(search.toLowerCase()) ||
      tutor.phone.includes(search)
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter
    const matchesPlan = planFilter === 'all' || tutor.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  // Pagination
  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage)
  const paginatedTutors = filteredTutors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectAll = () => {
    if (selectedTutors.length === paginatedTutors.length) {
      setSelectedTutors([])
    } else {
      setSelectedTutors(paginatedTutors.map(t => t.id))
    }
  }

  const handleSelectTutor = (id: string) => {
    if (selectedTutors.includes(id)) {
      setSelectedTutors(prev => prev.filter(tutorId => tutorId !== id))
    } else {
      setSelectedTutors(prev => [...prev, id])
    }
  }

  const handleExport = () => {
    const dataToExport = selectedTutors.length > 0 
      ? tutors.filter(t => selectedTutors.includes(t.id))
      : filteredTutors
    
    const csv = [
      ['Name', 'Phone', 'Plan', 'Students', 'Monthly Fee', 'Revenue', 'Status'].join(','),
      ...dataToExport.map(t => [
        t.name,
        t.phone,
        t.plan,
        t.studentCount,
        t.monthlyFee,
        t.revenue,
        t.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tutors-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddTutor = () => {
    if (newTutor.name && newTutor.phone) {
      addTutor({
        ...newTutor,
        planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        studentCount: 0,
        lastActive: new Date().toISOString(),
        status: 'active',
        revenue: 0,
        smsSent: 0,
        joinedAt: new Date().toISOString(),
      })
      setNewTutor({ name: '', phone: '', plan: 'basic', monthlyFee: 499 })
      setShowAddDialog(false)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত এই টিউটর মুছতে চান?')) {
      deleteTutor(id)
    }
  }

  const handleSendMessage = (tutor: typeof tutors[0]) => {
    const message = prompt(`মেসেজ লিখুন ${tutor.name} এর জন্য:`)
    if (message) {
      alert(`মেসেজ পাঠানো হয়েছে: ${tutor.phone}`)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 hover:bg-green-100',
      suspended: 'bg-red-100 text-red-700 hover:bg-red-100',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    }
    const labels = {
      active: 'সক্রিয়',
      suspended: 'সাসপেন্ড',
      inactive: 'নিষ্ক্রিয়',
    }
    return (
      <Badge className={styles[status as keyof typeof styles]} variant="secondary">
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const styles = {
      free: 'bg-gray-100 text-gray-700',
      basic: 'bg-blue-100 text-blue-700',
      pro: 'bg-purple-100 text-purple-700',
    }
    const labels = {
      free: 'ফ্রি',
      basic: 'বেসিক',
      pro: 'প্রো',
    }
    return (
      <Badge className={styles[plan as keyof typeof styles]} variant="secondary">
        {labels[plan as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">টিউটর ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সব টিউটরদের তালিকা ও ব্যবস্থাপনা</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            এক্সপোর্ট CSV
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                টিউটর যোগ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন টিউটর যোগ করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>নাম</Label>
                  <Input
                    value={newTutor.name}
                    onChange={(e) => setNewTutor({ ...newTutor, name: e.target.value })}
                    placeholder="টিউটরের নাম"
                  />
                </div>
                <div>
                  <Label>ফোন</Label>
                  <Input
                    value={newTutor.phone}
                    onChange={(e) => setNewTutor({ ...newTutor, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label>প্ল্যান</Label>
                  <select
                    value={newTutor.plan}
                    onChange={(e) => setNewTutor({ 
                      ...newTutor, 
                      plan: e.target.value as typeof newTutor.plan,
                      monthlyFee: e.target.value === 'free' ? 0 : e.target.value === 'basic' ? 499 : 999
                    })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  >
                    <option value="free">ফ্রি (৳০)</option>
                    <option value="basic">বেসিক (৳৪৯৯)</option>
                    <option value="pro">প্রো (৳৯৯৯)</option>
                  </select>
                </div>
                <Button onClick={handleAddTutor} className="w-full">
                  যোগ করুন
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TutorStatus)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="active">সক্রিয়</option>
            <option value="suspended">সাসপেন্ড</option>
            <option value="inactive">নিষ্ক্রিয়</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as TutorPlan)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">সব প্ল্যান</option>
            <option value="free">ফ্রি</option>
            <option value="basic">বেসিক</option>
            <option value="pro">প্রো</option>
          </select>
        </div>

        {selectedTutors.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {toBanglaNumber(selectedTutors.length)} জন নির্বাচিত
            </span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              এক্সপোর্ট
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedTutors([])}>
              <X className="w-4 h-4 mr-2" />
              বাতিল
            </Button>
          </div>
        )}
      </Card>

      {/* Tutors Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 w-10">
                  <Checkbox 
                    checked={selectedTutors.length === paginatedTutors.length && paginatedTutors.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium">টিউটর</th>
                <th className="p-4 text-left text-sm font-medium">প্ল্যান</th>
                <th className="p-4 text-left text-sm font-medium">শিক্ষার্থী</th>
                <th className="p-4 text-left text-sm font-medium">রাজস্ব</th>
                <th className="p-4 text-left text-sm font-medium">স্ট্যাটাস</th>
                <th className="p-4 text-left text-sm font-medium">শেষ অ্যাক্টিভ</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedTutors.map((tutor) => (
                <tr key={tutor.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    <Checkbox 
                      checked={selectedTutors.includes(tutor.id)}
                      onCheckedChange={() => handleSelectTutor(tutor.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {tutor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{tutor.name}</p>
                        <p className="text-sm text-muted-foreground">{tutor.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{getPlanBadge(tutor.plan)}</td>
                  <td className="p-4">
                    <span className="font-medium">{toBanglaNumber(tutor.studentCount)}</span>
                    <span className="text-sm text-muted-foreground"> জন</span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{formatTaka(tutor.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{formatTaka(tutor.monthlyFee)}/মাস</p>
                  </td>
                  <td className="p-4">{getStatusBadge(tutor.status)}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(tutor.lastActive).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tutors/${tutor.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            দেখুন
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessage(tutor)}>
                          <Mail className="w-4 h-4 mr-2" />
                          মেসেজ পাঠান
                        </DropdownMenuItem>
                        {tutor.status !== 'suspended' ? (
                          <DropdownMenuItem 
                            onClick={() => updateTutorStatus(tutor.id, 'suspended')}
                            className="text-destructive"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            সাসপেন্ড করুন
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => updateTutorStatus(tutor.id, 'active')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            সক্রিয় করুন
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(tutor.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          মুছুন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedTutors.length === 0 && (
          <div className="p-12 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {tutors.length === 0 ? 'কোনো টিউটর যোগ করা হয়নি' : 'কোনো টিউটর পাওয়া যায়নি'}
            </p>
            {tutors.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                টিউটর যোগ করুন
              </Button>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              মোট {toBanglaNumber(filteredTutors.length)} জন
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                পেজ {toBanglaNumber(currentPage)} / {toBanglaNumber(totalPages)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
