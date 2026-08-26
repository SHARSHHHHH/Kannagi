import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, ArrowRight, Lock } from 'lucide-react'
import { createCase } from '@/api/cases'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import type { PrivacyMode } from '@/types'

const MODES: {
  mode: PrivacyMode
  icon: typeof EyeOff
  title: string
  promise: string
  detail: string
  cost: string | null
  needsAccount: boolean
}[] = [
  {
    mode: 'ANONYMOUS',
    icon: EyeOff,
    title: 'Anonymously',
    promise: 'Zero linked personal data',
    detail:
      'No account, name, or phone number required. We do not store identity markers, so this case can never be connected to you.',
    cost: 'You will receive a unique reference and access key. If lost, nobody—including database administrators—can recover this record.',
    needsAccount: false,
  },
  {
    mode: 'CONFIDENTIAL',
    icon: ShieldCheck,
    title: 'Confidentially',
    promise: 'Saved to your account',
    detail:
      'Your case is stored securely in your private account. External lawyers or psychologists see your name only if you explicitly choose to share it.',
    cost: null,
    needsAccount: true,
  },
  {
    mode: 'IDENTIFIED',
    icon: Eye,
    title: 'With my identity',
    promise: 'Visible to assigned counsel',
    detail:
      'Ideal when you already plan to file a formal report or consult a designated legal advisor. You can switch back to confidential anytime.',
    cost: null,
    needsAccount: true,
  },
]

export function StartPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selected, setSelected] = useState<PrivacyMode>('ANONYMOUS')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleContinue() {
    setError(null)
    setSubmitting(true)
    try {
      const created = await createCase({ privacyMode: selected })
      navigate(`/cases/${created.caseDetail.id}`, {
        state: { accessKey: created.accessKey, notice: created.accessKeyNotice },
      })
    } catch (caught) {
      setError(messageFrom(caught, 'We could not start your case. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-rise px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-ivory-200 bg-white p-6 sm:p-8 shadow-card">
        <p className="text-eyebrow font-semibold uppercase tracking-wider text-brass-600">
          Privacy Setup
        </p>
        <h1 className="mt-2 font-display text-display-md font-semibold text-balance text-dusk-900">
          How would you like to continue?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-600">
          Select the level of confidentiality you prefer. An anonymous case remains permanently unlinked from any account for your protection.
        </p>

        <AnkletRule className="my-6" />

        {error && (
          <Alert tone="safety" className="mb-5">
            {error}
          </Alert>
        )}

        <div className="space-y-4" role="radiogroup" aria-label="Privacy mode">
          {MODES.map(({ mode, icon: Icon, title, promise, detail, cost, needsAccount }) => {
            const locked = needsAccount && !user
            const active = selected === mode

            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={locked}
                onClick={() => setSelected(mode)}
                className={cn(
                  'w-full rounded-2xl border p-5 text-left transition-all duration-200 select-none',
                  active
                    ? 'border-dusk-800 bg-ivory-50/60 shadow-lift ring-2 ring-dusk-800/20'
                    : 'border-ivory-200 bg-white shadow-card hover:border-ivory-300',
                  locked && 'cursor-not-allowed opacity-55 hover:border-ivory-200 bg-ivory-100/50',
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'mt-0.5 rounded-xl p-2.5 transition-colors',
                      active ? 'bg-dusk-800 text-brass-300' : 'bg-ivory-100 text-dusk-700',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-display text-lg font-semibold text-dusk-900">{title}</h2>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-jade-700 bg-jade-50 px-2.5 py-1 rounded-md border border-jade-200">
                        {promise}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-mist-600">{detail}</p>

                    {cost && (
                      <p className="mt-3 rounded-xl border border-brass-300/60 bg-brass-50/70 p-3 text-xs leading-relaxed text-dusk-900">
                        <strong className="font-semibold text-brass-700">Important trade-off:</strong> {cost}
                      </p>
                    )}

                    {locked && (
                      <p className="mt-3 text-xs font-medium text-mist-600">
                        Requires an account. Sign in first or proceed anonymously.
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <Button
          size="lg"
          className="mt-8 w-full font-semibold shadow-lift"
          loading={submitting}
          onClick={handleContinue}
        >
          <span>Open Private Space</span>
          <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>

        <p className="mt-4 text-center text-xs text-mist-600 flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-jade-600" aria-hidden="true" />
          <span>Nothing is transmitted to third parties. This creates a secure workspace for you.</span>
        </p>
      </div>
    </div>
  )
}
