'use client'

import { Card } from '@/components/ui/card'
import { useAdmin } from '@/hooks/use-store'
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { toBanglaNumber, formatTaka } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function AdminDashboard() {
  const { getMetrics, getRevenueData, alerts, markAlertRead, tutors } = useAdmin()
  const metrics = getMetrics()
  const revenueData = getRevenueData()

  const unreadAlerts = alerts.filter(a => !a.read)

  // Calculate trend (mock)
  const trends = {
    tutors: { value: 12, isPositive: true },
    revenue: { value: 8, isPositive: true },
    sms: { value: 23, isPositive: true },
    churn: { value: 2, isPositive: false },
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">SirSheba এর সামগ্রিক অবস্থা</p>
        </div>
        <Button variant="outline">
          আজ: {new Date().toLocaleDateString('bn-BD')}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Tutors */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">সক্রিয় টিউটর</p>
              <p className="text-3xl font-bold mt-1">{toBanglaNumber(metrics.activeTutors)}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${trends.tutors.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.tutors.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{trends.tutors.value}%</span>
                <span className="text-muted-foreground">গত মাস থেকে</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        {/* MRR */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">মাসিক রাজস্ব (MRR)</p>
              <p className="text-3xl font-bold mt-1">{formatTaka(metrics.mrr)}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${trends.revenue.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.revenue.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{trends.revenue.value}%</span>
                <span className="text-muted-foreground">গত মাস থেকে</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-2" />
            </div>
          </div>
        </Card>

        {/* SMS Sent */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">SMS পাঠানো হয়েছে</p>
              <p className="text-3xl font-bold mt-1">{toBanglaNumber(metrics.smsSent)}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${trends.sms.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.sms.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{trends.sms.value}%</span>
                <span className="text-muted-foreground">গত মাস থেকে</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-chart-5/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-chart-5" />
            </div>
          </div>
        </Card>

        {/* Churn Rate */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">চার্ন রেট</p>
              <p className="text-3xl font-bold mt-1">{metrics.churnRate.toFixed(1)}%</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${!trends.churn.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {!trends.churn.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{trends.churn.value}%</span>
                <span className="text-muted-foreground">গত মাস থেকে</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">রাজস্ব ট্রেন্ড (শেষ ৬ মাস)</h3>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `৳${value/1000}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`৳${value.toLocaleString()}`, 'রাজস্ব']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#059669" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* New Tutors Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">নতুন টিউটর প্রতি মাসে</h3>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'নতুন টিউটর']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="newTutors" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Alerts */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">সিস্টেম অ্যালার্ট</h3>
            {unreadAlerts.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadAlerts.length}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.read ? 'bg-muted/50' : 'bg-warning/10'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.type === 'error' ? 'bg-destructive' :
                  alert.type === 'warning' ? 'bg-warning' :
                  alert.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${alert.read ? 'text-muted-foreground' : 'font-medium'}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.createdAt).toLocaleTimeString('bn-BD')}
                  </p>
                </div>
                {!alert.read && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => markAlertRead(alert.id)}
                  >
                    পড়েছি
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">সাম্প্রতিক কার্যকলাপ</h3>
            <Button variant="ghost" size="sm">সব দেখুন</Button>
          </div>
          <div className="space-y-3">
            {tutors.slice(0, 5).map((tutor) => (
              <div key={tutor.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {tutor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{tutor.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{toBanglaNumber(tutor.studentCount)} জন</p>
                  <p className="text-xs text-muted-foreground">শিক্ষার্থী</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  tutor.status === 'active' ? 'bg-green-100 text-green-700' :
                  tutor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {tutor.status === 'active' ? 'সক্রিয়' :
                   tutor.status === 'suspended' ? 'সাসপেন্ড' :
                   'নিষ্ক্রিয়'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
