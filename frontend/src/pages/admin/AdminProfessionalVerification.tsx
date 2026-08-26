import { useEffect, useState } from 'react'
import { ShieldQuestion, Check, X } from 'lucide-react'
import { pendingVerifications, reviewCredential, type PendingCredential } from '@/services/admin/AdminVerificationService'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/services/admin/AdminDataService'

export function AdminProfessionalVerification() {
  const [items, setItems] = useState<PendingCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setItems(await pendingVerifications())
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function decide(credentialId: string, approve: boolean) {
    setBusyId(credentialId)
    try {
      await reviewCredential(credentialId, approve,
        approve ? 'Approved by admin after manual review.' : 'Declined by admin after manual review.')
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Professional verification"
        description="Lawyers and therapists whose credential did not automatically match the demo registry — every one of these needs a human decision, not an automatic rejection."
      />

      {loading ? (
        <LoadingSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShieldQuestion className="h-8 w-8 text-mist-400" />}
          title="Nothing waiting"
          description="All submitted credentials have been verified automatically."
        />
      ) : (
        <div className="space-y-3">
          {items.map(({ credential, professionalName, professionalKind }) => (
            <div key={credential.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ivory-200 bg-white p-4 shadow-card">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-dusk-900">{professionalName}</p>
                  <span className="rounded-full bg-ivory-100 px-2 py-0.5 text-xs text-mist-600">
                    {professionalKind}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-mist-600">{credential.displayIdentifier}</p>
                <p className="mt-1 text-xs text-mist-500">{credential.verificationNotes}</p>
                <p className="mt-1 text-xs text-mist-400">
                  Submitted {formatDateTime(credential.submittedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide(credential.id, true)}
                  loading={busyId === credential.id}
                  className="bg-jade-600 text-white hover:bg-jade-700">
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="safety" onClick={() => decide(credential.id, false)}
                  loading={busyId === credential.id}>
                  <X className="h-3.5 w-3.5" /> Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
