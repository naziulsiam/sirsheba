'use client'

import { Card } from '@/components/ui/card'
import { MessageSquare, TrendingUp, Users, CreditCard } from 'lucide-react'

export default function AdminSMSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMS ব্যবস্থাপনা</h1>
        <p className="text-muted-foreground">সিস্টেমের সব SMS কার্যকলাপ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">আজকের SMS</p>
              <p className="text-2xl font-bold">১,২৩৪</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট এই মাসে</p>
              <p className="text-2xl font-bold">৪৫,৬৭৮</p>
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
              <p className="text-2xl font-bold">৮৯</p>
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
              <p className="text-2xl font-bold">৳১২,৩৪৫</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-12 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">SMS লগ এখানে দেখা যাবে</p>
      </Card>
    </div>
  )
}
