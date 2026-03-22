export interface Student {
  id: string
  nameBn: string
  nameEn: string
  fatherPhone: string
  motherPhone: string
  batchId: string
  monthlyFee: number
  joinDate: string
  photo?: string
  active: boolean
}

export interface Batch {
  id: string
  name: string
  schedule: string
  subject: string
}

export interface FeePayment {
  id: string
  studentId: string
  amount: number
  date: string
  month: number
  year: number
  type: 'cash' | 'digital'
  notes?: string
}

export interface Attendance {
  id: string
  studentId: string
  date: string
  status: 'present' | 'absent'
  batchId: string
}

export interface Exam {
  id: string
  name: string
  date: string
  subject: string
  maxMarks: number
}

export interface ExamResult {
  id: string
  examId: string
  studentId: string
  marks: number
  gpa: number
}

export interface SMSTemplate {
  id: string
  name: string
  contentBn: string
  variables: string[]
}

export interface SMSLog {
  id: string
  studentId: string
  templateId?: string
  content: string
  sentAt: string
  status: 'sent' | 'pending' | 'failed'
  recipientPhone: string
}

export interface TutorSettings {
  name: string
  nameBn: string
  phone: string
  language: 'bn' | 'en'
}

// Bangladesh GPA System
export const GPA_SCALE = [
  { min: 80, max: 100, grade: 'A+', gpa: 5.0 },
  { min: 70, max: 79, grade: 'A', gpa: 4.0 },
  { min: 60, max: 69, grade: 'A-', gpa: 3.5 },
  { min: 50, max: 59, grade: 'B', gpa: 3.0 },
  { min: 40, max: 49, grade: 'C', gpa: 2.0 },
  { min: 33, max: 39, grade: 'D', gpa: 1.0 },
  { min: 0, max: 32, grade: 'F', gpa: 0.0 },
]

export function calculateGPA(marks: number, maxMarks: number): number {
  const percentage = (marks / maxMarks) * 100
  const scale = GPA_SCALE.find(s => percentage >= s.min && percentage <= s.max)
  return scale?.gpa ?? 0
}

export function getGrade(marks: number, maxMarks: number): string {
  const percentage = (marks / maxMarks) * 100
  const scale = GPA_SCALE.find(s => percentage >= s.min && percentage <= s.max)
  return scale?.grade ?? 'F'
}

// Bangla month names
export const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
]

// Convert to Bangla numerals
export function toBanglaNumber(num: number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return num.toString().split('').map(d => banglaDigits[parseInt(d)] || d).join('')
}

// Format currency in Bangladeshi Taka
export function formatTaka(amount: number): string {
  // Apply commas on ASCII digits first, then convert each digit to Bangla
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  const withCommas = amount.toLocaleString('en-IN') // e.g. "3,000"
  const bangla = withCommas.split('').map(c => {
    const d = parseInt(c)
    return isNaN(d) ? c : banglaDigits[d]
  }).join('')
  return `৳${bangla}`
}
