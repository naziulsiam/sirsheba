'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Settings, Bell, Shield, Database } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">সেটিংস</h1>
        <p className="text-muted-foreground">সিস্টেম সেটিংস ও কনফিগারেশন</p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">নোটিফিকেশন সেটিংস</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">ইমেইল অ্যালার্ট</p>
                <p className="text-sm text-muted-foreground">সিস্টেম অ্যালার্ট ইমেইলে পান</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS অ্যালার্ট</p>
                <p className="text-sm text-muted-foreground">জরুরি অ্যালার্ট SMS এ পান</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-chart-2" />
            <h3 className="font-semibold">নিরাপত্তা</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">টু-ফ্যাক্টর অথেনটিকেশন</p>
                <p className="text-sm text-muted-foreground">অতিরিক্ত নিরাপত্তা স্তর</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">লগিন অ্যাটেম্প্ট লিমিট</p>
                <p className="text-sm text-muted-foreground">৫ বার ভুল লগিনে ব্লক</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-chart-5" />
            <h3 className="font-semibold">ডেটাবেস</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">অটো ব্যাকআপ</p>
                <p className="text-sm text-muted-foreground">প্রতিদিন রাতে ব্যাকআপ</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              ম্যানুয়াল ব্যাকআপ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
