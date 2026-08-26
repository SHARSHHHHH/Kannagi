import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { assignPublicProfessional, escalatedCases } from '@/api/assignment'
import { fetchLawyers, fetchPsychologists } from '@/services/admin/AdminDataService'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { EscalatedCase } from '@/types/verification'
import type { Professional } from '@/types'

export function AdminEscalatedCases() {
  const [cases, setCases] = useState<EscalatedCase[]>([])
  const [lawyers, setLawyers] = useState<Professional[]>([])
  const [psychologists, setPsychologists] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [c, l, p] = await Promise.all([escalatedCases(), fetchLawyers(), fetchPsychologists()])
    setCases(c)
    setLawyers(l)
    setPsychologists(p)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function assign(caseId: string) {
    const professionalId = choices[caseId]
    if (!professionalId) return
    setBusyId(caseId)
    try {
      await assignPublicProfessional(caseId, professionalId)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const roster = [...lawyers, ...psychologists].filter((p) => p.verified)

  return (
    <div>
      <PageHeader
        title="Escalated cases"
        description="A private request was declined, or its notice period ran out with no answer. Each of these needs a public professional assigned by hand."
      />

      {loading ? (
        <LoadingSkeleton />
      ) : cases.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8 text-mist-400" />}
          title="Nothing escalated"
          description="Every private request has been accepted, or is still within its notice period."
        />
      ) : (
        <div className="space-y-3">
          {cases.map((item) => (
            <div key={item.caseId}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-wine-200 bg-wine-50/40 p-4 shadow-card">
              <div>
                <p className="font-mono text-sm font-semibold text-dusk-900">{item.caseReference}</p>
                <p className="mt-1 text-xs text-mist-600">
                  {item.lastAssignmentType} request to {item.lastProfessionalName ?? 'unknown'} did not
                  result in acceptance.
                </p>
                <p className="mt-1 text-xs text-mist-500">Pathway: {item.legalPathway}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  label=""
                  className="w-56"
                  value={choices[item.caseId] ?? ''}
                  onChange={(e) => setChoices((c) => ({ ...c, [item.caseId]: e.target.value }))}
                  placeholder="Choose a professional"
                  options={roster.map((p) => ({ value: p.id, label: `${p.fullName} · ${p.kind}` }))}
                />
                <Button size="sm" onClick={() => assign(item.caseId)}
                  loading={busyId === item.caseId} disabled={!choices[item.caseId]}>
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
