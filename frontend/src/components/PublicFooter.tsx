import { Link } from 'react-router-dom'
import { BRAND } from '@/config/brand'
import { Wordmark } from '@/components/brand/Wordmark'
import { AnkletRule } from '@/components/brand/AnkletRule'

const HELPLINES = [
  { label: 'Women Helpline', number: '181', href: 'tel:181' },
  { label: 'National Commission for Women', number: '1091', href: 'tel:1091' },
  { label: 'Police Emergency', number: '112', href: 'tel:112' },
]

const EXPLORE = [
  { label: 'Start a private case', to: '/start' },
  { label: 'Understand your legal rights', to: '/legal' },
  { label: 'Find legal counsel', to: '/lawyers' },
  { label: 'Find psychological support', to: '/psychologists' },
  { label: 'Community', to: '/community' },
]

const SUPPORT_LINKS = [
  { label: 'Privacy charter', to: '/privacy' },
  { label: 'Reopen a case', to: '/resume' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Lawyer sign in', to: '/lawyer/login' },
  { label: 'Therapist sign in', to: '/therapist/login' },
]

export function PublicFooter() {
  return (
    <footer className="bg-dusk-950 text-ivory-300/80">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Wordmark tone="light" />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-ivory-300/60">
              {BRAND.tagline} Information on this platform is for statutory awareness
              and does not replace professional legal or psychological advice.
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-ivory-300/40">
              Built with encryption, access controls, and explicit consent management.
              You remain in control of your data at every step.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brass-400">
              Immediate help
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {HELPLINES.map(({ label, number, href }) => (
                <li key={number}>
                  <a
                    href={href}
                    className="inline-flex items-baseline gap-2 text-ivory-200/90 transition-colors hover:text-brass-300"
                  >
                    <span>{label}</span>
                    <span className="font-mono font-semibold text-brass-300">{number}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-ivory-300/50">
              Calling a helpline is always your choice. Nothing on this platform ever
              contacts a service on your behalf.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brass-400">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {EXPLORE.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-ivory-200/90 transition-colors hover:text-brass-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <AnkletRule tone="dark" className="my-10 max-w-sm" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ivory-300/60">
            {SUPPORT_LINKS.map(({ label, to }) => (
              <Link key={to} to={to} className="transition-colors hover:text-ivory-200">
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-ivory-300/50">
            &copy; {new Date().getFullYear()} {BRAND.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
