import { Globe } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { LANGUAGES } from '@/utils/languages'
import type { LanguageCode } from '@/types'

/**
 * Lives in the header on every screen. Someone should never have to find a
 * settings page in a language they cannot read in order to change the language.
 */
export function LanguageSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { language, setLanguage } = useLanguage()

  return (
    <label
      className={
        tone === 'dark'
          ? 'inline-flex items-center gap-1.5 rounded-lg border border-dusk-400/50 bg-dusk-800 px-2.5 py-1.5 text-sm text-mist-200'
          : 'inline-flex items-center gap-1.5 rounded-lg border border-ivory-300 bg-white px-2.5 py-1.5 text-sm text-dusk-700'
      }
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        className="cursor-pointer bg-transparent pr-1 focus:outline-none"
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} className="text-dusk-900">
            {item.native}
          </option>
        ))}
      </select>
    </label>
  )
}
