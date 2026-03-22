'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Delete } from 'lucide-react'

interface PINPadProps {
    value: string
    onChange: (value: string) => void
    maxLength?: number
    onSubmit?: () => void
    disabled?: boolean
    label?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

export function PINPad({ value, onChange, maxLength = 6, onSubmit, disabled = false, label }: PINPadProps) {
    const [visible, setVisible] = useState(false)

    const handleKey = (key: string) => {
        if (disabled) return
        if (key === 'del') {
            onChange(value.slice(0, -1))
        } else if (key && value.length < maxLength) {
            onChange(value + key)
        }
    }

    return (
        <div className="flex flex-col items-center gap-6">
            {label && <p className="text-sm text-muted-foreground">{label}</p>}

            {/* PIN display */}
            <div className="flex gap-3">
                {Array.from({ length: maxLength }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-4 w-4 rounded-full border-2 transition-all ${i < value.length
                                ? 'border-primary bg-primary scale-110'
                                : 'border-muted-foreground/30'
                            }`}
                    />
                ))}
            </div>

            {/* Numeric grid */}
            <div className="grid grid-cols-3 gap-3 w-64">
                {KEYS.map((key, i) => {
                    if (!key) return <div key={i} />
                    if (key === 'del') {
                        return (
                            <button
                                key={i}
                                onClick={() => handleKey('del')}
                                disabled={disabled || value.length === 0}
                                className="flex h-16 w-full items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all active:scale-95 disabled:opacity-30"
                                aria-label="Delete"
                            >
                                <Delete className="h-5 w-5" />
                            </button>
                        )
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => handleKey(key)}
                            disabled={disabled}
                            className="flex h-16 w-full flex-col items-center justify-center rounded-2xl border border-border bg-card text-xl font-semibold shadow-sm transition-all active:scale-95 active:bg-primary/10 disabled:opacity-30"
                        >
                            {key}
                        </button>
                    )
                })}
            </div>

            {/* Submit */}
            {onSubmit && (
                <Button
                    onClick={onSubmit}
                    disabled={disabled || value.length < 4}
                    className="w-64 h-12 text-base"
                >
                    প্রবেশ করুন
                </Button>
            )}
        </div>
    )
}
