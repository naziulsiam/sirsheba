'use client'

import { useLocalStorage, generateId } from './use-local-storage'
import type { Student, Batch, FeePayment, Attendance, Exam, ExamResult, SMSLog, TutorSettings, ReminderSettings, AuthUser, AuthSession, AdminTutor, AdminMetrics, RevenueData, FailedPayment, Invoice, PromoCode, SystemAlert } from '@/lib/types'

// Sample data for demo
const SAMPLE_BATCHES: Batch[] = [
  { id: 'batch-1', name: 'HSC Science 2026 (সোম-বুধ)', schedule: 'সোমবার, বুধবার - সন্ধ্যা ৬টা', subject: 'পদার্থবিদ্যা' },
  { id: 'batch-2', name: 'HSC Science 2026 (মঙ্গল-বৃহঃ)', schedule: 'মঙ্গলবার, বৃহস্পতিবার - সন্ধ্যা ৬টা', subject: 'পদার্থবিদ্যা' },
  { id: 'batch-3', name: 'HSC Science 2027', schedule: 'শুক্রবার - সকাল ১০টা', subject: 'পদার্থবিদ্যা' },
]

const SAMPLE_STUDENTS: Student[] = [
  { id: 'std-1', nameBn: 'রাকিব হাসান', nameEn: 'Rakib Hasan', fatherPhone: '01712345678', motherPhone: '01812345678', batchId: 'batch-1', monthlyFee: 4000, joinDate: '2025-01-15', active: true },
  { id: 'std-2', nameBn: 'ফাতেমা আক্তার', nameEn: 'Fatema Akter', fatherPhone: '01912345678', motherPhone: '01612345678', batchId: 'batch-1', monthlyFee: 4000, joinDate: '2025-01-20', active: true },
  { id: 'std-3', nameBn: 'মোহাম্মদ আরিফ', nameEn: 'Mohammad Arif', fatherPhone: '01512345678', motherPhone: '01412345678', batchId: 'batch-2', monthlyFee: 3500, joinDate: '2025-02-01', active: true },
  { id: 'std-4', nameBn: 'নুসরাত জাহান', nameEn: 'Nusrat Jahan', fatherPhone: '01312345678', motherPhone: '01712345679', batchId: 'batch-2', monthlyFee: 3500, joinDate: '2025-02-10', active: true },
  { id: 'std-5', nameBn: 'তানভীর আহমেদ', nameEn: 'Tanvir Ahmed', fatherPhone: '01812345679', motherPhone: '01912345679', batchId: 'batch-3', monthlyFee: 5000, joinDate: '2025-03-01', active: true },
  { id: 'std-6', nameBn: 'রাহিম আহমেদ', nameEn: 'Rahim Ahmed', fatherPhone: '01711111111', motherPhone: '01811111111', batchId: 'batch-1', monthlyFee: 2500, joinDate: '2025-01-10', active: true },
  { id: 'std-7', nameBn: 'করিম হোসেন', nameEn: 'Karim Hossain', fatherPhone: '01722222222', motherPhone: '01822222222', batchId: 'batch-1', monthlyFee: 2500, joinDate: '2025-01-12', active: true },
  { id: 'std-8', nameBn: 'সালমা খাতুন', nameEn: 'Salma Khatun', fatherPhone: '01733333333', motherPhone: '01833333333', batchId: 'batch-1', monthlyFee: 2500, joinDate: '2025-01-15', active: true },
  { id: 'std-9', nameBn: 'জামিল হাসান', nameEn: 'Jamil Hasan', fatherPhone: '01744444444', motherPhone: '01844444444', batchId: 'batch-1', monthlyFee: 2500, joinDate: '2025-01-18', active: true },
  { id: 'std-10', nameBn: 'তাসনিম আক্তার', nameEn: 'Tasnim Akter', fatherPhone: '01755555555', motherPhone: '01855555555', batchId: 'batch-1', monthlyFee: 2500, joinDate: '2025-01-20', active: true },
  { id: 'std-11', nameBn: 'ইমরান হোসেন', nameEn: 'Imran Hossain', fatherPhone: '01766666666', motherPhone: '01866666666', batchId: 'batch-2', monthlyFee: 3000, joinDate: '2025-02-01', active: true },
  { id: 'std-12', nameBn: 'রিফাত জাহান', nameEn: 'Rifat Jahan', fatherPhone: '01777777777', motherPhone: '01877777777', batchId: 'batch-2', monthlyFee: 3000, joinDate: '2025-02-05', active: true },
  { id: 'std-13', nameBn: 'সাকিব আহমেদ', nameEn: 'Sakib Ahmed', fatherPhone: '01788888888', motherPhone: '01888888888', batchId: 'batch-2', monthlyFee: 3000, joinDate: '2025-02-08', active: true },
  { id: 'std-14', nameBn: 'মিমি আক্তার', nameEn: 'Mimi Akter', fatherPhone: '01799999999', motherPhone: '01899999999', batchId: 'batch-2', monthlyFee: 3000, joinDate: '2025-02-10', active: true },
  { id: 'std-15', nameBn: 'সজীব হাসান', nameEn: 'Sajib Hasan', fatherPhone: '01700000000', motherPhone: '01800000000', batchId: 'batch-3', monthlyFee: 3500, joinDate: '2025-03-01', active: true },
]

