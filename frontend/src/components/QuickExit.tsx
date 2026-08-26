import { useEffect, useRef } from 'react'
import { ShieldAlert } from 'lucide-react'
import { clearTokens } from '@/api/client'

const DECOY_URL = 'https://www.google.com/search?q=weather+today'

/**
 * Leaves the site immediately.
 *
 * Someone may be reading this while the person harming them is in the room.
 * Clicking, or pressing Escape three times, wipes the session, replaces the
 * current history entry so Back does not return here, and opens a neutral page.
 */
export function QuickExit({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const escapePresses = useRef(0)
  const resetTimer = useRef<number>()

  function leaveNow() {
    clearTokens()
    window.location.replace(DECOY_URL)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return

      escapePresses.current += 1
      window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => {
        escapePresses.current = 0
      }, 1200)

      if (escapePresses.current >= 3) leaveNow()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(resetTimer.current)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={leaveNow}
      title="Leaves this site straight away. You can also press Escape 3 times."
      aria-label="Quick exit. Redirects immediately to Google Weather."
      className={
        tone === 'dark'
          ? 'inline-flex items-center gap-1.5 rounded-xl border border-wine-500/40 bg-wine-950/60 px-3.5 py-1.5 text-xs font-semibold text-wine-200 shadow-sm transition hover:bg-wine-800 hover:text-white active:scale-[0.98]'
          : 'inline-flex items-center gap-1.5 rounded-xl border border-wine-200 bg-wine-50/70 px-3.5 py-1.5 text-xs font-semibold text-wine-800 shadow-sm transition hover:border-wine-300 hover:bg-wine-100 hover:text-wine-900 active:scale-[0.98]'
      }
    >
      <ShieldAlert className="h-3.5 w-3.5 text-wine-600 dark:text-wine-400" aria-hidden="true" />
      <span>Quick exit</span>
      <kbd className="hidden sm:inline-block rounded bg-black/10 px-1 py-0.5 text-[10px] font-mono opacity-70">
        Esc x3
      </kbd>
    </button>
  )
}
