import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartHandshake, ShieldCheck, Stethoscope, Brain } from 'lucide-react'
import { registerTherapist } from '@/api/professionalAuth'
import { messageFrom } from '@/api/client'
import { Wordmark } from '@/components/brand/Wordmark'
import { VerificationSequence } from '@/components/verification/VerificationSequence'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import type { CredentialKind, VerificationStatus } from '@/types/verification'

export function TherapistRegisterPage() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  const [credentialKind, setCredentialKind] = useState<CredentialKind>('CLINICAL_PSYCHOLOGIST')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registeredFullName, setRegisteredFullName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [specialisations, setSpecialisations] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [verifying, setVerifying] = useState(false)
  const [apiFinished, setApiFinished] = useState(false)
  const [resultStatus, setResultStatus] = useState<VerificationStatus | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const body = credentialKind === 'PSYCHIATRIST' ? 'NMC' : 'RCI'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    setVerifying(true)
    setApiFinished(false)
    setResultStatus(null)

    try {
      const result = await registerTherapist({
        email, password,
        credentialKind: credentialKind as 'CLINICAL_PSYCHOLOGIST' | 'PSYCHIATRIST',
        registeredFullName, licenseNumber, specialisations, city, state,
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
      navigate('/therapist/dashboard', { replace: true })
    }
  }

  if (verifying) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center bg-jade-50/40 px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-jade-600" />
          <Wordmark />
        </div>
        <VerificationSequence
          kind={credentialKind}
          identifier={`${body}-${licenseNumber || '—'}`}
          finished={apiFinished}
          status={resultStatus}
          message={resultMessage}
          onDone={handleSequenceDone}
        />
        {apiFinished && resultStatus !== 'VERIFIED' && (
          <Link to="/therapist/login" className="mt-6 text-center text-sm text-jade-700 underline">
            Go to sign in — you can log in once a moderator reviews this
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-jade-50 to-ivory-50">
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-jade-600" />
          <Wordmark />
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-16">
        <Card className="border-jade-200">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-jade-700">
            Mental Health Professionals
          </p>
          <h1 className="font-display text-2xl font-semibold text-dusk-900">
            Register as a therapist
          </h1>
          <p className="mt-1.5 text-sm text-mist-600">
            Verified against your professional registration — RCI for clinical psychologists,
            NMC for psychiatrists.
          </p>

          {error && (
            <Alert tone="safety" className="mt-5">
              {error}
            </Alert>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setCredentialKind('CLINICAL_PSYCHOLOGIST')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors',
                credentialKind === 'CLINICAL_PSYCHOLOGIST'
                  ? 'border-jade-500 bg-jade-50 text-jade-800'
                  : 'border-ivory-300 text-mist-600 hover:border-jade-300',
              )}>
              <Brain className="h-5 w-5" />
              <span className="font-medium">Clinical Psychologist</span>
              <span className="text-xs">Verified via RCI</span>
            </button>
            <button type="button" onClick={() => setCredentialKind('PSYCHIATRIST')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors',
                credentialKind === 'PSYCHIATRIST'
                  ? 'border-jade-500 bg-jade-50 text-jade-800'
                  : 'border-ivory-300 text-mist-600 hover:border-jade-300',
              )}>
              <Stethoscope className="h-5 w-5" />
              <span className="font-medium">Psychiatrist</span>
              <span className="text-xs">Verified via NMC</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Input label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={10}
              hint="At least 10 characters." autoComplete="new-password" />
            <Input label="Full name (exactly as on your registration)" value={registeredFullName}
              onChange={(e) => setRegisteredFullName(e.target.value)} required />

            <div className="rounded-xl border border-ivory-200 bg-ivory-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mist-600">
                {body} registration
              </p>
              <Input
                label={body === 'RCI' ? 'CRR number' : 'NMC / State Medical Council number'}
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder={body === 'RCI' ? 'CRR-2019-00457' : 'NMC-MH-88213'}
                required
              />
            </div>

            <Input label="Specialisations" value={specialisations} optional
              onChange={(e) => setSpecialisations(e.target.value)}
              placeholder="Trauma, Anxiety, Domestic abuse recovery" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={city} optional onChange={(e) => setCity(e.target.value)} />
              <Input label="State" value={state} optional onChange={(e) => setState(e.target.value)} />
            </div>

            <Button type="submit" className="w-full bg-jade-600 text-white hover:bg-jade-700"
              loading={submitting}>
              <ShieldCheck className="h-4 w-4" />
              Submit for verification
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-mist-600">
            Already verified?{' '}
            <Link to="/therapist/login" className="font-medium text-jade-700 underline">
              Sign in
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
