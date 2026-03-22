// Shared auth utilities (safe for both server and client)
// NO next/headers imports here

// ─── Password Validation ─────────────────────────────────────────────────────

export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) return { valid: false, message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' }
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'কমপক্ষে একটি বড় অক্ষর প্রয়োজন' }
    if (!/[0-9]/.test(password)) return { valid: false, message: 'কমপক্ষে একটি সংখ্যা প্রয়োজন' }
    return { valid: true }
}

export function getPasswordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return Math.min(4, score) as 0 | 1 | 2 | 3 | 4
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export function otpExpiresAt(): string {
    return new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
}
