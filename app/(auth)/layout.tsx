import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'SirSheba - লগইন',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 gradient-primary opacity-90" />

            {/* Decorative blobs */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-sm">
                {/* Logo */}
                <div className="mb-7 text-center">
                    <div className="inline-flex h-18 w-18 items-center justify-center rounded-2xl bg-white/20 shadow-elevated backdrop-blur-sm mb-3 border border-white/30 p-4">
                        <span className="text-4xl leading-none select-none">🎓</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">SirSheba</h1>
                    <p className="text-sm text-white/80 mt-1">আপনার টিউশন, স্মার্টভাবে</p>
                </div>

                {/* Card wrapper */}
                <div className="rounded-2xl bg-white shadow-elevated overflow-hidden border border-white/50">
                    <div className="p-6">
                        {children}
                    </div>
                </div>

                <p className="mt-5 text-center text-xs text-white/60">
                    SirSheba • Solo Tutor Platform • Bangladesh
                </p>
            </div>
        </div>
    )
}
