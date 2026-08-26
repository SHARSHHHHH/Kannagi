import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gavel, HeartHandshake, LogIn } from 'lucide-react'
import { professionalLogin } from '@/api/professionalAuth'
import { messageFrom } from '@/api/client'
import { Wordmark } from '@/components/brand/Wordmark'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

export function ProfessionalLoginPage() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await professionalLogin(email, password)
      await refreshUser()
      const role = result.user?.role
      navigate(role === 'LAWYER' ? '/lawyer/dashboard' : '/therapist/dashboard', { replace: true })
    } catch (caught) {
      setError(messageFrom(caught, 'We could not sign you in.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dusk-950 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Wordmark tone="light" />
      </div>

      <Card className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-center gap-4 text-mist-500">
          <Gavel className="h-4 w-4" />
          <span className="text-xs">·</span>
          <HeartHandshake className="h-4 w-4" />
        </div>
        <h1 className="text-center font-display text-xl font-semibold text-dusk-900">
          Professional sign in
        </h1>
        <p className="mt-1 text-center text-sm text-mist-600">
          For verified lawyers and therapists.
        </p>

        {error && (
          <Alert tone="safety" className="mt-5">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input label="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <Input label="Password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          <Button type="submit" className="w-full" loading={submitting}>
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-mist-600">
          <p>
            New lawyer?{' '}
            <Link to="/lawyer/register" className="font-medium text-dusk-700 underline">
              Register with your bar enrolment
            </Link>
          </p>
          <p>
            New therapist?{' '}
            <Link to="/therapist/register" className="font-medium text-jade-700 underline">
              Register with your RCI/NMC number
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
