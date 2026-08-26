import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake, LogOut, RefreshCw, Sparkles } from 'lucide-react'
import { myOfferedAssignments, myAcceptedAssignments } from '@/api/assignment'
import { AssignmentCard } from '@/components/verification/AssignmentCard'
import { Wordmark } from '@/components/brand/Wordmark'
import { useAuth } from '@/hooks/useAuth'
import type { CaseAssignment } from '@/types/verification'

/**
 * Deliberately dressed differently from the lawyer dashboard: soft jade and
 * ivory, rounded and quiet, "your practice" rather than "chambers" — a
 * therapist's portal should feel calmer than a lawyer's, on purpose.
 */
export function TherapistDashboardPage() {
  const { user, signOut } = useAuth()
  const [offered, setOffered] = useState<CaseAssignment[]>([])
  const [accepted, setAccepted] = useState<CaseAssignment[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [o, a] = await Promise.all([myOfferedAssignments(), myAcceptedAssignments()])
    setOffered(o)
    setAccepted(a)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-jade-50 via-ivory-50 to-ivory-50">
      <header className="border-b border-jade-100 bg-white/80 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/therapist/dashboard" className="flex items-center gap-2.5">
            <HeartHandshake className="h-5 w-5 text-jade-600" />
            <Wordmark />
            <span className="ml-2 rounded-full bg-jade-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-jade-700">
              Practice
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-mist-500">{user?.email}</span>
            <button onClick={() => signOut()} className="text-mist-500 hover:text-dusk-800">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-jade-600">
              Requests
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-dusk-900">
              Your practice
            </h1>
          </div>
          <button onClick={() => void load()} className="text-mist-500 hover:text-dusk-800">
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          </button>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-jade-700">
            <Sparkles className="h-4 w-4" /> Waiting on you ({offered.length})
          </h2>
          {offered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-jade-200 bg-white/60 px-5 py-8 text-center text-sm text-mist-500">
              Nothing new right now.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {offered.map((a) => (
                <AssignmentCard key={a.id} assignment={a} accentClass="text-jade-700" onChanged={load} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-jade-700">
            People you're supporting ({accepted.length})
          </h2>
          {accepted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-jade-200 bg-white/60 px-5 py-8 text-center text-sm text-mist-500">
              Nothing accepted yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {accepted.map((a) => (
                <AssignmentCard key={a.id} assignment={a} accentClass="text-jade-700" onChanged={load} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
