'use client'

import { useVoiceInput } from '@/hooks/use-voice-input'
import { Mic, MicOff } from 'lucide-react'

interface VoiceInputButtonProps {
  onResult: (text: string) => void
  language?: string
  className?: string
}

export function VoiceInputButton({ onResult, language = 'bn-BD', className = '' }: VoiceInputButtonProps) {
  const { isListening, toggleListening, isSupported, error } = useVoiceInput({
    onResult,
    language,
  })

  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`
        relative w-10 h-10 rounded-full flex items-center justify-center
        transition-all duration-300
        ${isListening 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
        }
        ${className}
      `}
      title={isListening ? 'শোনা হচ্ছে...' : 'ভয়েস ইনপুট'}
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      
      {/* Ripple effect when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
          <span className="absolute -inset-2 rounded-full border-2 border-red-400 animate-pulse" />
        </>
      )}
    </button>
  )
}
