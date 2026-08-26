import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, ShieldCheck, X, Phone } from 'lucide-react'
import { GovStrip } from '@/components/brand/GovStrip'
import { Wordmark } from '@/components/brand/Wordmark'
import { QuickExit } from '@/components/QuickExit'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { TranslationKey } from '@/i18n/translations'
import { cn } from '@/utils/cn'

const NAV: { to: string; key: TranslationKey }[] = [
  { to: '/dashboard', key: 'nav.home' },
  { to: '/cases', key: 'nav.cases' },
  { to: '/chat', key: 'nav.talk' },
  { to: '/legal', key: 'nav.legal' },
  { to: '/community', key: 'nav.community' },
  { to: '/privacy', key: 'nav.privacy' },
]

export function AppLayout() {
  const { signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-ivory-50 text-dusk-900">
      <GovStrip />
      <header className="sticky top-0 z-30 border-b border-ivory-200/80 bg-glass shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-dusk-700 hover:bg-ivory-200 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/dashboard" className="shrink-0 transition-opacity hover:opacity-90">
              <Wordmark />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
            <LanguageSwitcher />
            <QuickExit />
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl p-2 text-dusk-600 transition-colors hover:bg-ivory-200 hover:text-dusk-900"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-ivory-200 bg-ivory-100/95 p-4 shadow-lift lg:hidden animate-rise">
            <div className="flex flex-col gap-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-dusk-800 text-ivory-50 font-semibold'
                        : 'text-dusk-800 hover:bg-ivory-200',
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-ivory-200 bg-ivory-100/60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dusk-700">
                <ShieldCheck className="h-4 w-4 text-jade-600" aria-hidden="true" />
                <span>Your data</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-mist-600">
                <li>AES-256 encryption before storage</li>
                <li>Explicit consent for every action</li>
                <li>Full audit trail you can review</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dusk-700">
                <Phone className="h-4 w-4 text-wine-600" aria-hidden="true" />
                <span>Emergency help</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="tel:181" className="text-mist-600 hover:text-dusk-900">
                    Women Helpline <span className="font-mono font-semibold text-dusk-800">181</span>
                  </a>
                </li>
                <li>
                  <a href="tel:1091" className="text-mist-600 hover:text-dusk-900">
                    National Commission for Women <span className="font-mono font-semibold text-dusk-800">1091</span>
                  </a>
                </li>
                <li>
                  <a href="tel:112" className="text-mist-600 hover:text-dusk-900">
                    Police Emergency <span className="font-mono font-semibold text-dusk-800">112</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-dusk-700">Quick links</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link to="/privacy" className="text-mist-600 hover:text-dusk-900">Privacy &amp; consent</Link>
                </li>
                <li>
                  <Link to="/legal" className="text-mist-600 hover:text-dusk-900">Legal resources</Link>
                </li>
                <li>
                  <Link to="/community" className="text-mist-600 hover:text-dusk-900">Community</Link>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-6 border-t border-ivory-200 pt-4 text-center text-[11px] text-mist-600">
            Information on this platform is for statutory awareness and does not replace professional legal or psychological advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
