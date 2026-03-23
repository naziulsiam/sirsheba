'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSettings, useStudents, useBatches, useFeePayments, useAttendance, useExams, useExamResults, useSMSLogs, useAuth, useAuthStore } from '@/hooks/use-store'
import {
  Settings,
  User,
  Download,
  Upload,
  BookOpen,
  FileText,
  ChevronRight,
  Check,
  Trash2,
  Info,
  Bell,
  Calendar,
  Clock,
  FileBarChart,
  Crown,
  Gift,
  AlertTriangle,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const router = useRouter()
  const { settings, updateSettings, updateReminders, isHydrated } = useSettings()
  const { students } = useStudents()
  const { batches } = useBatches()
  const { payments } = useFeePayments()
  const { attendance } = useAttendance()
  const { exams } = useExams()
  const { results } = useExamResults()
  const { logs } = useSMSLogs()
  const { logout, user } = useAuth()
  const { getTrialDaysRemaining } = useAuthStore()
  
  const trialDays = getTrialDaysRemaining()
  const subscription = user?.subscription || 'inactive'

  const [formData, setFormData] = useState({
    name: settings.name,
    nameBn: settings.nameBn,
    phone: settings.phone,
  })
  const [showSaved, setShowSaved] = useState(false)

  const reminders = settings.reminders || {
    feeReminderDay: 5,
    absenceAlert: true,
    dailySummary: true,
    monthlyReport: true,
  }

  if (!isHydrated) {
    return (
      <AppShell title="সেটিংস">
        <div className="p-4">
          <Card className="h-48 animate-pulse bg-muted" />
        </div>
      </AppShell>
    )
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formData)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      settings,
      students,
      batches,
      payments,
      attendance,
      exams,
      results,
      logs,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sirsheba-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.students) localStorage.setItem('sirsheba-students', JSON.stringify(data.students))
          if (data.batches) localStorage.setItem('sirsheba-batches', JSON.stringify(data.batches))
          if (data.payments) localStorage.setItem('sirsheba-fees', JSON.stringify(data.payments))
          if (data.attendance) localStorage.setItem('sirsheba-attendance', JSON.stringify(data.attendance))
          if (data.exams) localStorage.setItem('sirsheba-exams', JSON.stringify(data.exams))
          if (data.results) localStorage.setItem('sirsheba-results', JSON.stringify(data.results))
          if (data.logs) localStorage.setItem('sirsheba-sms', JSON.stringify(data.logs))
          if (data.settings) localStorage.setItem('sirsheba-settings', JSON.stringify(data.settings))
          alert('ব্যাকআপ সফলভাবে আমদানি হয়েছে! পেজ রিফ্রেশ হচ্ছে...')
          window.location.reload()
        } catch {
          alert('ফাইলটি সঠিক ব্যাকআপ ফাইল নয়।')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm('সতর্কতা! সব ডেটা মুছে যাবে। আপনি কি নিশ্চিত?')) {
      if (confirm('দ্বিতীয়বার নিশ্চিত করুন - সব শিক্ষার্থী, ফি, উপস্থিতি মুছে যাবে!')) {
        const keys = ['sirsheba-students', 'sirsheba-batches', 'sirsheba-fees', 'sirsheba-attendance', 'sirsheba-exams', 'sirsheba-results', 'sirsheba-sms']
        keys.forEach(k => localStorage.removeItem(k))
        window.location.reload()
      }
    }
  }

  return (
    <AppShell title="সেটিংস">
      <div className="flex flex-col gap-4 p-4">

        {/* Tutor Profile */}
        <form onSubmit={handleSaveProfile}>
          <Card className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">শিক্ষকের তথ্য</h2>
                <p className="text-xs text-muted-foreground">SMS-এ এই নাম ব্যবহার হবে</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="nameBn">নাম (বাংলা)</Label>
                <Input
                  id="nameBn"
                  placeholder="রহিম স্যার"
                  value={formData.nameBn}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameBn: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="name">নাম (ইংরেজি)</Label>
                <Input
                  id="name"
                  placeholder="Rahim Sir"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">ফোন নম্বর</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="mt-4 w-full h-11">
              {showSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  সংরক্ষিত হয়েছে!
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  সংরক্ষণ করুন
                </>
              )}
            </Button>
          </Card>
        </form>

        {/* Subscription / Trial Status */}
        {subscription === 'inactive' ? (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Crown className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">সাবস্ক্রিপশন নেই</h2>
                <p className="text-xs text-muted-foreground">সব ফিচার ব্যবহার করতে সাবস্ক্রাইব করুন</p>
              </div>
            </div>
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => router.push('/subscription')}
            >
              <Gift className="mr-2 h-4 w-4" />
              ৩০ দিনের ফ্রি ট্রাইয়াল শুরু করুন
            </Button>
          </Card>
        ) : (
          <Card className={`p-4 ${subscription === 'trial' ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200' : 'bg-gradient-to-r from-primary/5 to-chart-2/5'}`}>
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${subscription === 'trial' ? 'bg-amber-500/20' : 'bg-primary/10'}`}>
                {subscription === 'trial' ? (
                  <Gift className="h-5 w-5 text-amber-600" />
                ) : (
                  <Crown className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">
                  {subscription === 'trial' ? 'ট্রাইয়াল চলছে' : 'প্রো সাবস্ক্রিপশন'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {subscription === 'trial' ? '৩০ দিনের ফ্রি ট্রায়াল' : 'সক্রিয় সাবস্ক্রিপশন'}
                </p>
              </div>
            </div>
            
            {subscription === 'trial' && trialDays !== null && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">বাকি দিন</span>
                  <span className={`text-lg font-bold ${trialDays <= 3 ? 'text-destructive' : 'text-amber-600'}`}>
                    {trialDays} দিন
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${trialDays <= 3 ? 'bg-destructive' : 'bg-amber-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, (trialDays / 30) * 100))}%` }}
                  />
                </div>
                
                {trialDays <= 3 && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span>ট্রাইয়াল শেষ হতে চলেছে! আপগ্রেড করুন।</span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/subscription')}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  {trialDays <= 3 ? 'আপগ্রেড করুন' : 'প্ল্যান দেখুন'}
                </Button>
              </div>
            )}
            
            {subscription === 'active' && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Check className="h-4 w-4" />
                <span>সব ফিচার সক্রিয় আছে</span>
              </div>
            )}
          </Card>
        )}

        {/* Smart Reminders */}
        <Card className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold">স্মার্ট রিমাইন্ডার</h2>
              <p className="text-xs text-muted-foreground">স্বয়ংক্রিয় SMS নোটিফিকেশন</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Fee Reminder Day */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">ফি স্মরণ দিন</p>
                  <p className="text-xs text-muted-foreground">প্রতি মাসের কত তারিখে</p>
                </div>
              </div>
              <select
                value={reminders.feeReminderDay}
                onChange={(e) => updateReminders({ feeReminderDay: parseInt(e.target.value) })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {[1, 3, 5, 7, 10, 15].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Absence Alert */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">অনুপস্থিতি অ্যালার্ট</p>
                  <p className="text-xs text-muted-foreground">অনুপস্থিত মার্ক করলে SMS</p>
                </div>
              </div>
              <Switch
                checked={reminders.absenceAlert}
                onCheckedChange={(checked) => updateReminders({ absenceAlert: checked })}
              />
            </div>

            {/* Daily Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">দৈনিক সারাংশ</p>
                  <p className="text-xs text-muted-foreground">রাত ৮টায় দৈনিক রিপোর্ট</p>
                </div>
              </div>
              <Switch
                checked={reminders.dailySummary}
                onCheckedChange={(checked) => updateReminders({ dailySummary: checked })}
              />
            </div>

            {/* Monthly Report */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">মাসিক রিপোর্ট</p>
                  <p className="text-xs text-muted-foreground">প্রতি মাসের ১ তারিখে</p>
                </div>
              </div>
              <Switch
                checked={reminders.monthlyReport}
                onCheckedChange={(checked) => updateReminders({ monthlyReport: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Management Links */}
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 text-sm font-semibold text-muted-foreground">
            পরিচালনা
          </div>
          <Link href="/batches" className="flex items-center justify-between border-t px-4 py-3 transition-colors active:bg-muted">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-chart-2" />
              <span className="font-medium">ব্যাচ ব্যবস্থাপনা</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href="/exams" className="flex items-center justify-between border-t px-4 py-3 transition-colors active:bg-muted">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-chart-5" />
              <span className="font-medium">পরীক্ষা ব্যবস্থাপনা</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </Card>

        {/* Data Backup */}
        <Card className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
              <Download className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <h2 className="font-semibold">ডেটা ব্যাকআপ</h2>
              <p className="text-xs text-muted-foreground">নতুন ফোনে ব্যবহার করুন</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleExport} className="h-11">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={handleImport} className="h-11">
              <Upload className="mr-2 h-4 w-4" />
              Import JSON
            </Button>
          </div>

          {/* Data Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-muted p-2">
              <p className="font-bold text-base">{students.filter(s => s.active).length}</p>
              <p className="text-muted-foreground">শিক্ষার্থী</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="font-bold text-base">{payments.length}</p>
              <p className="text-muted-foreground">ফি লেনদেন</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="font-bold text-base">{logs.length}</p>
              <p className="text-muted-foreground">SMS</p>
            </div>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">SirSheba</h2>
              <p className="text-xs text-muted-foreground">আপনার টিউশন, স্মার্টভাবে</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Version 1.0.0 • Offline-first PWA</p>
          <p className="text-xs text-muted-foreground mt-1">সব ডেটা আপনার ফোনে সংরক্ষিত থাকে</p>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30 p-4">
          <h2 className="mb-3 font-semibold text-destructive">বিপদ এলাকা</h2>
          <Button
            variant="destructive"
            onClick={handleClearData}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            সব ডেটা মুছুন
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            সতর্কতা: এই কাজ পূর্বাবস্থায় ফেরানো যাবে না
          </p>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={async () => {
            await logout()
            router.push('/login')
          }}
          className="w-full h-11"
        >
          লগআউট
        </Button>
      </div>
    </AppShell>
  )
}
