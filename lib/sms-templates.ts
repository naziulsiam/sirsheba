import type { SMSTemplate } from './types'

export const SMS_TEMPLATES: SMSTemplate[] = [
  {
    id: 'fee-receipt',
    name: 'ফি রসিদ',
    contentBn: 'আপনার সন্তান [StudentName] এর [Month] মাসের ৳[Amount] টিউশন ফি গ্রহণ করা হয়েছে। ধন্যবাদ। - [TutorName]',
    variables: ['StudentName', 'Month', 'Amount', 'TutorName'],
  },
  {
    id: 'fee-reminder',
    name: 'ফি স্মরণ',
    contentBn: 'সম্মানিত অভিভাবক, [StudentName] এর [Month] মাসের ৳[Amount] টিউশন ফি বকেয়া আছে। অনুগ্রহ করে পরিশোধ করুন। - [TutorName]',
    variables: ['StudentName', 'Month', 'Amount', 'TutorName'],
  },
  {
    id: 'absence-alert',
    name: 'অনুপস্থিতি বিজ্ঞপ্তি',
    contentBn: '[StudentName] আজ [Date] ক্লাসে অনুপস্থিত ছিল। অনুগ্রহ করে উপস্থিতি নিশ্চিত করুন। - [TutorName]',
    variables: ['StudentName', 'Date', 'TutorName'],
  },
  {
    id: 'exam-result',
    name: 'পরীক্ষার ফলাফল',
    contentBn: '[StudentName] এর [ExamName] পরীক্ষার ফলাফল: [Marks]/[MaxMarks] (GPA: [GPA])। - [TutorName]',
    variables: ['StudentName', 'ExamName', 'Marks', 'MaxMarks', 'GPA', 'TutorName'],
  },
  {
    id: 'general-announcement',
    name: 'সাধারণ ঘোষণা',
    contentBn: 'সম্মানিত অভিভাবক, [Message] - [TutorName]',
    variables: ['Message', 'TutorName'],
  },
  {
    id: 'class-cancelled',
    name: 'ক্লাস বাতিল',
    contentBn: 'সম্মানিত অভিভাবক, [Date] তারিখের ক্লাস বাতিল করা হয়েছে। পরবর্তী ক্লাস [NextDate] তারিখে অনুষ্ঠিত হবে। - [TutorName]',
    variables: ['Date', 'NextDate', 'TutorName'],
  },
]

export function fillTemplate(
  template: string,
  values: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
  }
  return result
}

// SMS character counter (Bangla uses 2 bytes per character)
export function getSMSCount(text: string): { chars: number; smsCount: number } {
  const chars = text.length
  // Bengali Unicode SMS: 70 chars per SMS
  const smsCount = Math.ceil(chars / 70)
  return { chars, smsCount }
}
