'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-store'
import { GraduationCap, Smartphone, KeyRound, Fingerprint, ArrowLeft, Check } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const { session, login, setupPin, verifyPin, enableBiometric, isAuthenticated } = useAuth()
  const [step, setStep] = useState<'phone' | 'otp' | 'pin-setup' | 'pin-verify' | 'biometric'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [rememberDevice, setRememberDevice] = useState(true)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const pinRefs = useRef<(HTMLInputElement | null)[]>([])

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const user = session?.user
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, session, router])

  // Check if user needs PIN setup
  useEffect(() => {
    if (session?.user) {
      if (!session.user.pin) {
        setStep('pin-setup')
      } else if (!session.user.biometricEnabled && window.PublicKeyCredential) {
        setStep('biometric')
      } else {
        const user = session.user
        if (user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    }
  }, [session, router])

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 11) {
      setStep('otp')
      setError('')
      // Auto-focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } else {
      setError('সঠিক মোবাইল নম্বর দিন')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (index === 3 && value) {
      const otpString = [...newOtp.slice(0, 3), value].join('')
      handleOtpSubmit(otpString)
    }
  }

  const handleOtpSubmit = (otpString: string) => {
    const success = login(phone, otpString)
    if (!success) {
      setError('ভুল OTP। আবার চেষ্টা করুন (1234)')
      setOtp(['', '', '', ''])
      otpRefs.current[0]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (value.length > 1) return
    const targetArray = isConfirm ? confirmPin : pin
    const setter = isConfirm ? setConfirmPin : setPin
    const newPin = [...targetArray]
    newPin[index] = value
    setter(newPin)
    setError('')

    const refs = pinRefs.current
    if (value && index < 3) {
      refs[index + 1]?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus()
    }
  }

  const handlePinSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pinString = pin.join('')
    const confirmString = confirmPin.join('')

    if (pinString.length !== 4) {
      setError('৪ ডিজিটের PIN দিন')
      return
    }

    if (pinString !== confirmString) {
      setError('PIN মিলছে না')
      setConfirmPin(['', '', '', ''])
      pinRefs.current[0]?.focus()
      return
    }

    setupPin(pinString)
  }

  const handlePinVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pinString = pin.join('')
    
    if (verifyPin(pinString)) {
      const user = session?.user
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      setError('ভুল PIN')
      setPin(['', '', '', ''])
      pinRefs.current[0]?.focus()
    }
  }

  const handleEnableBiometric = () => {
    enableBiometric()
    const user = session?.user
    if (user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  const skipBiometric = () => {
    const user = session?.user
    if (user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  // Phone Input Step
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">SirSheba</h1>
            <p className="text-muted-foreground">আপনার টিউশন, স্মার্টভাবে</p>
          </div>

          <form onSubmit={handlePhoneSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  মোবাইল নম্বর
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="pl-10 h-12 text-lg"
                    maxLength={11}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full h-12 text-lg" disabled={phone.length < 11}>
                OTP পাঠান
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              লগইন করে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // OTP Step
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <button 
            onClick={() => setStep('phone')}
            className="flex items-center text-muted-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            ফিরে যান
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">OTP দিন</h2>
            <p className="text-muted-foreground text-sm">
              {phone} নম্বরে OTP পাঠানো হয়েছে
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={el => { otpRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-14 h-14 text-center text-2xl font-bold"
                maxLength={1}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center mb-4">{error}</p>
          )}

          <div className="text-center">
            <button className="text-sm text-primary hover:underline">
              OTP আবার পাঠান
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground">
              এই ডিভাইস মনে রাখুন
            </label>
          </div>
        </Card>
      </div>
    )
  }

  // PIN Setup Step
  if (step === 'pin-setup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">PIN সেট করুন</h2>
            <p className="text-muted-foreground text-sm">
              দ্রুত লগইনের জন্য ৪ ডিজিটের PIN সেট করুন
            </p>
          </div>

          <form onSubmit={handlePinSetupSubmit}>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block text-center">
                  নতুন PIN
                </label>
                <div className="flex justify-center gap-3">
                  {pin.map((digit, i) => (
                    <Input
                      key={i}
                      ref={el => { pinRefs.current[i] = el }}
                      type="password"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e)}
                      className="w-14 h-14 text-center text-2xl font-bold"
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block text-center">
                  PIN নিশ্চিত করুন
                </label>
                <div className="flex justify-center gap-3">
                  {confirmPin.map((digit, i) => (
                    <Input
                      key={i}
                      type="password"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value, true)}
                      className="w-14 h-14 text-center text-2xl font-bold"
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full h-12">
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  // Biometric Setup Step
  if (step === 'biometric') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Fingerprint className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">বায়োমেট্রিক সক্রিয় করুন</h2>
            <p className="text-muted-foreground text-sm">
              আরও নিরাপত্তার জন্য আপনার ফিঙ্গারপ্রিন্ট ব্যবহার করুন
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleEnableBiometric}
              className="w-full h-12"
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              সক্রিয় করুন
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={skipBiometric}
              className="w-full"
            >
              এড়িয়ে যান
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return null
}
