'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HelpCircle, MessageCircle, Phone, Mail, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function AdminSupportPage() {
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [ticket, setTicket] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitTicket = async () => {
    if (!ticket.subject.trim() || !ticket.message.trim()) return
    
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitting(false)
    setShowTicketDialog(false)
    setTicket({ subject: '', message: '' })
    alert('টিকিট জমা দেওয়া হয়েছে!')
  }

  const handleStartChat = () => {
    alert('লাইভ চ্যাট শীঘ্রই আসছে...')
  }

  const handleCall = () => {
    window.location.href = 'tel:01700000000'
  }

  const handleEmail = () => {
    window.location.href = 'mailto:support@sirsheba.com'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">সাপোর্ট</h1>
          <p className="text-muted-foreground">টিউটরদের সাপোর্ট টিকিট ও প্রশ্নাবলী</p>
        </div>
        <Button onClick={() => setShowTicketDialog(true)}>
          <Send className="w-4 h-4 mr-2" />
          নতুন টিকিট
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">চ্যাট সাপোর্ট</h3>
          <p className="text-sm text-muted-foreground mb-4">লাইভ চ্যাটের মাধ্যমে সাহায্য পান</p>
          <Button className="w-full" onClick={handleStartChat}>
            চ্যাট শুরু করুন
          </Button>
        </Card>

        <Card className="p-5">
          <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-chart-2" />
          </div>
          <h3 className="font-semibold mb-2">ইমেইল সাপোর্ট</h3>
          <p className="text-sm text-muted-foreground mb-4">support@sirsheba.com</p>
          <Button variant="outline" className="w-full" onClick={handleEmail}>
            ইমেইল পাঠান
          </Button>
        </Card>

        <Card className="p-5">
          <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-chart-5" />
          </div>
          <h3 className="font-semibold mb-2">ফোন সাপোর্ট</h3>
          <p className="text-sm text-muted-foreground mb-4">০১৭০০০০০০০০</p>
          <Button variant="outline" className="w-full" onClick={handleCall}>
            কল করুন
          </Button>
        </Card>
      </div>

      {/* Support Tickets */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">সাপোর্ট টিকিট</h3>
        </div>
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">কোনো সাপোর্ট টিকিট নেই</p>
          <Button onClick={() => setShowTicketDialog(true)}>
            <Send className="w-4 h-4 mr-2" />
            নতুন টিকিট তৈরি করুন
          </Button>
        </div>
      </Card>

      {/* New Ticket Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন সাপোর্ট টিকিট</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>বিষয়</Label>
              <Input
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                placeholder="টিকিটের বিষয়"
              />
            </div>
            <div>
              <Label>বিবরণ</Label>
              <textarea
                value={ticket.message}
                onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                placeholder="সমস্যার বিস্তারিত বর্ণনা..."
                className="w-full h-32 p-3 rounded-md border border-input bg-background resize-none"
              />
            </div>
            <Button 
              onClick={handleSubmitTicket}
              className="w-full"
              disabled={!ticket.subject.trim() || !ticket.message.trim() || submitting}
            >
              {submitting ? 'জমা দেওয়া হচ্ছে...' : 'জমা দিন'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
