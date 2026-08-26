import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gavel, ShieldCheck } from 'lucide-react'
import { registerLawyer } from '@/api/professionalAuth'
import { messageFrom } from '@/api/client'
import { Wordmark } from '@/components/brand/Wordmark'
import { VerificationSequence } from '@/components/verification/VerificationSequence'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import type { VerificationStatus } from '@/types/verification'

const BAR_STATES = [
  { value: 'D', label: 'D — Delhi' },
  { value: 'UP', label: 'UP — Uttar Pradesh' },
  { value: 'MAH', label: 'MAH — Maharashtra & Goa' },
  { value: 'MS', label: 'MS — Tamil Nadu' },
  { value: 'P&H', label: 'P&H — Punjab & Haryana' },
]

export function LawyerRegisterPage() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [barStateCode, setBarStateCode] = useState('D')
  const [barSerial, setBarSerial] = useState('')
  const [barYear, setBarYear] = useState('')
  const [cop, setCop] = useState(true)
  const [practiceAreas, setPracticeAreas] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [verifying, setVerifying] = useState(false)
  const [apiFinished, setApiFinished] = useState(false)
  const [resultStatus, setResultStatus] = useState<VerificationStatus | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const identifier = `${barStateCode}/${barSerial || '—'}/${barYear || '—'}`

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    setVerifying(true)
    setApiFinished(false)
    setResultStatus(null)

    try {
      const result = await registerLawyer({
        email,
        password,
        fullName,
        barStateCode,
        barSerialNumber: barSerial,
        barEnrollmentYear: Number(barYear),
        certificateOfPractice: cop,
        practiceAreas,
        city,
        state,
      })
      setResultStatus(result.verificationStatus)
      setResultMessage(result.message)
      setApiFinished(true)
    } catch (caught) {
      setVerifying(false)
      setError(messageFrom(caught, 'We could not register that account.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSequenceDone() {
    if (resultStatus === 'VERIFIED') {
      await refreshUser().catch(() => {})
      navigate('/lawyer/dashboard', { replace: true })
    }
  }

  if (verifying) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Gavel className="h-5 w-5 text-brass-600" />
          <Wordmark />
        </div>
        <VerificationSequence
          kind="LAWYER"
          identifier={identifier}
          finished={apiFinished}
          status={resultStatus}
          message={resultMessage}
          onDone={handleSequenceDone}
        />
        {apiFinished && resultStatus !== 'VERIFIED' && (
          <Link to="/lawyer/login" className="mt-6 text-center text-sm text-dusk-700 underline">
            Go to sign in — you can log in once a moderator reviews this
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dusk-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dusk-900 via-dusk-950 to-dusk-950">
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-brass-400" />
          <Wordmark tone="light" />
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-16">
        <Card className="border-brass-500/20 bg-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brass-600">
            Advocates &amp; Legal Counsel
          </p>
          <h1 className="font-display text-2xl font-semibold text-dusk-900">
            Register as a lawyer
          </h1>
          <p className="mt-1.5 text-sm text-mist-600">
            Verified against your State Bar Council enrolment, under the Advocates Act, 1961.
          </p>

          {error && (
            <Alert tone="safety" className="mt-5">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Input label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={10}
              hint="At least 10 characters." autoComplete="new-password" />
            <Input label="Full name (as on your enrolment certificate)" value={fullName}
              onChange={(e) => setFullName(e.target.value)} required />

            <div className="rounded-xl border border-ivory-200 bg-ivory-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mist-600">
                Bar enrolment
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Select label="State code" value={barStateCode}
                  onChange={(e) => setBarStateCode(e.target.value)} options={BAR_STATES} />
                <Input label="Serial no." value={barSerial}
                  onChange={(e) => setBarSerial(e.target.value)} placeholder="2345" required />
                <Input label="Year" value={barYear} inputMode="numeric"
                  onChange={(e) => setBarYear(e.target.value)} placeholder="2023" required />
              </div>
              <p className="mt-2 font-mono text-xs text-mist-600">
                Format: {barStateCode}/{barSerial || 'XXXX'}/{barYear || 'YYYY'}
              </p>
              <label className="mt-3 flex items-center gap-2 text-sm text-dusk-800">
                <input type="checkbox" checked={cop} onChange={(e) => setCop(e.target.checked)}
                  className="h-4 w-4 rounded border-ivory-400" />
                I hold a current Certificate of Practice
              </label>
            </div>

            <Input label="Practice areas" value={practiceAreas} optional
              onChange={(e) => setPracticeAreas(e.target.value)}
              placeholder="Workplace harassment, Family law" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={city} optional onChange={(e) => setCity(e.target.value)} />
              <Input label="State" value={state} optional onChange={(e) => setState(e.target.value)} />
            </div>

            <Button type="submit" variant="gold" className="w-full" loading={submitting}>
              <ShieldCheck className="h-4 w-4" />
              Submit for verification
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-mist-600">
            Already verified?{' '}
            <Link to="/lawyer/login" className="font-medium text-dusk-700 underline">
              Sign in
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
