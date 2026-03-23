'use client'

import { useLocalStorage, generateId } from './use-local-storage'
import type { Student, Batch, FeePayment, Attendance, Exam, ExamResult, SMSLog, TutorSettings, ReminderSettings, AuthUser, AuthSession, AdminTutor, AdminMetrics, RevenueData, FailedPayment, Invoice, PromoCode, SystemAlert } from '@/lib/types'

// Default empty states - no demo data
const DEFAULT_SETTINGS: TutorSettings = {
  name: '',
  nameBn: '',
  phone: '',
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
  const [students, setStudents, isHydrated] = useLocalStorage<Student[]>('sirsheba-students', [])

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
  const [batches, setBatches, isHydrated] = useLocalStorage<Batch[]>('sirsheba-batches', [])

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
  const [payments, setPayments, isHydrated] = useLocalStorage<FeePayment[]>('sirsheba-fees', [])

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

// Auth Store
export function useAuth() {
  const [session, setSession, isHydrated] = useLocalStorage<AuthSession | null>('sirsheba-auth', null)

  const sendOTP = async (phone: string): Promise<boolean> => {
    // In production: call API to send OTP
    console.log(`Sending OTP to ${phone}`)
    return true
  }

  const login = (phone: string, otp: string): boolean => {
    // For demo: accept any 4-digit OTP
    if (otp.length === 4 && /^\d{4}$/.test(otp)) {
      const user: AuthUser = {
        id: generateId(),
        phone,
        name: phone === '01700000000' ? 'Admin User' : 'Tutor User',
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
    if (session && pin.length === 4) {
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

  return { session, sendOTP, login, logout, setupPin, verifyPin, enableBiometric, isAuthenticated, isHydrated }
}

// Admin Store - no demo data
export function useAdmin() {
  const [tutors, setTutors, isHydratedTutors] = useLocalStorage<AdminTutor[]>('sirsheba-admin-tutors', [])
  const [invoices, setInvoices, isHydratedInvoices] = useLocalStorage<Invoice[]>('sirsheba-admin-invoices', [])
  const [promoCodes, setPromoCodes, isHydratedPromos] = useLocalStorage<PromoCode[]>('sirsheba-admin-promos', [])
  const [alerts, setAlerts, isHydratedAlerts] = useLocalStorage<SystemAlert[]>('sirsheba-admin-alerts', [])
  const [revenueData, setRevenueData] = useLocalStorage<RevenueData[]>('sirsheba-admin-revenue', [])
  const [failedPayments, setFailedPayments] = useLocalStorage<FailedPayment[]>('sirsheba-admin-failed-payments', [])

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

  const getRevenueData = (): RevenueData[] => revenueData

  const getFailedPayments = (): FailedPayment[] => failedPayments

  const addTutor = (tutor: Omit<AdminTutor, 'id'>) => {
    const newTutor = { ...tutor, id: generateId() }
    setTutors(prev => [...prev, newTutor])
    return newTutor
  }

  const updateTutor = (id: string, updates: Partial<AdminTutor>) => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const updateTutorStatus = (id: string, status: AdminTutor['status']) => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const deleteTutor = (id: string) => {
    setTutors(prev => prev.filter(t => t.id !== id))
  }

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: generateId() }
    setInvoices(prev => [...prev, newInvoice])
    return newInvoice
  }

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const addPromoCode = (code: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newCode: PromoCode = { ...code, id: generateId(), usageCount: 0 }
    setPromoCodes(prev => [...prev, newCode])
    return newCode
  }

  const updatePromoCode = (id: string, updates: Partial<PromoCode>) => {
    setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deletePromoCode = (id: string) => {
    setPromoCodes(prev => prev.filter(p => p.id !== id))
  }

  const addAlert = (alert: Omit<SystemAlert, 'id'>) => {
    const newAlert = { ...alert, id: generateId() }
    setAlerts(prev => [newAlert, ...prev])
    return newAlert
  }

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const addRevenueEntry = (entry: RevenueData) => {
    setRevenueData(prev => [...prev, entry])
  }

  const addFailedPayment = (payment: Omit<FailedPayment, 'id'>) => {
    const newPayment = { ...payment, id: generateId() }
    setFailedPayments(prev => [...prev, newPayment])
    return newPayment
  }

  const updateFailedPayment = (id: string, updates: Partial<FailedPayment>) => {
    setFailedPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteFailedPayment = (id: string) => {
    setFailedPayments(prev => prev.filter(p => p.id !== id))
  }

  const impersonateTutor = (tutorId: string) => {
    const tutor = tutors.find(t => t.id === tutorId)
    return tutor
  }

  return {
    tutors,
    invoices,
    promoCodes,
    alerts,
    revenueData,
    failedPayments,
    getMetrics,
    getRevenueData,
    getFailedPayments,
    addTutor,
    updateTutor,
    updateTutorStatus,
    deleteTutor,
    addInvoice,
    updateInvoice,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    addAlert,
    markAlertRead,
    deleteAlert,
    addRevenueEntry,
    addFailedPayment,
    updateFailedPayment,
    deleteFailedPayment,
    impersonateTutor,
    isHydrated
  }
}