const SAMPLE_FEES: FeePayment[] = [
  { id: 'fee-1', studentId: 'std-1', amount: 4000, date: '2025-03-05', month: 3, year: 2025, type: 'cash' },
  { id: 'fee-2', studentId: 'std-2', amount: 4000, date: '2025-03-08', month: 3, year: 2025, type: 'cash' },
  { id: 'fee-3', studentId: 'std-3', amount: 2000, date: '2025-03-10', month: 3, year: 2025, type: 'cash', notes: 'আংশিক পরিশোধ' },
]

const DEFAULT_SETTINGS: TutorSettings = {
  name: 'Rahim Sir',
  nameBn: 'রহিম স্যার',
  phone: '01700000000',
  language: 'bn',
  reminders: {
    feeReminderDay: 5,
    absenceAlert: true,
    dailySummary: true,
    monthlyReport: true,
  }
}

const DEFAULT_REMINDERS: ReminderSettings = {
  feeReminderDay: 5,
  absenceAlert: true,
  dailySummary: true,
  monthlyReport: true,
}

// Students Store
export function useStudents() {
  const [students, setStudents, isHydrated] = useLocalStorage<Student[]>('sirsheba-students', SAMPLE_STUDENTS)

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: generateId() }
    setStudents(prev => [...prev, newStudent])
    return newStudent
  }

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  const getStudent = (id: string) => students.find(s => s.id === id)

  return { students, addStudent, updateStudent, deleteStudent, getStudent, isHydrated }
}

// Batches Store
export function useBatches() {
  const [batches, setBatches, isHydrated] = useLocalStorage<Batch[]>('sirsheba-batches', SAMPLE_BATCHES)

  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: generateId() }
    setBatches(prev => [...prev, newBatch])
    return newBatch
  }

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(b => b.id !== id))
  }

  const getBatch = (id: string) => batches.find(b => b.id === id)

  return { batches, addBatch, updateBatch, deleteBatch, getBatch, isHydrated }
}

