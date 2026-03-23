'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Sparkles, Loader2 } from 'lucide-react'

interface SubscriptionStatus {
    status: 'active' | 'inactive' | 'trial' | 'expired'
    expiryDate?: string
    daysRemaining?: number
    plan: string
}

const plans = [
    {
        id: 'basic',
        name: 'বেসিক',
        price: 499,
        period: 'মাসিক',
        features: [
            '৫০ জন পর্যন্ত শিক্ষার্থী',
            'আনলিমিটেড SMS',
            'বেসিক রিপোর্টস',
            'ইমেইল সাপোর্ট',
        ],
        popular: false,
    },
    {
        id: 'pro',
        name: 'প্রো',
        price: 999,
        period: 'মাসিক',
        features: [
            'আনলিমিটেড শিক্ষার্থী',
            'আনলিমিটেড SMS',
            'অ্যাডভান্সড রিপোর্টস',
            'প্রায়োরিটি সাপোর্ট',
            'কাস্টম SMS টেমপ্লেট',
            'ব্যাচ ম্যানেজমেন্ট',
        ],
        popular: true,
    },
]

export default function SubscriptionPage() {
    const router = useRouter()
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        async function checkSubscription() {
            try {
                const res = await fetch('/api/subscription/status')
                if (res.ok) {
                    const data = await res.json()
                    setSubscription(data)
                    
                    // If already has active subscription, redirect to dashboard
                    if (data.status === 'active' || data.status === 'trial') {
                        router.push('/')
                    }
                }
            } catch (err) {
                console.error('Failed to check subscription:', err)
            } finally {
                setLoading(false)
            }
        }

        checkSubscription()
    }, [router])

    const handleSubscribe = async (planId: string) => {
        setProcessing(planId)
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // In production, this would redirect to payment gateway
        alert(`পেমেন্ট প্রসেসিং: ${planId === 'basic' ? 'বেসিক' : 'প্রো'} প্ল্যান`)
        
        setProcessing(null)
    }

    const handleStartTrial = async () => {
        setProcessing('trial')
        
        try {
            const res = await fetch('/api/subscription/trial', { method: 'POST' })
            if (res.ok) {
                router.push('/')
            } else {
                alert('ট্রাইয়াল শুরু করতে সমস্যা হয়েছে')
            }
        } catch (err) {
            console.error('Trial error:', err)
            alert('ট্রাইয়াল শুরু করতে সমস্যা হয়েছে')
        }
        
        setProcessing(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">সাবস্ক্রিপশন প্ল্যান</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        SirSheba এর সম্পূর্ণ ফিচার ব্যবহার করতে একটি প্ল্যান বেছে নিন
                    </p>
                </div>

                {/* Trial Banner */}
                {subscription?.status !== 'trial' && subscription?.status !== 'active' && (
                    <Card className="p-6 mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">১৪ দিনের ফ্রি ট্রাইয়াল</h3>
                                    <p className="text-sm text-muted-foreground">
                                        কোনো ক্রেডিট কার্ড ছাড়াই শুরু করুন
                                    </p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleStartTrial}
                                disabled={processing === 'trial'}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                {processing === 'trial' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        শুরু হচ্ছে...
                                    </>
                                ) : (
                                    'ট্রাইয়াল শুরু করুন'
                                )}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Plans */}
                <div className="grid md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <Card 
                            key={plan.id}
                            className={`p-6 relative ${
                                plan.popular 
                                    ? 'border-2 border-primary shadow-lg' 
                                    : 'border'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                        সবচেয়ে জনপ্রিয়
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold">৳{plan.price}</span>
                                    <span className="text-muted-foreground">/{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button 
                                className="w-full"
                                variant={plan.popular ? 'default' : 'outline'}
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={processing === plan.id}
                            >
                                {processing === plan.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        প্রসেসিং...
                                    </>
                                ) : (
                                    'সাবস্ক্রাইব করুন'
                                )}
                            </Button>
                        </Card>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        কোনো প্রশ্ন আছে?{' '}
                        <a href="/support" className="text-primary hover:underline">
                            সাপোর্টে যোগাযোগ করুন
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
