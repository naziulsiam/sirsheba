'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Sparkles, Loader2, Gift, Clock, Zap } from 'lucide-react'

interface SubscriptionStatus {
    status: 'active' | 'inactive' | 'trial' | 'expired'
    expiryDate?: string
    daysRemaining?: number
    plan: string
}

const plans = [
    {
        id: 'trial',
        name: 'ফ্রি ট্রাইয়াল',
        price: 0,
        period: '৩০ দিন',
        features: [
            'সব প্রো ফিচার ব্যবহার করুন',
            'আনলিমিটেড শিক্ষার্থী',
            'আনলিমিটেড SMS',
            'কোনো ক্রেডিট কার্ড লাগবে না',
        ],
        popular: false,
        isTrial: true,
    },
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
        isTrial: false,
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
        isTrial: false,
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
                    
                    // If already has active subscription, redirect immediately (don't set state)
                    if (data.status === 'active' || data.status === 'trial') {
                        window.location.href = '/' // Hard navigation to ensure redirect works
                        return
                    }
                    
                    // Only set state if NOT redirecting
                    setSubscription(data)
                } else if (res.status === 401) {
                    // Not authenticated, redirect to login
                    window.location.href = '/login'
                    return
                }
            } catch (err) {
                console.error('Failed to check subscription:', err)
            } finally {
                setLoading(false)
            }
        }

        checkSubscription()
    }, [])

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
                window.location.href = '/' // Hard navigation for middleware cookie
            } else {
                const data = await res.json()
                alert(data.error || 'ট্রাইয়াল শুরু করতে সমস্যা হয়েছে')
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
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Checking subscription...</p>
                </div>
            </div>
        )
    }
    
    // If subscription is active/trial, don't render anything (redirect happens in useEffect)
    if (subscription?.status === 'active' || subscription?.status === 'trial') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
            <div className="max-w-6xl mx-auto">
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

                {/* Trial Banner - Prominent */}
                {subscription?.status !== 'trial' && subscription?.status !== 'active' && (
                    <Card className="p-8 mb-10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Gift className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-amber-800">৩০ দিনের ফ্রি ট্রাইয়াল</h3>
                                    <p className="text-sm text-muted-foreground">
                                        সব প্রো ফিচার ফ্রি ব্যবহার করুন • কোনো ক্রেডিট কার্ড লাগবে না
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleStartTrial}
                                disabled={processing === 'trial'}
                                size="lg"
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                            >
                                {processing === 'trial' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        শুরু হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        ট্রাইয়াল শুরু করুন
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Plans Grid - 3 columns on large screens */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`p-6 relative flex flex-col ${plan.popular
                                ? 'border-2 border-primary shadow-lg'
                                : plan.isTrial
                                    ? 'border-2 border-amber-400 shadow-lg bg-gradient-to-b from-amber-50/50 to-background'
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
                            {plan.isTrial && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        ফ্রি
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${plan.isTrial ? 'bg-amber-100' : 'bg-primary/10'
                                    }`}>
                                    {plan.isTrial ? (
                                        <Gift className="w-6 h-6 text-amber-600" />
                                    ) : plan.popular ? (
                                        <Crown className="w-6 h-6 text-primary" />
                                    ) : (
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    {plan.price === 0 ? (
                                        <span className="text-4xl font-bold text-amber-600">ফ্রি</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-bold">৳{plan.price}</span>
                                            <span className="text-muted-foreground">/{plan.period}</span>
                                        </>
                                    )}
                                </div>
                                {plan.isTrial && (
                                    <p className="text-sm text-amber-600 mt-1">৩০ দিনের জন্য</p>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.isTrial ? 'text-amber-600' : 'text-green-600'}`} />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.isTrial ? (
                                <Button
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                    onClick={handleStartTrial}
                                    disabled={processing === 'trial'}
                                >
                                    {processing === 'trial' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            শুরু হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-4 h-4 mr-2" />
                                            ট্রাইয়াল শুরু করুন
                                        </>
                                    )}
                                </Button>
                            ) : (
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
                            )}
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
