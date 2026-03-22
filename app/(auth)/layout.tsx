import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'SirSheba - লগইন',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-3">
                        <span className="text-3xl">🎓</span>
                    </div>
                    <h1 className="text-2xl font-bold">SirSheba</h1>
                    <p className="text-sm text-muted-foreground mt-1">আপনার টিউশন, স্মার্টভাবে</p>
                </div>
                {children}
            </div>
        </div>
    )
}
