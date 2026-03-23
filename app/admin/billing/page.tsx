'use client'

import { useState, useEffect } from 'react'
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
  Copy,
  Trash2
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function BillingPage() {
  const { 
    getMetrics, 
    getFailedPayments, 
    invoices, 
    promoCodes, 
    addPromoCode, 
    deletePromoCode,
    addInvoice,
    revenueData,
    addRevenueEntry,
    updateInvoice
  } = useAdmin()
  
  const [mounted, setMounted] = useState(false)
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    discount: 20,
    validUntil: '',
    usageLimit: 100,
  })
  const [showAddPromo, setShowAddPromo] = useState(false)
  const [retryingPayment, setRetryingPayment] = useState<string | null>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const metrics = getMetrics()
  const failedPayments = getFailedPayments()
  
  // Show loading state while component mounts (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading billing...</p>
        </div>
      </div>
    )
  }

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

  const handleRetryPayment = async (paymentId: string) => {
    setRetryingPayment(paymentId)
    // Simulate retry
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRetryingPayment(null)
    alert('পেমেন্ট রিট্রাই করা হয়েছে')
  }

  const handleDownloadInvoice = (invoice: typeof invoices[0]) => {
    // Create a simple PDF-like text file for demo
    const content = `
ইনভয়েস
-------
ইনভয়েস নং: ${invoice.id}
টিউটর: ${invoice.tutorName}
পরিমাণ: ${formatTaka(invoice.amount)}
তারিখ: ${new Date(invoice.createdAt).toLocaleDateString('bn-BD')}
স্ট্যাটাস: ${invoice.status === 'paid' ? 'পরিশোধিত' : invoice.status === 'pending' ? 'অপেক্ষমাণ' : 'ব্যর্থ'}
    `.trim()
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeletePromo = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত এই প্রোমো কোড মুছতে চান?')) {
      deletePromoCode(id)
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
                সক্রিয়
              </Badge>
              <span className="text-sm text-muted-foreground">{toBanglaNumber(metrics.activeTutors)} জন টিউটর</span>
            </div>
          </div>
          {revenueData.length > 0 && (
            <div className="h-[120px] w-full lg:w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="miniRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#059669" fill="url(#miniRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
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
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRetryPayment(payment.id)}
                  disabled={retryingPayment === payment.id}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${retryingPayment === payment.id ? 'animate-spin' : ''}`} />
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Bulk download
                invoices.forEach(inv => handleDownloadInvoice(inv))
              }}
            >
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownloadInvoice(invoice)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-center text-muted-foreground py-4">কোনো ইনভয়েস নেই</p>
            )}
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
              <Button size="sm" onClick={() => setShowAddPromo(true)}>
                <Plus className="w-4 h-4 mr-1" />
                নতুন
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন প্রোমো কোড</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>কোড</Label>
                    <Input
                      value={newPromoCode.code}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME50"
                    />
                  </div>
                  <div>
                    <Label>ছাড় (%)</Label>
                    <Input
                      type="number"
                      value={newPromoCode.discount}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, discount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>মেয়াদ শেষ</Label>
                    <Input
                      type="date"
                      value={newPromoCode.validUntil}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, validUntil: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>ব্যবহার সীমা</Label>
                    <Input
                      type="number"
                      value={newPromoCode.usageLimit}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, usageLimit: parseInt(e.target.value) || 0 })}
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
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {toBanglaNumber(promo.usageCount)}/{toBanglaNumber(promo.usageLimit)}
                    </p>
                    <p className="text-xs text-muted-foreground">ব্যবহার</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeletePromo(promo.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {promoCodes.length === 0 && (
              <p className="text-center text-muted-foreground py-4">কোনো প্রোমো কোড নেই</p>
            )}
          </div>
        </Card>
      </div>

      {/* Annual Revenue Projection */}
      {revenueData.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4">রাজস্ব ট্রেন্ড</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `৳${v/1000}k`} />
                <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, 'রাজস্ব']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="url(#revenueGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}
