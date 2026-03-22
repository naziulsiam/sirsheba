'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { CheckCircle, Users, Banknote, MessageSquare } from 'lucide-react'

export default function WelcomePage() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()

    useEffect(() => {
        if (!isAuthenticated) router.push('/login')
    }, [isAuthenticated, router])

    const features = [
        { icon: Users, text: 'শিক্ষার্থী ব্যবস্থাপনা' },
        { icon: Banknote, text: 'সহজ ফি আদায়' },
        { icon: MessageSquare, text: 'Bangla SMS নোটিফিকেশন' },
    ]

    return (
        <div className="text-center">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-primary mb-6 animate-in zoom-in duration-500">
                <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>

            <h2 className="text-2xl font-bold mb-2">স্বাগতম! 🎉</h2>
            <p className="text-muted-foreground mb-8">আপনার SirSheba অ্যাকাউন্ট তৈরি হয়েছে</p>

            <div className="space-y-3 mb-8">
                {features.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 bg-primary/5 rounded-xl p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{text}</span>
                        <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                    </div>
                ))}
            </div>

            <Button onClick={() => router.push('/')} className="w-full h-12 text-base">
                শুরু করুন →
            </Button>
        </div>
    )
}
