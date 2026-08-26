import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { CredentialKind, VerificationStatus } from '@/types/verification'

interface Step {
  label: string
  detail: string
}

const STEPS_BY_KIND: Record<CredentialKind, Step[]> = {
  LAWYER: [
    { label: 'Checking enrolment number format', detail: 'State code, serial number and year of enrolment' },
    { label: 'Querying Bar Council of India records', detail: 'Advocate Search — barcouncilofindia.org' },
    { label: 'Confirming Certificate of Practice', detail: 'Required to appear before a court under the Advocates Act, 1961' },
    { label: 'Cross-checking law school recognition', detail: 'Degree must be from a BCI-recognised institution' },
  ],
  CLINICAL_PSYCHOLOGIST: [
    { label: 'Checking CRR number format', detail: 'Central Rehabilitation Register identifier' },
    { label: 'Querying Rehabilitation Council of India', detail: 'rciregistration.nic.in' },
    { label: 'Matching registered name', detail: 'Name must match the RCI register exactly' },
    { label: 'Confirming registration is active', detail: 'Checking for a current, unlapsed registration' },
  ],
  PSYCHIATRIST: [
    { label: 'Checking registration number format', detail: 'National Medical Commission / State Medical Council' },
    { label: 'Querying the NMC Doctor Register', detail: 'National Medical Commission — nmc.org.in' },
    { label: 'Confirming MBBS and MD/DNB Psychiatry', detail: 'Medical qualification on record' },
    { label: 'Confirming registration is active', detail: 'Checking for a current, unlapsed registration' },
  ],
}

/**
 * Walks through the checks a real verification would perform, one at a time,
 * then reveals whatever the backend actually decided.
 *
 * The steps animate on a fixed rhythm regardless of how fast the API
 * responds — a real government lookup does not resolve in 40 milliseconds,
 * and an instant "VERIFIED" would look fake even when it is correct. The
 * outcome shown at the end is never invented here; it always reflects the
 * real verificationStatus that came back from the mock registry.
 */
export function VerificationSequence({
  kind,
  identifier,
  finished,
  status,
  message,
  onDone,
}: {
  kind: CredentialKind
  identifier: string
  /** True once the real API call has returned. */
  finished: boolean
  status: VerificationStatus | null
  message: string | null
  onDone?: () => void
}) {
  const steps = STEPS_BY_KIND[kind]
  const [activeStep, setActiveStep] = useState(0)
  const [revealResult, setRevealResult] = useState(false)

  useEffect(() => {
    if (activeStep >= steps.length) return
    const timer = window.setTimeout(() => setActiveStep((s) => s + 1), 750)
    return () => window.clearTimeout(timer)
  }, [activeStep, steps.length])

  useEffect(() => {
    if (activeStep >= steps.length && finished && !revealResult) {
      const timer = window.setTimeout(() => setRevealResult(true), 400)
      return () => window.clearTimeout(timer)
    }
  }, [activeStep, steps.length, finished, revealResult])

  useEffect(() => {
    if (revealResult) onDone?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealResult])

  const allStepsShown = activeStep >= steps.length

  return (
    <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-mist-600">
        Verifying credential
      </p>
      <p className="mb-5 font-mono text-sm text-dusk-900">{identifier}</p>

      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isDone = index < activeStep
          const isActive = index === activeStep && !allStepsShown
          const isPending = index > activeStep

          return (
            <li key={step.label} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">
                {isDone && <CheckCircle2 className="h-5 w-5 text-jade-600" />}
                {isActive && <Loader2 className="h-5 w-5 animate-spin text-dusk-600" />}
                {isPending && <span className="block h-5 w-5 rounded-full border-2 border-ivory-300" />}
              </span>
              <div className={cn('min-w-0', isPending && 'opacity-40')}>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isDone ? 'text-dusk-900' : isActive ? 'text-dusk-800' : 'text-mist-600',
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-mist-600">{step.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>

      {!allStepsShown && (
        <p className="mt-5 text-xs text-mist-500">
          This is a prototype check against a demo registry, not a live call to the Bar
          Council of India, RCI or NMC.
        </p>
      )}

      {allStepsShown && !revealResult && (
        <div className="mt-6 flex items-center gap-2 text-sm text-mist-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Finalising result…
        </div>
      )}

      {revealResult && status === 'VERIFIED' && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-jade-200 bg-jade-50 px-4 py-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-jade-700" />
          <div>
            <p className="text-sm font-semibold text-jade-800">Credential verified</p>
            <p className="mt-0.5 text-sm text-jade-700">{message}</p>
          </div>
        </div>
      )}

      {revealResult && status === 'NEEDS_REVIEW' && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brass-300 bg-brass-50 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brass-700" />
          <div>
            <p className="text-sm font-semibold text-dusk-900">Sent for manual review</p>
            <p className="mt-0.5 text-sm text-dusk-800">{message}</p>
          </div>
        </div>
      )}

      {revealResult && status === 'REJECTED' && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-wine-300 bg-wine-50 px-4 py-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-wine-700" />
          <div>
            <p className="text-sm font-semibold text-wine-900">Verification declined</p>
            <p className="mt-0.5 text-sm text-wine-800">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