// Fee Payments Store
export function useFeePayments() {
  const [payments, setPayments, isHydrated] = useLocalStorage<FeePayment[]>('sirsheba-fees', SAMPLE_FEES)

  const addPayment = (payment: Omit<FeePayment, 'id'>) => {
    const newPayment = { ...payment, id: generateId() }
    setPayments(prev => [...prev, newPayment])
    return newPayment
  }

  const updatePayment = (id: string, updates: Partial<FeePayment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  const getStudentPayments = (studentId: string) => payments.filter(p => p.studentId === studentId)

  const getTodaysPayments = () => {
    const today = new Date().toISOString().split('T')[0]
    return payments.filter(p => p.date === today)
  }

  const getMonthlyPayments = (month: number, year: number) => {
    return payments.filter(p => p.month === month && p.year === year)
  }

  return { payments, addPayment, updatePayment, deletePayment, getStudentPayments, getTodaysPayments, getMonthlyPayments, isHydrated }
}

// Attendance Store
export function useAttendance() {
  const [attendance, setAttendance, isHydrated] = useLocalStorage<Attendance[]>('sirsheba-attendance', [])

  const markAttendance = (record: Omit<Attendance, 'id'>) => {
    // Check if attendance already exists for this student on this date
    const existing = attendance.find(a => a.studentId === record.studentId && a.date === record.date)
    if (existing) {
      setAttendance(prev => prev.map(a => 
        a.id === existing.id ? { ...a, status: record.status } : a
      ))
      return existing
    }
    const newRecord = { ...record, id: generateId() }
    setAttendance(prev => [...prev, newRecord])
    return newRecord
  }

  const getDateAttendance = (date: string) => attendance.filter(a => a.date === date)

  const getStudentAttendance = (studentId: string) => attendance.filter(a => a.studentId === studentId)

  const getMonthlyAttendance = (studentId: string, month: number, year: number) => {
    return attendance.filter(a => {
      const date = new Date(a.date)
      return a.studentId === studentId && date.getMonth() + 1 === month && date.getFullYear() === year
    })
  }

  return { attendance, markAttendance, getDateAttendance, getStudentAttendance, getMonthlyAttendance, isHydrated }
}

// Exams Store
export function useExams() {
  const [exams, setExams, isHydrated] = useLocalStorage<Exam[]>('sirsheba-exams', [])

  const addExam = (exam: Omit<Exam, 'id'>) => {
    const newExam = { ...exam, id: generateId() }
    setExams(prev => [...prev, newExam])
    return newExam
  }

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id))
  }

  const getExam = (id: string) => exams.find(e => e.id === id)

  return { exams, addExam, updateExam, deleteExam, getExam, isHydrated }
}

// Exam Results Store
export function useExamResults() {
  const [results, setResults, isHydrated] = useLocalStorage<ExamResult[]>('sirsheba-results', [])

  const addResult = (result: Omit<ExamResult, 'id'>) => {
    // Check if result already exists
    const existing = results.find(r => r.examId === result.examId && r.studentId === result.studentId)
    if (existing) {
      setResults(prev => prev.map(r => 
        r.id === existing.id ? { ...r, ...result } : r
      ))
      return existing
    }
    const newResult = { ...result, id: generateId() }
    setResults(prev => [...prev, newResult])
    return newResult
  }

  const getExamResults = (examId: string) => results.filter(r => r.examId === examId)

  const getStudentResults = (studentId: string) => results.filter(r => r.studentId === studentId)

  return { results, addResult, getExamResults, getStudentResults, isHydrated }
}

// SMS Logs Store
export function useSMSLogs() {
  const [logs, setLogs, isHydrated] = useLocalStorage<SMSLog[]>('sirsheba-sms', [])

  const addLog = (log: Omit<SMSLog, 'id'>) => {
    const newLog = { ...log, id: generateId() }
    setLogs(prev => [...prev, newLog])
    return newLog
  }

  const updateLogStatus = (id: string, status: SMSLog['status']) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const getStudentLogs = (studentId: string) => logs.filter(l => l.studentId === studentId)

  const getPendingLogs = () => logs.filter(l => l.status === 'pending')

  return { logs, addLog, updateLogStatus, getStudentLogs, getPendingLogs, isHydrated }
}

