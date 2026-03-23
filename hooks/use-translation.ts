'use client'

import { useLanguageStore } from '@/store/language-store'
import { translations, TranslationKey } from '@/lib/translations'

export function useTranslation() {
    const lang = useLanguageStore((s) => s.lang)

    const t = (key: TranslationKey): string => {
        return translations[lang][key] ?? translations.bn[key] ?? key
    }

    return { t, lang }
}
