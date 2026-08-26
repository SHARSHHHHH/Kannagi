import { Phone } from 'lucide-react'

const HELPLINES = [
  { label: 'Women Helpline', number: '181', href: 'tel:181' },
  { label: 'National Commission for Women', number: '1091', href: 'tel:1091' },
  { label: 'Police Emergency', number: '112', href: 'tel:112' },
]

/**
 * Non-alarming banner for users who need immediate help.
 * Visually distinct with wine accents but deliberately calm in tone.
 */
export function UrgentHelpBanner() {
  return (
    <section className="border-b border-wine-200/60 bg-wine-50/40">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-xl bg-wine-100 p-2.5 text-wine-700">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-dusk-900">
                Need immediate help?
              </p>
              <p className="text-xs text-mist-600">
                Access emergency contacts and urgent support.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {HELPLINES.map(({ label, number, href }) => (
              <a
                key={number}
                href={href}
                className="inline-flex items-center gap-2 rounded-xl border border-wine-200 bg-white px-3.5 py-2 text-xs font-medium text-dusk-800 transition-colors hover:border-wine-300 hover:bg-wine-50"
              >
                <span>{label}</span>
                <span className="font-mono font-semibold text-wine-700">{number}</span>
              </a>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-mist-600">
          Calling a helpline is always your choice. Nothing on this platform ever contacts a service on your behalf.
        </p>
      </div>
    </section>
  )
}
