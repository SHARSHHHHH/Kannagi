import { useEffect, useState } from 'react'
import { Check, Download, Loader2, X } from 'lucide-react'
import { privacyOverview, revokeConsent } from '@/api/support'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { PrivacyOverview } from '@/types'

const CONSENT_LABEL: Record<string, string> = {
  DATA_PROCESSING: 'Storing and processing what you write',
  LEGAL_SHARING: 'Sharing your case with a legal professional',
  PSYCHOLOGICAL_SHARING: 'Sharing a summary with a psychologist',
  CONTACT_SHARING: 'Sharing your name and contact details',
  COMMUNITY_POSTING: 'Posting in the community',
  AUDIO_STORAGE: 'Keeping recordings after transcription',
}

export function PrivacyPage() {
  const [overview, setOverview] = useState<PrivacyOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    privacyOverview()
      .then(setOverview)
      .catch((caught) => setError(messageFrom(caught, 'We could not load your privacy settings.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function revoke(id: string) {
    try {
      await revokeConsent(id)
      load()
    } catch (caught) {
      setError(messageFrom(caught, 'We could not withdraw that.'))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-mist-500" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <h1 className="font-display text-display-md font-semibold text-dusk-900">Privacy centre</h1>
      <p className="mt-3 leading-relaxed text-mist-600">
        Everything held about you, and everything currently shared. Nothing on this page is
        a description of intent — it is read from the same records the system checks before
        it shares anything.
      </p>

      <AnkletRule className="my-8" />

      {error && <Alert tone="safety" className="mb-6">{error}</Alert>}

      {overview && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-dusk-800">
              What is currently shared
            </h2>
            <ul className="mt-4 divide-y divide-ivory-200">
              {overview.currentlySharing.map((line) => (
                <li
                  key={`${line.withWhom}-${line.item}`}
                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                >
                  <span className="text-mist-600">
                    <span className="font-medium text-dusk-800">{line.withWhom}</span> ·{' '}
                    {line.item}
                  </span>
                  {line.shared ? (
                    <span className="inline-flex items-center gap-1 font-medium text-jade-600">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" /> Shared
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-mist-600">
                      <X className="h-3.5 w-3.5" aria-hidden="true" /> Not shared
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-ivory-100 px-4 py-3 text-xs leading-relaxed text-mist-600">
              {overview.note}
            </p>
          </section>

          <section className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-dusk-800">
              Permissions you have given
            </h2>
            {overview.consents.length === 0 ? (
              <p className="mt-3 text-sm text-mist-600">
                You have not given any yet. Nothing is being shared with anyone.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {overview.consents.map((consent) => (
                  <li
                    key={consent.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ivory-100 px-4 py-3"
                  >
                    <div className="text-sm">
                      <p className="font-medium text-dusk-800">
                        {CONSENT_LABEL[consent.consentType] ?? consent.consentType}
                      </p>
                      <p className="text-mist-600">
                        {consent.revokedAt
                          ? `Withdrawn ${new Date(consent.revokedAt).toLocaleDateString()}`
                          : consent.grantedAt
                            ? `Given ${new Date(consent.grantedAt).toLocaleDateString()}`
                            : ''}
                      </p>
                    </div>
                    {!consent.revokedAt && (
                      <Button size="sm" variant="secondary" onClick={() => void revoke(consent.id)}>
                        Withdraw
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-dusk-800">Your information</h2>
            <p className="mt-2 text-sm text-mist-600">
              {overview.caseCount} {overview.caseCount === 1 ? 'case' : 'cases'} ·{' '}
              {overview.appointmentCount}{' '}
              {overview.appointmentCount === 1 ? 'appointment' : 'appointments'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/privacy/export`}
                className="inline-flex"
              >
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download my data
                </Button>
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
