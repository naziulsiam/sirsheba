'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, AlertTriangle, Check, Loader2 } from 'lucide-react'

interface SubscriptionStatus {
    status: 'active' | 'inactive' | 'trial' | 'expired'
    expiryDate?: string
    daysRemaining?: number
    plan: string
}

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkSubscription() {
            try {
                const res = await fetch('/api/subscription/status')
                if (res.ok) {
                    const data = await res.json()
                    setSubscription(data)
                }
            } catch (err) {
                console.error('Failed to check subscription:', err)
            } finally {
                setLoading(false)
            }
        }

        checkSubscription()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // If subscription is active or in trial, show content
    if (subscription?.status === 'active' || subscription?.status === 'trial') {
        return <>{children}</>
    }

    // Show subscription required screen
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="max-w-md w-full p-8 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Crown className="w-10 h-10 text-amber-600" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">সাবস্ক্রিপশন প্রয়োজন</h2>
                <p className="text-muted-foreground mb-6">
                    এই ফিচার ব্যবহার করতে আপনার একটি সক্রিয় সাবস্ক্রিপশন দরকার।
                </p>

                {subscription?.status === 'expired' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-red-700 mb-1">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-medium">সাবস্ক্রিপশন মেয়াদ শেষ</span>
                        </div>
                        <p className="text-sm text-red-600">
                            আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নবায়ন করুন।
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <div className="bg-muted rounded-lg p-4 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="font-medium">বেসিক প্ল্যান</span>
                            <span className="ml-auto text-lg font-bold">৳৪৯৯/মাস</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                            <li>৫০ জন পর্যন্ত শিক্ষার্থী</li>
                            <li>আনলিমিটেড SMS</li>
                            <li>বেসিক রিপোর্টস</li>
                        </ul>
                    </div>

                    <div className="bg-primary/5 border-2 border-primary rounded-lg p-4 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-primary" />
                            <span className="font-medium">প্রো প্ল্যান</span>
                            <span className="ml-auto text-lg font-bold">৳৯৯৯/মাস</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                            <li>আনলিমিটেড শিক্ষার্থী</li>
                            <li>আনলিমিটেড SMS</li>
                            <li>অ্যাডভান্সড রিপোর্টস</li>
                            <li>প্রায়োরিটি সাপোর্ট</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push('/subscription/trial')}
                    >
                        ট্রাইয়াল শুরু করুন
                    </Button>
                    <Button 
                        className="flex-1"
                        onClick={() => router.push('/subscription/purchase')}
                    >
                        সাবস্ক্রাইব করুন
                    </Button>
                </div>
            </Card>
        </div>
    )
}

// Hook to check subscription status
export function useSubscription() {
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkSubscription() {
            try {
                const res = await fetch('/api/subscription/status')
                if (res.ok) {
                    const data = await res.json()
                    setSubscription(data)
                }
            } catch (err) {
                console.error('Failed to check subscription:', err)
            } finally {
                setLoading(false)
            }
        }

        checkSubscription()
    }, [])

    return { subscription, loading, isActive: subscription?.status === 'active' || subscription?.status === 'trial' }
}
