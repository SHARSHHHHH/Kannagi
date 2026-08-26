import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { GovStrip } from '@/components/brand/GovStrip'
import { Wordmark } from '@/components/brand/Wordmark'
import { QuickExit } from '@/components/QuickExit'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { PublicFooter } from '@/components/PublicFooter'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import type { TranslationKey } from '@/i18n/translations'
import { cn } from '@/utils/cn'

const PUBLIC_NAV: { to: string; key: TranslationKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/start', key: 'nav.getSupport' },
  { to: '/legal', key: 'nav.legal' },
  { to: '/community', key: 'nav.community' },
]

/**
 * Chrome for public/unauthenticated pages. Warm ivory aesthetic with high trust.
 */
export function PublicShell() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-dusk-900">
      <GovStrip />
      <header className="sticky top-0 z-30 border-b border-ivory-200/80 bg-glass shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-dusk-700 hover:bg-ivory-200 lg:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to={user ? '/dashboard' : '/'} className="transition-opacity hover:opacity-90">
              <Wordmark />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {PUBLIC_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                    isActive
                      ? 'bg-dusk-800 text-ivory-50 shadow-sm'
                      : 'text-dusk-700 hover:bg-ivory-200/70 hover:text-dusk-900',
                  )
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!user && (
              <Link
                to="/login"
                className="hidden text-xs font-semibold uppercase tracking-wider text-dusk-700 hover:text-brass-600 sm:block"
              >
                {t('nav.signIn')}
              </Link>
            )}
            <LanguageSwitcher />
            <QuickExit />
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-ivory-200 bg-ivory-100/95 p-4 shadow-lift lg:hidden animate-rise" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              {PUBLIC_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-dusk-800 text-ivory-50 font-semibold'
                        : 'text-dusk-800 hover:bg-ivory-200',
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-dusk-800 hover:bg-ivory-200"
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  )
}
