import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gavel, LogOut, RefreshCw, Scale } from 'lucide-react'
import { myOfferedAssignments, myAcceptedAssignments } from '@/api/assignment'
import { AssignmentCard } from '@/components/verification/AssignmentCard'
import { Wordmark } from '@/components/brand/Wordmark'
import { useAuth } from '@/hooks/useAuth'
import type { CaseAssignment } from '@/types/verification'

/**
 * Deliberately dressed differently from the therapist dashboard: dark navy
 * chrome, gold accents, "Chambers" language — a lawyer's professional
 * portal should not feel like the same screen as a therapist's, and neither
 * should feel like the woman-facing product underneath.
 */
export function LawyerDashboardPage() {
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
    <div className="min-h-screen bg-[#0d1524]">
      <header className="border-b border-dusk-800 bg-dusk-950 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/lawyer/dashboard" className="flex items-center gap-2.5">
            <Gavel className="h-5 w-5 text-brass-400" />
            <Wordmark tone="light" />
            <span className="ml-2 rounded-full border border-brass-500/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brass-400">
              Chambers
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-mist-400">{user?.email}</span>
            <button onClick={() => signOut()} className="text-mist-400 hover:text-white">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brass-500">
              Case Requests
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-white">
              Your chambers
            </h1>
          </div>
          <button onClick={() => void load()} className="text-mist-400 hover:text-white">
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          </button>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brass-400">
            <Scale className="h-4 w-4" /> Awaiting your decision ({offered.length})
          </h2>
          {offered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-dusk-700 px-5 py-8 text-center text-sm text-mist-500">
              No open requests right now.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {offered.map((a) => (
                <AssignmentCard key={a.id} assignment={a} accentClass="text-brass-600" onChanged={load} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brass-400">
            Cases you have taken on ({accepted.length})
          </h2>
          {accepted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-dusk-700 px-5 py-8 text-center text-sm text-mist-500">
              Nothing accepted yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {accepted.map((a) => (
                <AssignmentCard key={a.id} assignment={a} accentClass="text-brass-600" onChanged={load} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
