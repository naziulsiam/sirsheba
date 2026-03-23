// Server-only auth library — JWT signing, bcrypt, cookies
// Do NOT import this from client components

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'sirsheba-dev-secret-change-in-production-32ch'
)
const COOKIE_NAME = 'sirsheba_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

export interface JWTPayload {
    sub: string
    email: string
    name: string
    nameBn?: string
    role: 'admin' | 'tutor'
    subscription: 'active' | 'inactive' | 'trial' | 'expired'
    subscriptionExpiry?: string
    iat?: number
    exp?: number
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT(payload as Record<string, unknown>)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as JWTPayload
    } catch {
        return null
    }
}

export async function getSession(): Promise<JWTPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}

export async function setSessionCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION,
        path: '/',
    })
}

export async function clearSessionCookie() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

// ─── Bcrypt ───────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export async function hashPin(pin: string): Promise<string> {
    return bcrypt.hash(pin, 10)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pin, hash)
}

// ─── In-memory PIN attempt tracking ─────────────────────────────────────────

const pinAttempts = new Map<string, { count: number; lockedUntil?: number }>()

export function checkPinAttempts(userId: string): { allowed: boolean; remaining: number } {
    const record = pinAttempts.get(userId)
    if (!record) return { allowed: true, remaining: 3 }
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
        return { allowed: false, remaining: 0 }
    }
    if (record.lockedUntil && Date.now() >= record.lockedUntil) {
        pinAttempts.delete(userId)
        return { allowed: true, remaining: 3 }
    }
    const remaining = Math.max(0, 3 - record.count)
    return { allowed: remaining > 0, remaining }
}

export function recordFailedPinAttempt(userId: string): void {
    const record = pinAttempts.get(userId) || { count: 0 }
    record.count++
    if (record.count >= 3) {
        record.lockedUntil = Date.now() + 15 * 60 * 1000
    }
    pinAttempts.set(userId, record)
}

export function resetPinAttempts(userId: string): void {
    pinAttempts.delete(userId)
}
