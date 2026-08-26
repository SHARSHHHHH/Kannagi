import { Link, Outlet } from 'react-router-dom'
import { GovStrip } from '@/components/brand/GovStrip'
import { Wordmark } from '@/components/brand/Wordmark'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { QuickExit } from '@/components/QuickExit'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory-50">
      <GovStrip />
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <QuickExit />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-rise">
          <Outlet />
        </div>
      </main>

      <footer className="px-4 pb-8 sm:px-8">
        <div className="mx-auto max-w-md space-y-3">
          <AnkletRule />
          <p className="text-center text-xs leading-relaxed text-mist-600">
            Your account is protected with encrypted storage and consent-based sharing.
            Nothing is shared with a professional unless you choose to share it.
          </p>
          <p className="text-center text-[11px] font-medium tracking-wide text-dusk-700">
            Government of India · Ministry of Women &amp; Child Development
          </p>
        </div>
      </footer>
    </div>
  )
}
