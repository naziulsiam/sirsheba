'use client'

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

interface EmailOTPInputProps {
    value: string
    onChange: (value: string) => void
    length?: number
    disabled?: boolean
}

export function EmailOTPInput({ value, onChange, length = 6, disabled = false }: EmailOTPInputProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])
    const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

    const handleChange = (index: number, val: string) => {
        const newDigits = [...digits]
        const cleaned = val.replace(/\D/g, '').slice(-1)
        newDigits[index] = cleaned
        onChange(newDigits.join(''))
        if (cleaned && index < length - 1) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            const newDigits = [...digits]
            if (newDigits[index]) {
                newDigits[index] = ''
                onChange(newDigits.join(''))
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus()
                newDigits[index - 1] = ''
                onChange(newDigits.join(''))
            }
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
        onChange(text.padEnd(length, '').slice(0, length))
        const nextIndex = Math.min(text.length, length - 1)
        inputsRef.current[nextIndex]?.focus()
    }

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {digits.map((digit, i) => (
                <Input
                    key={i}
                    ref={el => { inputsRef.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    className={`h-14 w-12 text-center text-2xl font-bold transition-all ${digit ? 'border-primary bg-primary/5' : 'border-input'
                        }`}
                />
            ))}
        </div>
    )
}
