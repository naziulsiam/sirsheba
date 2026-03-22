// Simple in-memory tutor store for offline/dev mode.
// In production, replace with Supabase calls.

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
    is_active: boolean
    created_at: string
    updated_at: string
}

// In-memory store (resets on server restart in dev)
const tutors = new Map<string, TutorRecord>()

// Supabase client (optional) - install @supabase/supabase-js and configure env vars to enable
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const supabase: null = null

function generateId(): string {
    return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

export const db = {
    async findTutorByEmail(email: string): Promise<TutorRecord | null> {
        if (supabase) {
            const { data } = await (supabase as any).from('tutors').select('*').eq('email', email).single()
            return data
        }
        return Array.from(tutors.values()).find(t => t.email === email) ?? null
    },

    async findTutorByPhone(phone: string): Promise<TutorRecord | null> {
        if (supabase) {
            const { data } = await (supabase as any).from('tutors').select('*').eq('phone', phone).single()
            return data
        }
        return Array.from(tutors.values()).find(t => t.phone === phone) ?? null
    },

    async findTutorById(id: string): Promise<TutorRecord | null> {
        if (supabase) {
            const { data } = await (supabase as any).from('tutors').select('*').eq('id', id).single()
            return data
        }
        return tutors.get(id) ?? null
    },

    async createTutor(data: Omit<TutorRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TutorRecord> {
        const now = new Date().toISOString()
        const tutor: TutorRecord = { ...data, id: generateId(), created_at: now, updated_at: now }
        if (supabase) {
            const { data: created } = await (supabase as any).from('tutors').insert(tutor).select().single()
            return created
        }
        tutors.set(tutor.id, tutor)
        return tutor
    },

    async updateTutor(id: string, updates: Partial<TutorRecord>): Promise<TutorRecord | null> {
        const now = new Date().toISOString()
        if (supabase) {
            const { data } = await (supabase as any)
                .from('tutors').update({ ...updates, updated_at: now }).eq('id', id).select().single()
            return data
        }
        const existing = tutors.get(id)
        if (!existing) return null
        const updated = { ...existing, ...updates, updated_at: now }
        tutors.set(id, updated)
        return updated
    },
}
