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
    is_active: boolean
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
}
