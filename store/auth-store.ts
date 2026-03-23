'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
    id: string
    email: string
    name: string
    nameBn: string
    phone: string
    role: 'tutor' | 'admin'
}

interface AuthState {
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean

    // Actions
    login: (user: AuthUser) => void
    logout: () => void
    updateUser: (updates: Partial<AuthUser>) => void
    setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user) => set({ user, isAuthenticated: true }),

            logout: async () => {
                // Clear server cookie
                try {
                    await fetch('/api/auth/logout', { method: 'POST' })
                } catch { }
                set({ user: null, isAuthenticated: false })
            },

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'sirsheba-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
