import { useState, useEffect } from 'react'
import { Search, FolderOpen, CheckCircle, Clock } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { ErrorState } from '@/components/admin/ErrorState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/Button'
import { fetchCases, formatDate } from '@/services/admin/AdminDataService'
import { cn } from '@/utils/cn'

type StatusFilter = 'ALL' | 'OPEN' | 'AWAITING_SUPPORT' | 'SUPPORTED' | 'CLOSED'

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#2F7D72',
  AWAITING_SUPPORT: '#D4AF37',
  SUPPORTED: '#436192',
  CLOSED: '#8794A8',
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    OPEN: 'Open', AWAITING_SUPPORT: 'Awaiting Support', SUPPORTED: 'Supported', CLOSED: 'Closed',
  }
  return map[s] ?? s
}

function statusBadgeClass(s: string): string {
  const map: Record<string, string> = {
    OPEN: 'bg-jade-100 text-jade-800',
    AWAITING_SUPPORT: 'bg-brass-100 text-brass-800',
    SUPPORTED: 'bg-dusk-100 text-dusk-800',
    CLOSED: 'bg-mist-100 text-mist-800',
  }
  return map[s] ?? 'bg-mist-100 text-mist-800'
}

function privacyLabel(p: string): string {
  const map: Record<string, string> = { ANONYMOUS: 'Anonymous', CONFIDENTIAL: 'Confidential', IDENTIFIED: 'Identified' }
  return map[p] ?? p
}

function privacyBadgeClass(p: string): string {
  const map: Record<string, string> = {
    ANONYMOUS: 'bg-mist-100 text-mist-800',
    CONFIDENTIAL: 'bg-jade-100 text-jade-800',
    IDENTIFIED: 'bg-dusk-100 text-dusk-800',
  }
  return map[p] ?? 'bg-mist-100 text-mist-800'
}

interface CaseRow {
  id: string
  reference: string
  title: string | null
  privacyMode: string
  status: string
  legalPathway: string
  messageCount: number
  lastActivityAt: string
  createdAt: string
}

export function AdminCases() {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const page = await fetchCases(0, 200)
      setCases(page.content)
    } catch {
      setError('Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = cases.filter(c => {
    const matchSearch = (c.reference ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.title ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const openCount = cases.filter(c => c.status === 'OPEN').length
  const awaitingCount = cases.filter(c => c.status === 'AWAITING_SUPPORT').length
  const closedCount = cases.filter(c => c.status === 'CLOSED').length

  const chartData = [
    { name: 'Open', value: openCount },
    { name: 'Awaiting Support', value: awaitingCount },
    { name: 'Supported', value: cases.filter(c => c.status === 'SUPPORTED').length },
    { name: 'Closed', value: closedCount },
  ].filter(d => d.value > 0)

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="pt-8">
      <PageHeader title="Cases" description="Monitor and manage user cases" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(cases.length)} label="Total Cases" icon={<FolderOpen className="h-5 w-5 text-dusk-400" />} />
        <StatCard value={String(openCount)} label="Open" icon={<CheckCircle className="h-5 w-5 text-jade-500" />} />
        <StatCard value={String(awaitingCount)} label="Awaiting" icon={<Clock className="h-5 w-5 text-brass-500" />} />
        <StatCard value={String(closedCount)} label="Closed" />
      </div>

      {chartData.length > 0 && (
        <div className="mb-6 rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name === 'Open' ? 'OPEN' : entry.name === 'Awaiting Support' ? 'AWAITING_SUPPORT' : entry.name === 'Supported' ? 'SUPPORTED' : 'CLOSED']} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #F2ECE1', fontSize: '0.75rem' }} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by reference or title..."
            className="w-full rounded-xl border border-ivory-200 bg-white py-2 pl-9 pr-4 text-sm text-dusk-900 placeholder:text-mist-400 focus:border-dusk-400 focus:outline-none focus:ring-1 focus:ring-dusk-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-ivory-200 bg-white px-3 py-2 text-sm text-dusk-700 focus:border-dusk-400 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="AWAITING_SUPPORT">Awaiting Support</option>
          <option value="SUPPORTED">Supported</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="rounded-2xl border border-ivory-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-ivory-200 bg-ivory-50">
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Reference</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Title</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Status</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Privacy</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Messages</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Created</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-ivory-200/50 hover:bg-ivory-50 transition-colors">
                  <td className="p-3 font-medium text-dusk-900 font-mono text-sm">{c.reference}</td>
                  <td className="p-3 text-sm text-dusk-700 max-w-[200px] truncate">{c.title || '—'}</td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusBadgeClass(c.status))}>
                      {statusLabel(c.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', privacyBadgeClass(c.privacyMode))}>
                      {privacyLabel(c.privacyMode)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-mist-600">{c.messageCount}</td>
                  <td className="p-3 text-sm text-mist-600">{formatDate(c.createdAt)}</td>
                  <td className="p-3 text-sm">
                    <Button variant="ghost" size="sm" aria-label={`View case ${c.reference}`}>View</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState title="No cases found" description="Try adjusting your search or filters." />
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
