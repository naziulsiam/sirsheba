'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber } from '@/lib/types'
import { 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  RefreshCw,
  Download,
  Plus,
  X,
  Check,
  Copy
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const mockMRRData = [
  { month: 'Oct', mrr: 45000 },
  { month: 'Nov', mrr: 52000 },
  { month: 'Dec', mrr: 58000 },
  { month: 'Jan', mrr: 65000 },
  { month: 'Feb', mrr: 72000 },
  { month: 'Mar', mrr: 89000 },
]

export default function BillingPage() {
  const { getMetrics, getFailedPayments, invoices, promoCodes, addPromoCode } = useAdmin()
  const metrics = getMetrics()
  const failedPayments = getFailedPayments()
  
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    discount: 20,
    validUntil: '',
    usageLimit: 100,
  })
  const [showAddPromo, setShowAddPromo] = useState(false)

  const handleAddPromo = () => {
    if (newPromoCode.code && newPromoCode.validUntil) {
      addPromoCode({
        code: newPromoCode.code.toUpperCase(),
        discount: newPromoCode.discount,
        validUntil: newPromoCode.validUntil,
        usageLimit: newPromoCode.usageLimit,
      })
      setNewPromoCode({ code: '', discount: 20, validUntil: '', usageLimit: 100 })
      setShowAddPromo(false)
    }
  }

  const getInvoiceStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    }
    const labels = {
      paid: 'পরিশোধিত',
      pending: 'অপেক্ষমাণ',
      failed: 'ব্যর্থ',
    }
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">বিলিং</h1>
          <p className="text-muted-foreground">রাজস্ব, পেমেন্ট ও ইনভয়েস ব্যবস্থাপনা</p>
        </div>
      </div>

      {/* MRR Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-chart-2/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-muted-foreground mb-1">মাসিক রিকারিং রাজস্ব (MRR)</p>
            <p className="text-4xl font-bold">{formatTaka(metrics.mrr)}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-100 text-green-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +১২%
              </Badge>
              <span className="text-sm text-muted-foreground">গত মাস থেকে</span>
            </div>
          </div>
          <div className="h-[120px] w-full lg:w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMRRData}>
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Failed Payments */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold">ব্যর্থ পেমেন্ট</h3>
          </div>
          <Badge variant="destructive">{toBanglaNumber(failedPayments.length)} টি</Badge>
        </div>
        <div className="space-y-3">
          {failedPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
              <div>
                <p className="font-medium">{payment.tutorName}</p>
                <p className="text-sm text-muted-foreground">{payment.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(payment.date).toLocaleDateString('bn-BD')} • 
                  রিট্রাই: {toBanglaNumber(payment.retryCount)} বার
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatTaka(payment.amount)}</span>
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  রিট্রাই
                </Button>
              </div>
            </div>
          ))}
          {failedPayments.length === 0 && (
            <p className="text-center text-muted-foreground py-4">কোনো ব্যর্থ পেমেন্ট নেই</p>
          )}
        </div>
      </Card>

      {/* Invoices & Promo Codes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">সাম্প্রতিক ইনভয়েস</h3>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              সব ডাউনলোড
            </Button>
          </div>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.tutorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatTaka(invoice.amount)}</span>
                  {getInvoiceStatusBadge(invoice.status)}
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Promo Codes */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-chart-5" />
              <h3 className="font-semibold">প্রোমো কোড</h3>
            </div>
            <Dialog open={showAddPromo} onOpenChange={setShowAddPromo}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  নতুন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন প্রোমো কোড</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">কোড</label>
                    <Input
                      value={newPromoCode.code}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ছাড় (%)</label>
                    <Input
                      type="number"
                      value={newPromoCode.discount}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, discount: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">মেয়াদ শেষ</label>
                    <Input
                      type="date"
                      value={newPromoCode.validUntil}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, validUntil: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ব্যবহার সীমা</label>
                    <Input
                      type="number"
                      value={newPromoCode.usageLimit}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, usageLimit: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddPromo} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    সংরক্ষণ করুন
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-0.5 rounded text-sm font-bold">
                      {promo.code}
                    </code>
                    <Badge variant="secondary">{promo.discount}% ছাড়</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    মেয়াদ: {new Date(promo.validUntil).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {toBanglaNumber(promo.usageCount)}/{toBanglaNumber(promo.usageLimit)}
                  </p>
                  <p className="text-xs text-muted-foreground">ব্যবহার</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Annual Revenue Projection */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">বার্ষিক রাজস্ব প্রজেকশন</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockMRRData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `৳${v/1000}k`} />
              <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, 'MRR']} />
              <Line 
                type="monotone" 
                dataKey="mrr" 
                stroke="#059669" 
                strokeWidth={2}
                dot={{ fill: '#059669' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
