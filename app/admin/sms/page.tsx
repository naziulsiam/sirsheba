'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/hooks/use-store'
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  CreditCard,
  Send,
  Plus
} from 'lucide-react'
import { toBanglaNumber, formatTaka } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminSMSPage() {
  const { tutors, getMetrics } = useAdmin()
  const [mounted, setMounted] = useState(false)
  const metrics = getMetrics()
  const [showSendDialog, setShowSendDialog] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Show loading state while component mounts (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading SMS...</p>
        </div>
      </div>
    )
  }
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendBulkSMS = async () => {
    if (!message.trim()) return
    
    setSending(true)
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSending(false)
    setShowSendDialog(false)
    setMessage('')
    alert('বাল্ক SMS পাঠানো হয়েছে!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SMS ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সিস্টেমের সব SMS কার্যকলাপ</p>
        </div>
        <Button onClick={() => setShowSendDialog(true)}>
          <Send className="w-4 h-4 mr-2" />
          বাল্ক SMS পাঠান
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট SMS</p>
              <p className="text-2xl font-bold">{toBanglaNumber(metrics.smsSent)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">আজকের SMS</p>
              <p className="text-2xl font-bold">০</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chart-5/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-chart-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">সক্রিয় টিউটর</p>
              <p className="text-2xl font-bold">{toBanglaNumber(metrics.activeTutors)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SMS খরচ</p>
              <p className="text-2xl font-bold">{formatTaka(Math.floor(metrics.smsSent * 0.5))}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SMS History */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">সাম্প্রতিক SMS</h3>
        <p className="text-center text-muted-foreground py-8">কোনো SMS রেকর্ড নেই</p>
      </Card>

      {/* Bulk SMS Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>বাল্ক SMS পাঠান</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>প্রাপক</Label>
              <p className="text-sm text-muted-foreground">
                {toBanglaNumber(metrics.activeTutors)} জন সক্রিয় টিউটর
              </p>
            </div>
            <div>
              <Label>মেসেজ</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="আপনার মেসেজ লিখুন..."
                className="w-full h-32 p-3 rounded-md border border-input bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {message.length} অক্ষর
              </p>
            </div>
            <Button 
              onClick={handleSendBulkSMS} 
              className="w-full"
              disabled={!message.trim() || sending}
            >
              {sending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
