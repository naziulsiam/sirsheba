'use client'

import { useLanguageStore } from '@/store/language-store'

export function LanguageToggle() {
    const { lang, toggle } = useLanguageStore()

    return (
        <button
            onClick={toggle}
            aria-label="Toggle language"
            className="flex items-center gap-0.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white transition-all hover:bg-white/30 active:scale-95 border border-white/20 shadow-sm"
        >
            <span className={lang === 'bn' ? 'opacity-100' : 'opacity-50'}>বাং</span>
            <span className="opacity-40 mx-0.5">|</span>
            <span className={lang === 'en' ? 'opacity-100' : 'opacity-50'}>EN</span>
        </button>
    )
}
