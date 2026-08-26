import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/dashboard', { replace: true })
    } catch (caught) {
      setError(messageFrom(caught, 'We could not sign you in. Check your details and try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-semibold text-dusk-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-mist-600">
        Sign in to reach your conversations and requests.
      </p>

      <AnkletRule className="my-6" />

      {error && (
        <Alert tone="safety" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          <Link to="/forgot-password" className="text-dusk-600 hover:text-dusk-800">
            Forgot your password?
          </Link>
        </p>
        <p className="text-mist-600">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-dusk-600 hover:text-dusk-800">
            Create one
          </Link>
        </p>
      </div>

      <p className="mt-6 rounded-xl bg-ivory-100 px-4 py-3 text-xs leading-relaxed text-mist-600">
        You do not need an account to talk.{' '}
        <Link to="/chat" className="font-medium text-dusk-600 hover:text-dusk-800">
          Continue anonymously instead
        </Link>
        .
      </p>
    </Card>
  )
}
