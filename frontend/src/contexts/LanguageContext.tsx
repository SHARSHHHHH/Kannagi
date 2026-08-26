import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { TRANSLATIONS, type TranslationKey } from '@/i18n/translations'
import type { LanguageCode } from '@/types'

interface LanguageContextValue {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: TranslationKey) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'ui.language'

/**
 * The chosen language drives the whole interface, not just the analysis.
 *
 * Someone who cannot read English should not have to navigate an English
 * interface to reach a Tamil reply. Missing keys fall back to English rather
 * than rendering a raw key, so a gap looks unfinished rather than broken.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY) as LanguageCode | null
    return stored ?? 'en'
  })

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: LanguageCode) => setLanguageState(next), [])

  const t = useCallback(
    (key: TranslationKey) => TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key,
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
