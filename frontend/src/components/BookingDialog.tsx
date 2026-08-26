import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { bookAppointment } from '@/api/support'
import { messageFrom } from '@/api/client'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { Appointment, Professional } from '@/types'

/**
 * Requesting a session.
 *
 * Anonymous is the default, and the box listing exactly what the professional
 * will see updates as she changes it. Consent is a separate, unticked
 * checkbox — sending a request is never treated as having agreed to share.
 */
export function BookingDialog({
  professional,
  caseId,
  onClose,
}: {
  professional: Professional
  caseId?: string
  onClose: () => void
}) {
  const [anonymous, setAnonymous] = useState(true)
  const [consent, setConsent] = useState(false)
  const [when, setWhen] = useState('')
  const [note, setNote] = useState('')
  const [booked, setBooked] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit() {
    setError(null)
    setSaving(true)
    try {
      setBooked(
        await bookAppointment({
          professionalId: professional.id,
          caseId,
          scheduledAt: new Date(when).toISOString(),
          anonymous,
          note: note || undefined,
          consentToShare: consent,
        }),
      )
    } catch (caught) {
      setError(messageFrom(caught, 'We could not send that request. Try another time.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-dusk-900/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-dusk-900">
            {booked ? 'Request sent' : `Request a session with ${professional.fullName}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-mist-600 hover:bg-ivory-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {booked ? (
          <div className="mt-5 space-y-4">
            <div className="flex gap-3 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3 text-sm text-jade-800">
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Your reference is {booked.reference}</p>
                <p className="mt-1">Save this — it is how you check on the request later.</p>
              </div>
            </div>

            <div className="rounded-xl bg-ivory-100 px-4 py-3 text-sm leading-relaxed text-dusk-800">
              <p className="font-medium">What they will see</p>
              <p className="mt-1 text-mist-600">{booked.whatTheyWillSee}</p>
            </div>

            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {error && <Alert tone="safety">{error}</Alert>}

            <div>
              <label htmlFor="when" className="text-sm font-medium text-dusk-800">
                Preferred date and time
              </label>
              <input
                id="when"
                type="datetime-local"
                value={when}
                onChange={(event) => setWhen(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ivory-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label htmlFor="note" className="text-sm font-medium text-dusk-800">
                Anything you want them to know beforehand
                <span className="ml-2 text-xs font-normal text-mist-600">Optional</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="mt-1.5 w-full resize-y rounded-xl border border-ivory-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-ivory-100 px-4 py-3 text-sm text-dusk-800">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-mist-400"
              />
              <span>
                <span className="font-medium">Keep me anonymous</span>
                <span className="mt-1 block text-mist-600">
                  {anonymous
                    ? 'They will see a case reference and your note. Not your name, email or phone number.'
                    : 'They will see your name along with your note.'}
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-dusk-800">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-mist-400"
              />
              <span>
                I agree to send this to {professional.fullName}. I can withdraw this later
                from the privacy centre.
              </span>
            </label>

            <Button
              className="w-full"
              loading={saving}
              disabled={!when || !consent}
              onClick={submit}
            >
              Send request
            </Button>

            {professional.demo && (
              <p className="text-center text-xs text-mist-600">
                This is a demo profile. The request is recorded but reaches nobody.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
