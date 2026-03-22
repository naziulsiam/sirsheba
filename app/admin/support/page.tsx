'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react'

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">সাপোর্ট</h1>
        <p className="text-muted-foreground">টিউটরদের সাপোর্ট টিকিট ও প্রশ্নাবলী</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">চ্যাট সাপোর্ট</h3>
          <p className="text-sm text-muted-foreground mb-4">লাইভ চ্যাটের মাধ্যমে সাহায্য পান</p>
          <Button className="w-full">চ্যাট শুরু করুন</Button>
        </Card>

        <Card className="p-5">
          <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-chart-2" />
          </div>
          <h3 className="font-semibold mb-2">ইমেইল সাপোর্ট</h3>
          <p className="text-sm text-muted-foreground mb-4">support@sirsheba.com</p>
          <Button variant="outline" className="w-full">ইমেইল পাঠান</Button>
        </Card>

        <Card className="p-5">
          <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-chart-5" />
          </div>
          <h3 className="font-semibold mb-2">ফোন সাপোর্ট</h3>
          <p className="text-sm text-muted-foreground mb-4">০১৭০০০০০০০০</p>
          <Button variant="outline" className="w-full">কল করুন</Button>
        </Card>
      </div>

      <Card className="p-12 text-center">
        <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">সাপোর্ট টিকিট এখানে দেখা যাবে</p>
      </Card>
    </div>
  )
}
