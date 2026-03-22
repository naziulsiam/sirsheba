'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useStudents, useBatches } from '@/hooks/use-store'
import { ArrowLeft, Save, Check } from 'lucide-react'

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { getStudent, updateStudent, isHydrated: studentsHydrated } = useStudents()
    const { batches, isHydrated: batchesHydrated } = useBatches()

    const isHydrated = studentsHydrated && batchesHydrated

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const student = isHydrated ? getStudent(id) : null

    const [formData, setFormData] = useState({
        nameBn: student?.nameBn ?? '',
        nameEn: student?.nameEn ?? '',
        fatherPhone: student?.fatherPhone ?? '',
        motherPhone: student?.motherPhone ?? '',
        batchId: student?.batchId ?? '',
        monthlyFee: student?.monthlyFee ?? 4000,
    })

    // Sync formData once hydrated
    const [synced, setSynced] = useState(false)
    if (isHydrated && student && !synced) {
        setFormData({
            nameBn: student.nameBn,
            nameEn: student.nameEn,
            fatherPhone: student.fatherPhone,
            motherPhone: student.motherPhone,
            batchId: student.batchId,
            monthlyFee: student.monthlyFee,
        })
        setSynced(true)
    }

    if (!isHydrated) {
        return (
            <AppShell title="সম্পাদনা">
                <div className="p-4">
                    <Card className="h-96 animate-pulse bg-muted" />
                </div>
            </AppShell>
        )
    }

    if (!student) {
        return (
            <AppShell title="সম্পাদনা">
                <div className="p-4 text-center py-20">
                    <p className="text-muted-foreground">শিক্ষার্থী পাওয়া যায়নি</p>
                    <Link href="/students">
                        <Button className="mt-4">ফিরে যান</Button>
                    </Link>
                </div>
            </AppShell>
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        updateStudent(id, formData)
        setShowSuccess(true)
        setTimeout(() => {
            router.push(`/students/${id}`)
        }, 1000)
    }

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (showSuccess) {
        return (
            <AppShell title="সম্পাদনা">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary animate-in zoom-in">
                        <Check className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-primary">
                        তথ্য আপডেট হয়েছে!
                    </p>
                </div>
            </AppShell>
        )
    }

    return (
        <AppShell title={`সম্পাদনা - ${student.nameBn}`}>
            <div className="p-4">
                <Link href={`/students/${id}`} className="mb-4 inline-flex items-center text-sm text-muted-foreground">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    ফিরে যান
                </Link>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Card className="p-4">
                        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
                            শিক্ষার্থীর তথ্য
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="nameBn">নাম (বাংলা) *</Label>
                                <Input
                                    id="nameBn"
                                    placeholder="যেমন: রাকিব হাসান"
                                    value={formData.nameBn}
                                    onChange={(e) => updateField('nameBn', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="nameEn">নাম (ইংরেজি)</Label>
                                <Input
                                    id="nameEn"
                                    placeholder="e.g. Rakib Hasan"
                                    value={formData.nameEn}
                                    onChange={(e) => updateField('nameEn', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
                            অভিভাবকের ফোন
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fatherPhone">বাবার ফোন *</Label>
                                <Input
                                    id="fatherPhone"
                                    type="tel"
                                    placeholder="01XXXXXXXXX"
                                    value={formData.fatherPhone}
                                    onChange={(e) => updateField('fatherPhone', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="motherPhone">মায়ের ফোন</Label>
                                <Input
                                    id="motherPhone"
                                    type="tel"
                                    placeholder="01XXXXXXXXX"
                                    value={formData.motherPhone}
                                    onChange={(e) => updateField('motherPhone', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
                            ব্যাচ ও ফি
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="batch">ব্যাচ নির্বাচন করুন *</Label>
                                <Select
                                    value={formData.batchId}
                                    onValueChange={(value) => updateField('batchId', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="ব্যাচ নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch.id} value={batch.id}>
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="monthlyFee">মাসিক ফি (টাকা) *</Label>
                                <Input
                                    id="monthlyFee"
                                    type="number"
                                    placeholder="4000"
                                    value={formData.monthlyFee}
                                    onChange={(e) => updateField('monthlyFee', parseInt(e.target.value) || 0)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </Card>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base"
                        disabled={!formData.nameBn || !formData.fatherPhone || !formData.batchId || isSubmitting}
                    >
                        <Save className="mr-2 h-5 w-5" />
                        পরিবর্তন সংরক্ষণ করুন
                    </Button>
                </form>
            </div>
        </AppShell>
    )
}
