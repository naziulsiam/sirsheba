'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { getPasswordStrength } from '@/lib/auth-utils'

interface PasswordInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    showStrength?: boolean
    disabled?: boolean
    id?: string
}

const STRENGTH_LABELS = ['', 'দুর্বল', 'মোটামুটি', 'ভালো', 'শক্তিশালী']
const STRENGTH_COLORS = ['', 'bg-destructive', 'bg-orange-400', 'bg-yellow-400', 'bg-primary']

export function PasswordInput({ value, onChange, placeholder, showStrength, disabled, id }: PasswordInputProps) {
    const [visible, setVisible] = useState(false)
    const strength = showStrength && value ? getPasswordStrength(value) : 0

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder || 'পাসওয়ার্ড'}
                    disabled={disabled}
                    className="pr-12"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setVisible(!visible)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>

            {showStrength && value && (
                <div className="space-y-1">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(level => (
                            <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all ${strength >= level ? STRENGTH_COLORS[Math.min(strength, 4)] : 'bg-muted'
                                    }`}
                            />
                        ))}
                    </div>
                    {strength > 0 && (
                        <p className="text-xs text-muted-foreground">{STRENGTH_LABELS[Math.min(strength, 4)]}</p>
                    )}
                </div>
            )}
        </div>
    )
}
