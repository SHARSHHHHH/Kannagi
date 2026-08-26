import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, MailCheck } from 'lucide-react'
import { sendVerificationCode, verifyCode } from '@/api/auth'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import type { Gender, MaritalStatus, OccupationStatus } from '@/types'

const GENDERS = [
  { value: 'WOMAN', label: 'Woman' },
  { value: 'TRANS_WOMAN', label: 'Trans woman' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

const MARITAL = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'SEPARATED', label: 'Separated' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

const OCCUPATIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-employed' },
  { value: 'HOMEMAKER', label: 'Homemaker' },
  { value: 'UNEMPLOYED', label: 'Not working right now' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

type Step = 'email' | 'code' | 'details'

/**
 * Three steps: prove the address, then set a password, then anything optional.
 *
 * The address is verified before an account exists, so a mistyped email cannot
 * lock someone out of the only account they may be able to reach safely.
 */
export function RegisterPage() {
  const { signUp } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [sendNotice, setSendNotice] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [occupation, setOccupation] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const [showOptional, setShowOptional] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function requestCode(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const result = await sendVerificationCode(email)
      setSendNotice(result.message)
      setDevCode(result.devCode)
      setStep('code')
    } catch (caught) {
      setError(messageFrom(caught, 'We could not send a code to that address.'))
    } finally {
      setBusy(false)
    }
  }

  async function checkCode(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await verifyCode(email, code)
      setStep('details')
    } catch (caught) {
      setError(messageFrom(caught, 'That code is not correct.'))
    } finally {
      setBusy(false)
    }
  }

  async function finish(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signUp({
        email,
        password,
        displayName: displayName || undefined,
        gender: (gender || undefined) as Gender | undefined,
        maritalStatus: (maritalStatus || undefined) as MaritalStatus | undefined,
        occupationStatus: (occupation || undefined) as OccupationStatus | undefined,
        city: city || undefined,
        state: state || undefined,
        preferredLanguage: language,
      })
      navigate('/dashboard', { replace: true })
    } catch (caught) {
      setError(messageFrom(caught, 'We could not create your account.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-semibold text-dusk-900">Create an account</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-mist-600">
        {step === 'email' && 'First, we confirm your email address is one you can reach.'}
        {step === 'code' && 'Enter the six-digit code we generated.'}
        {step === 'details' && 'Now choose a password. Everything after that is optional.'}
      </p>

      <AnkletRule className="my-6" />

      {error && (
        <Alert tone="safety" className="mb-5">
          {error}
        </Alert>
      )}

      {step === 'email' && (
        <form onSubmit={requestCode} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            hint="We check that this address can actually receive mail before going further."
            required
          />
          <Button type="submit" loading={busy} className="w-full">
            Send me a code
          </Button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={checkCode} className="space-y-4" noValidate>
          {sendNotice && <Alert tone="info">{sendNotice}</Alert>}

          {/* Shown only when no mail server is configured, and labelled as such
              rather than dressed up as a real delivery. */}
          {devCode && (
            <div className="rounded-xl bg-brass-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-dusk-700">
                Development mode — code shown because no mail server is configured
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-dusk-900">{devCode}</p>
            </div>
          )}

          <Input
            label="Six-digit code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />

          <Button type="submit" loading={busy} className="w-full">
            <MailCheck className="h-4 w-4" aria-hidden="true" />
            Confirm my address
          </Button>

          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-center text-sm text-mist-600 hover:text-dusk-700"
          >
            Use a different address
          </button>
        </form>
      )}

      {step === 'details' && (
        <form onSubmit={finish} className="space-y-4" noValidate>
          <Alert tone="success">{email} is confirmed.</Alert>

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            hint="At least 10 characters. A short phrase you will remember works well."
            minLength={10}
            required
          />

          <Select
            label="Marital status"
            value={maritalStatus}
            onChange={(event) => setMaritalStatus(event.target.value)}
            options={MARITAL}
            placeholder="Prefer not to say"
            optional
            hint="Some protections differ depending on this, so it helps us show relevant ones."
          />

          <button
            type="button"
            onClick={() => setShowOptional((open) => !open)}
            className="flex w-full items-center justify-between rounded-xl bg-ivory-100 px-4 py-3 text-left text-sm text-dusk-700 transition-colors hover:bg-ivory-200"
            aria-expanded={showOptional}
          >
            <span>
              <span className="font-medium">Tell us more</span>
              <span className="ml-2 text-mist-600">Optional — helps us suggest nearby support</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${showOptional ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {showOptional && (
            <div className="animate-rise space-y-4">
              <Input
                label="Name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                optional
                hint="Any name you would like to be called. It does not have to be your real one."
              />
              <Select
                label="Gender"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                options={GENDERS}
                placeholder="Prefer not to say"
                optional
              />
              <Select
                label="Current situation"
                value={occupation}
                onChange={(event) => setOccupation(event.target.value)}
                options={OCCUPATIONS}
                placeholder="Prefer not to say"
                optional
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  optional
                />
                <Input
                  label="State"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  optional
                />
              </div>
              <p className="text-xs leading-relaxed text-mist-600">
                We ask for city and state only, never a full address, and we do not ask for
                Aadhaar or any other identity document.
              </p>
            </div>
          )}

          <Button type="submit" loading={busy} className="w-full">
            Create account
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-mist-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-dusk-600 hover:text-dusk-800">
          Sign in
        </Link>
      </p>

      <p className="mt-4 rounded-xl bg-ivory-100 px-4 py-3 text-center text-xs leading-relaxed text-mist-600">
        You do not need an account to talk.{' '}
        <Link to="/start" className="font-medium text-dusk-600 hover:text-dusk-800">
          Continue anonymously instead
        </Link>
        .
      </p>
    </Card>
  )
}
