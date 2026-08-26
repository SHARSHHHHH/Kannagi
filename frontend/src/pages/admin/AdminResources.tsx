import { useState, useEffect } from 'react'
import { Search, BookOpen, ExternalLink } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { ErrorState } from '@/components/admin/ErrorState'
import { PageHeader } from '@/components/admin/PageHeader'
import { fetchLegalResources, formatDate } from '@/services/admin/AdminDataService'
import type { LegalResource } from '@/types'


export function AdminResources() {
  const [resources, setResources] = useState<LegalResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setResources(await fetchLegalResources())
    } catch {
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = resources.filter(r =>
    r.lawName.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    (r.section ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="pt-8">
      <PageHeader title="Legal Resources" description="Manage legal information and references" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard value={String(resources.length)} label="Total Resources" icon={<BookOpen className="h-5 w-5 text-dusk-400" />} />
        <StatCard
          value={String(new Set(resources.map(r => r.jurisdiction)).size)}
          label="Jurisdictions"
        />
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources by name, section, or description..."
            className="w-full rounded-xl border border-ivory-200 bg-white py-2 pl-9 pr-4 text-sm text-dusk-900 placeholder:text-mist-400 focus:border-dusk-400 focus:outline-none focus:ring-1 focus:ring-dusk-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No resources found" description="Try adjusting your search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(resource => (
            <div
              key={resource.id}
              className="rounded-2xl border border-ivory-200 bg-white p-5 shadow-card hover:shadow-lift transition-all duration-200"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-dusk-900 leading-snug">{resource.lawName}</h3>
                {resource.sourceUrl && (
                  <a
                    href={resource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-mist-400 hover:text-dusk-600 transition-colors"
                    aria-label="Open source"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {resource.section && (
                <p className="mb-2 text-xs text-mist-500">{resource.section}</p>
              )}
              <p className="mb-3 text-xs text-mist-600 line-clamp-3">{resource.description}</p>
              <div className="flex items-center justify-between text-xs text-mist-500">
                <span className="rounded-full bg-dusk-50 px-2 py-0.5 text-dusk-600">{resource.jurisdiction}</span>
                <span>Verified: {formatDate(resource.lastVerifiedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
