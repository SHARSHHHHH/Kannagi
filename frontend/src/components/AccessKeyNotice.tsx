import { useState } from 'react'
import { Check, Copy, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * Shown once, immediately after an anonymous case is created.
 *
 * This is the only moment the access key exists outside the person's own
 * records, so the component blocks the case behind a confirmation rather than
 * sitting quietly at the top of the page waiting to be scrolled past.
 */
export function AccessKeyNotice({
  reference,
  accessKey,
  onAcknowledge,
}: {
  reference: string
  accessKey: string
  onAcknowledge: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function copyBoth() {
    await navigator.clipboard.writeText(`Reference: ${reference}\nKey: ${accessKey}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dusk-900/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift sm:p-8">
        <KeyRound className="h-6 w-6 text-brass-600" aria-hidden="true" />

        <h2 className="mt-4 font-display text-2xl font-semibold text-dusk-900">
          Save these two things now
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-mist-600">
          Together they are the only way back into this case. We store a scrambled copy of
          the key that cannot be turned back into the key itself, so if you lose it, nobody
          can recover this case for you.
        </p>

        <dl className="mt-6 space-y-3">
            <div className="rounded-xl bg-ivory-100 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-mist-600">
              Reference
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-dusk-900">{reference}</dd>
          </div>
            <div className="rounded-xl bg-ivory-100 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-mist-600">
              Access key
            </dt>
            <dd className="mt-1 break-all font-mono text-sm font-medium text-dusk-900">
              {accessKey}
            </dd>
          </div>
        </dl>

        <Button variant="secondary" className="mt-4 w-full" onClick={copyBoth}>
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" /> Copy both
            </>
          )}
        </Button>

        <p className="mt-5 rounded-xl bg-brass-100 px-4 py-3 text-sm leading-relaxed text-dusk-800">
          If someone else can see your device, write these on paper instead of saving them
          to it.
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-dusk-800">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-mist-400 text-dusk-600"
          />
          <span>I have saved both, and I understand they cannot be recovered.</span>
        </label>

        <Button className="mt-5 w-full" disabled={!confirmed} onClick={onAcknowledge}>
          Continue to my case
        </Button>
      </div>
    </div>
  )
}