// Settings Store
export function useSettings() {
  const [settings, setSettings, isHydrated] = useLocalStorage<TutorSettings>('sirsheba-settings', DEFAULT_SETTINGS)

  const updateSettings = (updates: Partial<TutorSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  const updateReminders = (reminders: Partial<ReminderSettings>) => {
    setSettings(prev => ({ 
      ...prev, 
      reminders: { ...(prev.reminders || DEFAULT_REMINDERS), ...reminders }
    }))
  }

  return { settings, updateSettings, updateReminders, isHydrated }
}

// Sample Admin Data
const SAMPLE_ADMIN_TUTORS: AdminTutor[] = [
  { id: 'tutor-1', name: 'Rahim Ahmed', phone: '01711111111', plan: 'pro', planExpiry: '2025-12-31', studentCount: 45, monthlyFee: 999, lastActive: new Date().toISOString(), status: 'active', revenue: 45000, smsSent: 1200, joinedAt: '2024-01-15' },
  { id: 'tutor-2', name: 'Karim Hossain', phone: '01722222222', plan: 'basic', planExpiry: '2025-06-30', studentCount: 25, monthlyFee: 499, lastActive: new Date(Date.now() - 86400000).toISOString(), status: 'active', revenue: 12500, smsSent: 450, joinedAt: '2024-03-10' },
  { id: 'tutor-3', name: 'Salma Khatun', phone: '01733333333', plan: 'pro', planExpiry: '2025-09-15', studentCount: 60, monthlyFee: 999, lastActive: new Date(Date.now() - 172800000).toISOString(), status: 'active', revenue: 60000, smsSent: 2100, joinedAt: '2024-02-01' },
  { id: 'tutor-4', name: 'Jamil Hasan', phone: '01744444444', plan: 'free', planExpiry: '2025-04-01', studentCount: 12, monthlyFee: 0, lastActive: new Date(Date.now() - 604800000).toISOString(), status: 'inactive', revenue: 0, smsSent: 80, joinedAt: '2024-05-20' },
  { id: 'tutor-5', name: 'Tasnim Akter', phone: '01755555555', plan: 'basic', planExpiry: '2025-05-15', studentCount: 30, monthlyFee: 499, lastActive: new Date().toISOString(), status: 'suspended', revenue: 15000, smsSent: 600, joinedAt: '2024-04-08' },
]

const SAMPLE_REVENUE_DATA: RevenueData[] = [
  { month: 'Oct', revenue: 125000, newTutors: 12 },
  { month: 'Nov', revenue: 142000, newTutors: 15 },
  { month: 'Dec', revenue: 158000, newTutors: 18 },
  { month: 'Jan', revenue: 175000, newTutors: 22 },
  { month: 'Feb', revenue: 189000, newTutors: 19 },
  { month: 'Mar', revenue: 210000, newTutors: 25 },
]

const SAMPLE_FAILED_PAYMENTS: FailedPayment[] = [
  { id: 'fp-1', tutorId: 'tutor-2', tutorName: 'Karim Hossain', amount: 499, date: '2025-03-15', reason: 'Insufficient funds', retryCount: 2 },
  { id: 'fp-2', tutorId: 'tutor-5', tutorName: 'Tasnim Akter', amount: 499, date: '2025-03-14', reason: 'Card expired', retryCount: 1 },
]

const SAMPLE_INVOICES: Invoice[] = [
  { id: 'inv-1', tutorId: 'tutor-1', tutorName: 'Rahim Ahmed', amount: 999, status: 'paid', createdAt: '2025-03-01', paidAt: '2025-03-01' },
  { id: 'inv-2', tutorId: 'tutor-2', tutorName: 'Karim Hossain', amount: 499, status: 'failed', createdAt: '2025-03-01' },
  { id: 'inv-3', tutorId: 'tutor-3', tutorName: 'Salma Khatun', amount: 999, status: 'paid', createdAt: '2025-03-01', paidAt: '2025-03-02' },
]

const SAMPLE_PROMO_CODES: PromoCode[] = [
  { id: 'promo-1', code: 'WELCOME50', discount: 50, validUntil: '2025-06-30', usageLimit: 100, usageCount: 45 },
  { id: 'promo-2', code: 'PRO20', discount: 20, validUntil: '2025-12-31', usageLimit: 200, usageCount: 78 },
]

const SAMPLE_ALERTS: SystemAlert[] = [
  { id: 'alert-1', type: 'warning', message: 'Payment failure rate above 5%', createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: 'alert-2', type: 'info', message: 'New tutor signups up 25% this week', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: 'alert-3', type: 'error', message: 'SMS gateway connection timeout', createdAt: new Date(Date.now() - 7200000).toISOString(), read: false },
]

// Auth Store
export function useAuth() {
  const [session, setSession, isHydrated] = useLocalStorage<AuthSession | null>('sirsheba-auth', null)

  const login = (phone: string, otp: string): boolean => {
    // Mock OTP verification - in production this would verify against a backend
    if (otp === '1234' || otp === '0000') {
      const user: AuthUser = {
        id: generateId(),
        phone,
        name: phone === '01700000000' ? 'Admin' : 'Tutor',
        role: phone === '01700000000' ? 'admin' : 'tutor',
        createdAt: new Date().toISOString(),
      }
      const newSession: AuthSession = {
        user,
        token: generateId(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
      setSession(newSession)
      return true
    }
    return false
  }

  const setupPin = (pin: string) => {
    if (session) {
      setSession({
        ...session,
        user: { ...session.user, pin }
      })
    }
  }

  const verifyPin = (pin: string): boolean => {
    return session?.user.pin === pin
  }

  const enableBiometric = () => {
    if (session) {
      setSession({
        ...session,
        user: { ...session.user, biometricEnabled: true }
      })
    }
  }

  const logout = () => {
    setSession(null)
  }

  const isAuthenticated = () => {
    if (!session) return false
    return new Date(session.expiresAt) > new Date()
  }

  return { session, login, logout, setupPin, verifyPin, enableBiometric, isAuthenticated, isHydrated }
}

// Admin Store
export function useAdmin() {
  const [tutors, setTutors, isHydratedTutors] = useLocalStorage<AdminTutor[]>('sirsheba-admin-tutors', SAMPLE_ADMIN_TUTORS)
  const [invoices, setInvoices, isHydratedInvoices] = useLocalStorage<Invoice[]>('sirsheba-admin-invoices', SAMPLE_INVOICES)
  const [promoCodes, setPromoCodes, isHydratedPromos] = useLocalStorage<PromoCode[]>('sirsheba-admin-promos', SAMPLE_PROMO_CODES)
  const [alerts, setAlerts, isHydratedAlerts] = useLocalStorage<SystemAlert[]>('sirsheba-admin-alerts', SAMPLE_ALERTS)

  const isHydrated = isHydratedTutors && isHydratedInvoices && isHydratedPromos && isHydratedAlerts

  const getMetrics = (): AdminMetrics => {
    const activeTutors = tutors.filter(t => t.status === 'active').length
    const mrr = tutors
      .filter(t => t.status === 'active')
      .reduce((sum, t) => sum + t.monthlyFee, 0)
    const smsSent = tutors.reduce((sum, t) => sum + t.smsSent, 0)
    const churned = tutors.filter(t => t.status === 'inactive').length
    const churnRate = tutors.length > 0 ? (churned / tutors.length) * 100 : 0
    
    return { activeTutors, mrr, smsSent, churnRate }
  }

  const getRevenueData = (): RevenueData[] => SAMPLE_REVENUE_DATA

  const getFailedPayments = (): FailedPayment[] => SAMPLE_FAILED_PAYMENTS

  const updateTutorStatus = (id: string, status: AdminTutor['status']) => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const addPromoCode = (code: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newCode: PromoCode = { ...code, id: generateId(), usageCount: 0 }
    setPromoCodes(prev => [...prev, newCode])
    return newCode
  }

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const impersonateTutor = (tutorId: string) => {
    // In a real app, this would create a temporary session
    const tutor = tutors.find(t => t.id === tutorId)
    return tutor
  }

  return {
    tutors,
    invoices,
    promoCodes,
    alerts,
    getMetrics,
    getRevenueData,
    getFailedPayments,
    updateTutorStatus,
    addPromoCode,
    markAlertRead,
    impersonateTutor,
    isHydrated
  }
}
