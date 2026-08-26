import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeCase } from '@/api/cases'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function ResumeCasePage() {
  const navigate = useNavigate()

  const [reference, setReference] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const resumed = await resumeCase(reference.trim(), accessKey.trim())
      navigate(`/cases/${resumed.id}`, { replace: true })
    } catch (caught) {
      // The server does not distinguish a wrong reference from a wrong key, so
      // neither does this message.
      setError(
        messageFrom(
          caught,
          'That reference and key did not match a case. Check both and try again.',
        ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-semibold text-dusk-900">
        Reopen an anonymous case
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-mist-600">
        Enter the reference and access key you saved when you started.
      </p>

      <AnkletRule className="my-6" />

      {error && (
        <Alert tone="safety" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Case reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="KN-XXXXXXXX"
          autoComplete="off"
          spellCheck={false}
          required
        />
        <Input
          label="Access key"
          value={accessKey}
          onChange={(event) => setAccessKey(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          required
        />
        <Button type="submit" loading={submitting} className="w-full">
          Open my case
        </Button>
      </form>

      <p className="mt-6 rounded-xl bg-ivory-100 px-4 py-3 text-xs leading-relaxed text-mist-600">
        If you no longer have both, the case cannot be recovered — that is what makes it
        anonymous. You can start a new one whenever you are ready.
      </p>
    </Card>
  )
}
