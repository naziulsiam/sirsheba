'use client'

import { use } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/hooks/use-store'
import { formatTaka, toBanglaNumber } from '@/lib/types'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Ban, 
  UserCheck,
  LogIn,
  MessageSquare,
  TrendingUp,
  Users,
  CreditCard,
  Calendar
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

const mockRevenueData = [
  { month: 'Oct', revenue: 15000 },
  { month: 'Nov', revenue: 18000 },
  { month: 'Dec', revenue: 22000 },
  { month: 'Jan', revenue: 25000 },
  { month: 'Feb', revenue: 28000 },
  { month: 'Mar', revenue: 32000 },
]

const mockSMSData = [
  { month: 'Oct', count: 150 },
  { month: 'Nov', count: 180 },
  { month: 'Dec', count: 220 },
  { month: 'Jan', count: 250 },
  { month: 'Feb', count: 280 },
  { month: 'Mar', count: 320 },
]

export default function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { tutors, updateTutorStatus, impersonateTutor } = useAdmin()
  
  const tutor = tutors.find(t => t.id === id)

  if (!tutor) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">টিউটর পাওয়া যায়নি</p>
        <Link href="/admin/tutors">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>
        </Link>
      </div>
    )
  }

  const handleImpersonate = () => {
    impersonateTutor(tutor.id)
    // In a real app, this would set a temporary session
    window.open('/', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/tutors">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">টিউটার বিস্তারিত</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImpersonate}>
            <LogIn className="w-4 h-4 mr-2" />
            লগইন অ্যাজ টিউটর
          </Button>
          <Button 
            variant={tutor.status === 'active' ? 'destructive' : 'default'}
            onClick={() => updateTutorStatus(tutor.id, tutor.status === 'active' ? 'suspended' : 'active')}
          >
            {tutor.status === 'active' ? (
              <>
                <Ban className="w-4 h-4 mr-2" />
                সাসপেন্ড
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                সক্রিয় করুন
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              {tutor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h2 className="text-2xl font-bold">{tutor.name}</h2>
              <Badge 
                className={
                  tutor.status === 'active' ? 'bg-green-100 text-green-700' :
                  tutor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }
              >
                {tutor.status === 'active' ? 'সক্রিয়' : 
                 tutor.status === 'suspended' ? 'সাসপেন্ড' : 'নিষ্ক্রিয়'}
              </Badge>
              <Badge 
                className={
                  tutor.plan === 'free' ? 'bg-gray-100 text-gray-700' :
                  tutor.plan === 'basic' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }
              >
                {tutor.plan === 'free' ? 'ফ্রি' : 
                 tutor.plan === 'basic' ? 'বেসিক' : 'প্রো'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {tutor.phone}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                যোগদান: {new Date(tutor.joinedAt).toLocaleDateString('bn-BD')}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              ইমেইল পাঠান
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS পাঠান
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">শিক্ষার্থী</p>
              <p className="text-2xl font-bold">{toBanglaNumber(tutor.studentCount)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মাসিক ফি</p>
              <p className="text-2xl font-bold">{formatTaka(tutor.monthlyFee)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chart-5/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-chart-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SMS পাঠানো</p>
              <p className="text-2xl font-bold">{toBanglaNumber(tutor.smsSent)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট রাজস্ব</p>
              <p className="text-2xl font-bold">{formatTaka(tutor.revenue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">রাজস্ব ট্রেন্ড</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `৳${v/1000}k`} />
                <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, 'রাজস্ব']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* SMS Activity */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">SMS কার্যকলাপ</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSMSData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [v, 'SMS সংখ্যা']} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">প্ল্যান তথ্য</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">বর্তমান প্ল্যান</span>
              <span className="font-medium capitalize">{tutor.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">মাসিক চার্জ</span>
              <span className="font-medium">{formatTaka(tutor.monthlyFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">প্ল্যান মেয়াদ শেষ</span>
              <span className="font-medium">{new Date(tutor.planExpiry).toLocaleDateString('bn-BD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">শেষ অ্যাক্টিভ</span>
              <span className="font-medium">{new Date(tutor.lastActive).toLocaleDateString('bn-BD')}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">দ্রুত কাজ</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="w-4 h-4 mr-2" />
              পেমেন্ট হিস্টরি দেখুন
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS লগ দেখুন
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              শিক্ষার্থী তালিকা দেখুন
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
