import { useState, useEffect } from 'react'
import { Search, Briefcase, CheckCircle } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { ErrorState } from '@/components/admin/ErrorState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/Button'
import { fetchLawyers, fetchPsychologists } from '@/services/admin/AdminDataService'
import type { Professional } from '@/types'
import { cn } from '@/utils/cn'

type TypeFilter = 'ALL' | 'LAWYER' | 'PSYCHOLOGIST'
type VerifyFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED'

function kindLabel(kind: string): string {
  const map: Record<string, string> = { LAWYER: 'Lawyer', PSYCHOLOGIST: 'Psychologist', SUPPORT_WORKER: 'Support Worker' }
  return map[kind] ?? kind
}

function kindBadgeClass(kind: string): string {
  const map: Record<string, string> = {
    LAWYER: 'bg-brass-100 text-brass-800',
    PSYCHOLOGIST: 'bg-jade-100 text-jade-800',
    SUPPORT_WORKER: 'bg-mist-100 text-mist-800',
  }
  return map[kind] ?? 'bg-mist-100 text-mist-800'
}

export function AdminProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const [verifyFilter, setVerifyFilter] = useState<VerifyFilter>('ALL')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [lawyers, psychs] = await Promise.all([fetchLawyers(), fetchPsychologists()])
      setProfessionals([...lawyers, ...psychs])
    } catch {
      setError('Failed to load professionals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = professionals.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.practiceAreas ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.specialisations ?? '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'ALL' || p.kind === typeFilter
    const matchVerify = verifyFilter === 'ALL' ||
      (verifyFilter === 'VERIFIED' && p.verified) ||
      (verifyFilter === 'UNVERIFIED' && !p.verified)
    return matchSearch && matchType && matchVerify
  })

  const verifiedCount = professionals.filter(p => p.verified).length
  const lawyerCount = professionals.filter(p => p.kind === 'LAWYER').length
  const psychCount = professionals.filter(p => p.kind === 'PSYCHOLOGIST').length

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="pt-8">
      <PageHeader title="Professionals" description="Manage lawyers, psychologists, and support workers" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(professionals.length)} label="Total" icon={<Briefcase className="h-5 w-5 text-dusk-400" />} />
        <StatCard value={String(lawyerCount)} label="Lawyers" />
        <StatCard value={String(psychCount)} label="Psychologists" />
        <StatCard value={String(verifiedCount)} label="Verified" icon={<CheckCircle className="h-5 w-5 text-jade-500" />} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialisation..."
            className="w-full rounded-xl border border-ivory-200 bg-white py-2 pl-9 pr-4 text-sm text-dusk-900 placeholder:text-mist-400 focus:border-dusk-400 focus:outline-none focus:ring-1 focus:ring-dusk-400"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as TypeFilter)}
          className="rounded-xl border border-ivory-200 bg-white px-3 py-2 text-sm text-dusk-700 focus:border-dusk-400 focus:outline-none"
        >
          <option value="ALL">All Types</option>
          <option value="LAWYER">Lawyers</option>
          <option value="PSYCHOLOGIST">Psychologists</option>
        </select>
        <select
          value={verifyFilter}
          onChange={e => setVerifyFilter(e.target.value as VerifyFilter)}
          className="rounded-xl border border-ivory-200 bg-white px-3 py-2 text-sm text-dusk-700 focus:border-dusk-400 focus:outline-none"
        >
          <option value="ALL">All Verification</option>
          <option value="VERIFIED">Verified</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>
      </div>

      <div className="rounded-2xl border border-ivory-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-ivory-200 bg-ivory-50">
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Name</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Type</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Location</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Experience</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Verification</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Rating</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(prof => (
                <tr key={prof.id} className="border-b border-ivory-200/50 hover:bg-ivory-50 transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-dusk-900">{prof.fullName}</div>
                    {prof.qualification && (
                      <div className="text-xs text-mist-500 mt-0.5">{prof.qualification}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', kindBadgeClass(prof.kind))}>
                      {kindLabel(prof.kind)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-mist-600">
                    {[prof.city, prof.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="p-3 text-sm text-mist-600">
                    {prof.yearsExperience ? `${prof.yearsExperience} yrs` : '—'}
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      prof.verified ? 'bg-jade-100 text-jade-800' : 'bg-brass-100 text-brass-800'
                    )}>
                      {prof.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-mist-600">
                    {prof.rating ? `${prof.rating}/5` : '—'}
                  </td>
                  <td className="p-3 text-sm">
                    <Button variant="ghost" size="sm" aria-label={`View ${prof.fullName}`}>View</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState title="No professionals found" description="Try adjusting your search or filters." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
