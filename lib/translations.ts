// All UI strings in Bengali and English
// Add new keys here as the app grows

export type TranslationKey = keyof typeof translations.bn

export const translations = {
    bn: {
        // App
        appName: 'SirSheba',
        appTagline: 'আপনার টিউশন, স্মার্টভাবে',
        online: 'অনলাইন',
        offline: 'অফলাইন',

        // Bottom Nav
        home: 'হোম',
        students: 'শিক্ষার্থী',
        cash: 'ক্যাশ',
        sms: 'SMS',
        menu: 'মেনু',

        // Dashboard sections
        todaysCash: 'আজকের আয়',
        pendingFees: 'বকেয়া ফি',
        todaysAttendance: 'উপস্থিতি',
        pendingSms: 'পেন্ডিং SMS',
        thisMonth: 'এই মাসে',
        sentRemaining: 'পাঠানো বাকি',
        quickActions: 'দ্রুত কাজ',
        pendingFeeAlert: 'বকেয়া ফি সতর্কতা',
        recentActivity: 'সাম্প্রতিক কার্যক্রম',
        viewAll: 'সব দেখুন',
        noActivity: 'কোনো কার্যক্রম নেই',

        // Quick actions
        collectFee: 'ফি গ্রহণ',
        attendance: 'উপস্থিতি',
        addStudent: 'নতুন শিক্ষার্থী',
        exams: 'পরীক্ষা',
        sendSms: 'SMS পাঠান',
        reports: 'রিপোর্ট',

        // Students
        activeStudents: 'সক্রিয় শিক্ষার্থী',
        noStudents: 'কোনো শিক্ষার্থী নেই',
        addFirstStudent: 'প্রথম শিক্ষার্থী যোগ করুন',

        // Fees
        paid: 'পরিশোধিত',
        unpaid: 'বকেয়া',
        partial: 'আংশিক',
        amount: 'পরিমাণ',

        // Attendance
        present: 'উপস্থিত',
        absent: 'অনুপস্থিত',
        late: 'দেরিতে',

        // Settings
        settings: 'সেটিংস',
        security: 'নিরাপত্তা',
        contact: 'যোগাযোগ',
        sessions: 'সেশন',
        logout: 'লগআউট',
        language: 'ভাষা',

        // Auth
        login: 'লগইন',
        register: 'নিবন্ধন',
        email: 'ইমেইল',
        phone: 'ফোন',
        password: 'পাসওয়ার্ড',
        pin: 'PIN',
        verify: 'যাচাই করুন',
        continue: 'পরবর্তী',

        // Common
        save: 'সংরক্ষণ',
        cancel: 'বাতিল',
        delete: 'মুছুন',
        edit: 'সম্পাদনা',
        loading: 'লোড হচ্ছে...',
        error: 'ত্রুটি',
        success: 'সফল',
        from: 'থেকে',
        persons: 'জন',
    },
    en: {
        // App
        appName: 'SirSheba',
        appTagline: 'Your Tuition, Smartly',
        online: 'Online',
        offline: 'Offline',

        // Bottom Nav
        home: 'Home',
        students: 'Students',
        cash: 'Cash',
        sms: 'SMS',
        menu: 'Menu',

        // Dashboard sections
        todaysCash: "Today's Cash",
        pendingFees: 'Pending Fees',
        todaysAttendance: 'Attendance',
        pendingSms: 'Pending SMS',
        thisMonth: 'This month',
        sentRemaining: 'Not sent yet',
        quickActions: 'Quick Actions',
        pendingFeeAlert: 'Pending Fee Alert',
        recentActivity: 'Recent Activity',
        viewAll: 'View All',
        noActivity: 'No recent activity',

        // Quick actions
        collectFee: 'Collect Fee',
        attendance: 'Attendance',
        addStudent: 'Add Student',
        exams: 'Exams',
        sendSms: 'Send SMS',
        reports: 'Reports',

        // Students
        activeStudents: 'Active Students',
        noStudents: 'No students yet',
        addFirstStudent: 'Add your first student',

        // Fees
        paid: 'Paid',
        unpaid: 'Unpaid',
        partial: 'Partial',
        amount: 'Amount',

        // Attendance
        present: 'Present',
        absent: 'Absent',
        late: 'Late',

        // Settings
        settings: 'Settings',
        security: 'Security',
        contact: 'Contact',
        sessions: 'Sessions',
        logout: 'Logout',
        language: 'Language',

        // Auth
        login: 'Login',
        register: 'Register',
        email: 'Email',
        phone: 'Phone',
        password: 'Password',
        pin: 'PIN',
        verify: 'Verify',
        continue: 'Continue',

        // Common
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        from: 'from',
        persons: 'students',
    },
} as const
