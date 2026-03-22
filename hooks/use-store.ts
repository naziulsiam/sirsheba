'use client'

import { useLocalStorage, generateId } from './use-local-storage'
import type { Student, Batch, FeePayment, Attendance, Exam, ExamResult, SMSLog, TutorSettings } from '@/lib/types'

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

  return { settings, updateSettings, isHydrated }
}
