import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Lang = 'bn' | 'en'

interface LanguageStore {
    lang: Lang
    setLang: (lang: Lang) => void
    toggle: () => void
}

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set, get) => ({
            lang: 'bn',
            setLang: (lang) => set({ lang }),
            toggle: () => set({ lang: get().lang === 'bn' ? 'en' : 'bn' }),
        }),
        { name: 'sirsheba-lang' }
    )
)
