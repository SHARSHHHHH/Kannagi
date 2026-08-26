import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Plus } from 'lucide-react'
import { listCases } from '@/api/cases'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { CaseSummary } from '@/types'

const STATUS_LABEL: Record<CaseSummary['status'], string> = {
  OPEN: 'Open',
  AWAITING_SUPPORT: 'Waiting on a professional',
  SUPPORTED: 'With a professional',
  CLOSED: 'Closed',
}

export function CasesPage() {
  const [cases, setCases] = useState<CaseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCases()
      .then((page) => setCases(page.content))
      .catch((caught) => setError(messageFrom(caught, 'We could not load your cases.')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md font-semibold text-dusk-900">Your cases</h1>
        <Link to="/start">
          <Button size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start a new one
          </Button>
        </Link>
      </div>

      <AnkletRule className="my-8 max-w-sm" />

      {error && <Alert tone="safety">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mist-500" aria-label="Loading" />
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ivory-300 px-6 py-16 text-center">
          <p className="font-display text-lg text-dusk-800">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mist-600">
            A case is a private space for one situation. You can keep several, and delete
            any of them at any time.
          </p>
          <Link to="/start" className="mt-6 inline-block">
            <Button>Start your first case</Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {cases.map((item) => (
            <li key={item.id}>
              <Link
                to={`/cases/${item.id}`}
                className="block rounded-2xl border border-ivory-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lift"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-brass-600">
                    {item.reference}
                  </span>
                  <span className="text-xs text-mist-600">{STATUS_LABEL[item.status]}</span>
                </div>
                <p className="mt-2 font-display text-lg text-dusk-800">
                  {item.title ?? 'Untitled case'}
                </p>
                <p className="mt-1 text-sm text-mist-600">
                  {item.messageCount} {item.messageCount === 1 ? 'message' : 'messages'} · last
                  activity {new Date(item.lastActivityAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
