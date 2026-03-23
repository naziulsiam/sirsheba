import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface TutorRecord {
    id: string
    full_name: string
    email: string
    phone: string
    password_hash: string | null
    pin_hash: string | null
    email_verified: boolean
    email_otp: string | null
    email_otp_expires_at: string | null
    plan_type: 'free' | 'basic' | 'pro'
    role: 'tutor' | 'admin'
    is_active: boolean
    // Subscription fields
    subscription_status?: 'active' | 'inactive' | 'trial' | 'expired'
    subscription_expiry?: string
    trial_start?: string
    trial_end?: string
    created_at: string
    updated_at: string
}

// ─── Supabase Client ──────────────────────────────────────────────────────────
// Uses service_role key (server-side only, never exposed to browser)
// Falls back to anon key if service role not set
function getSupabaseClient(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) return null

    return createClient(url, key, {
        auth: { persistSession: false },
    })
}

// ─── In-memory Fallback (dev without Supabase) ────────────────────────────────
const memoryStore = new Map<string, TutorRecord>()

function generateId(): string {
    return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

// ─── DB Abstraction ───────────────────────────────────────────────────────────
export const db = {
    async findTutorByEmail(email: string): Promise<TutorRecord | null> {
        const supabase = getSupabaseClient()
        if (supabase) {
            const { data, error } = await supabase
                .from('tutors')
                .select('*')
                .eq('email', email.toLowerCase())
                .single()
            if (error || !data) return null
            return data as TutorRecord
        }
        return Array.from(memoryStore.values()).find(t => t.email === email.toLowerCase()) ?? null
    },

    async findTutorByPhone(phone: string): Promise<TutorRecord | null> {
        const supabase = getSupabaseClient()
        if (supabase) {
            const { data, error } = await supabase
                .from('tutors')
                .select('*')
                .eq('phone', phone)
                .single()
            if (error || !data) return null
            return data as TutorRecord
        }
        return Array.from(memoryStore.values()).find(t => t.phone === phone) ?? null
    },

    async findTutorById(id: string): Promise<TutorRecord | null> {
        const supabase = getSupabaseClient()
        if (supabase) {
            const { data, error } = await supabase
                .from('tutors')
                .select('*')
                .eq('id', id)
                .single()
            if (error || !data) return null
            return data as TutorRecord
        }
        return memoryStore.get(id) ?? null
    },

    async createTutor(data: Omit<TutorRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TutorRecord> {
        const now = new Date().toISOString()
        const supabase = getSupabaseClient()

        if (supabase) {
            const { data: created, error } = await supabase
                .from('tutors')
                .insert({ ...data, email: data.email.toLowerCase() })
                .select()
                .single()
            if (error) throw new Error(error.message)
            return created as TutorRecord
        }

        const tutor: TutorRecord = {
            ...data,
            role: data.role || 'tutor',
            email: data.email.toLowerCase(),
            id: generateId(),
            created_at: now,
            updated_at: now,
        }
        memoryStore.set(tutor.id, tutor)
        return tutor
    },

    async updateTutor(id: string, updates: Partial<TutorRecord>): Promise<TutorRecord | null> {
        const supabase = getSupabaseClient()

        if (supabase) {
            const { data, error } = await supabase
                .from('tutors')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
            if (error || !data) return null
            return data as TutorRecord
        }

        const existing = memoryStore.get(id)
        if (!existing) return null
        const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
        memoryStore.set(id, updated)
        return updated
    },

    // Subscription helpers
    async checkSubscriptionStatus(tutorId: string): Promise<{
        status: 'active' | 'inactive' | 'trial' | 'expired'
        expiryDate?: string
        daysRemaining?: number
    }> {
        const tutor = await this.findTutorById(tutorId)
        if (!tutor) return { status: 'inactive' }

        // Admin always has active subscription
        if (tutor.role === 'admin') {
            return { status: 'active' }
        }

        // Free plan is always active
        if (tutor.plan_type === 'free') {
            return { status: 'active' }
        }

        // Check explicit subscription status
        if (tutor.subscription_status) {
            if (tutor.subscription_status === 'trial' && tutor.trial_end) {
                const trialEnd = new Date(tutor.trial_end)
                const now = new Date()
                if (now > trialEnd) {
                    return { status: 'expired', expiryDate: tutor.trial_end }
                }
                const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return { status: 'trial', expiryDate: tutor.trial_end, daysRemaining }
            }
            
            if (tutor.subscription_expiry) {
                const expiry = new Date(tutor.subscription_expiry)
                const now = new Date()
                if (now > expiry) {
                    return { status: 'expired', expiryDate: tutor.subscription_expiry }
                }
                const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return { 
                    status: tutor.subscription_status, 
                    expiryDate: tutor.subscription_expiry,
                    daysRemaining 
                }
            }
            
            return { status: tutor.subscription_status }
        }

        // Default: inactive
        return { status: 'inactive' }
    },

    async activateSubscription(tutorId: string, plan: 'basic' | 'pro', durationDays: number = 30): Promise<void> {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + durationDays)
        
        await this.updateTutor(tutorId, {
            plan_type: plan,
            subscription_status: 'active',
            subscription_expiry: expiryDate.toISOString(),
        })
    },

    async startTrial(tutorId: string, trialDays: number = 14): Promise<void> {
        const now = new Date()
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + trialDays)
        
        await this.updateTutor(tutorId, {
            subscription_status: 'trial',
            trial_start: now.toISOString(),
            trial_end: trialEnd.toISOString(),
        })
    },
}
