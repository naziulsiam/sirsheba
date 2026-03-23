'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
    id: string
    email: string
    name: string
    nameBn?: string
    phone: string
    role: 'tutor' | 'admin'
    pin?: string
    biometricEnabled?: boolean
    createdAt?: string
}

export interface AuthSession {
    user: AuthUser
    token: string
    expiresAt: string
}

interface AuthState {
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean
    session: AuthSession | null

    // Actions
    login: (user: AuthUser) => void
    logout: () => Promise<void>
    updateUser: (updates: Partial<AuthUser>) => void
    setLoading: (loading: boolean) => void
    setupPin: (pin: string) => void
    verifyPin: (pin: string) => boolean
    enableBiometric: () => void
    isAuthenticatedCheck: () => boolean
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            session: null,

            login: (user) => {
                const session: AuthSession = {
                    user,
                    token: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                }
                set({ user, isAuthenticated: true, session })
            },

            logout: async () => {
                // Clear server cookie
                try {
                    await fetch('/api/auth/logout', { method: 'POST' })
                } catch { }
                set({ user: null, isAuthenticated: false, session: null })
            },

            updateUser: (updates) =>
                set((state) => {
                    const newUser = state.user ? { ...state.user, ...updates } : null
                    const newSession = state.session && newUser 
                        ? { ...state.session, user: newUser } 
                        : null
                    return { user: newUser, session: newSession }
                }),

            setLoading: (isLoading) => set({ isLoading }),

            setupPin: (pin) => {
                if (pin.length === 4) {
                    get().updateUser({ pin })
                }
            },

            verifyPin: (pin) => {
                return get().user?.pin === pin
            },

            enableBiometric: () => {
                get().updateUser({ biometricEnabled: true })
            },

            isAuthenticatedCheck: () => {
                const state = get()
                if (!state.session) return state.isAuthenticated
                return new Date(state.session.expiresAt) > new Date()
            },
        }),
        {
            name: 'sirsheba-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                session: state.session,
            }),
        }
    )
)

// Backwards compatible hook - wraps the store for old code
export function useAuth() {
    const store = useAuthStore()
    
    return {
        session: store.session,
        user: store.user,
        isAuthenticated: store.isAuthenticatedCheck,
        isHydrated: true, // Zustand persist handles hydration
        login: (phone: string, otp: string): boolean => {
            // For demo: accept any 4-digit OTP
            if (otp.length === 4 && /^\d{4}$/.test(otp)) {
                const user: AuthUser = {
                    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                    phone,
                    email: `${phone}@sirsheba.com`,
                    name: phone === '01700000000' ? 'Admin User' : 'Tutor User',
                    nameBn: phone === '01700000000' ? 'অ্যাডমিন ইউজার' : 'টিউটর ইউজার',
                    role: phone === '01700000000' ? 'admin' : 'tutor',
                    createdAt: new Date().toISOString(),
                }
                store.login(user)
                return true
            }
            return false
        },
        sendOTP: async (phone: string): Promise<boolean> => {
            console.log(`Sending OTP to ${phone}`)
            return true
        },
        setupPin: store.setupPin,
        verifyPin: store.verifyPin,
        enableBiometric: store.enableBiometric,
        logout: store.logout,
    }
}
