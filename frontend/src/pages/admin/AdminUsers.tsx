import { useState, useEffect } from 'react'
import { Search, Users, Shield, UserX, UserCheck, Lock } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { ErrorState } from '@/components/admin/ErrorState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/Button'
import { getUserSummaryList, getUserStatusBadgeClass, getUserStatusLabel, type UserSummary } from '@/services/admin/UserService'
import { formatDate } from '@/services/admin/AdminDataService'
import { cn } from '@/utils/cn'

type UserRole = 'ALL' | 'USER' | 'LAWYER' | 'PSYCHOLOGIST' | 'SUPPORT_WORKER' | 'MODERATOR' | 'ADMIN'
type UserStatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DEACTIVATED'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'USER', label: 'User' },
  { value: 'LAWYER', label: 'Lawyer' },
  { value: 'PSYCHOLOGIST', label: 'Psychologist' },
  { value: 'SUPPORT_WORKER', label: 'Support Worker' },
  { value: 'MODERATOR', label: 'Moderator' },
  { value: 'ADMIN', label: 'Admin' },
]

const STATUS_OPTIONS: { value: UserStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
]

type SortField = 'anonymousId' | 'role' | 'status' | 'registeredAt'
type SortDir = 'asc' | 'desc'

export function AdminUsers() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole>('ALL')
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ALL')
  const [sortField, setSortField] = useState<SortField>('registeredAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    try {
      setUsers(getUserSummaryList())
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = users
    .filter(u => {
      const matchesSearch = u.anonymousId.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })

  const activeCount = users.filter(u => u.status === 'ACTIVE').length
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={() => { setLoading(true); setError(null); setTimeout(() => { setUsers(getUserSummaryList()); setLoading(false) }, 500) }} />

  const sortIcon = (field: SortField) => sortField === field ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : ''

  return (
    <div className="pt-8">
      <PageHeader title="Users" description="Manage user accounts anonymously" />

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-dusk-200 bg-dusk-50 px-4 py-3 text-xs text-dusk-700">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-dusk-500" />
        <span>Users are represented anonymously to protect confidentiality. Personally identifying information is not displayed in the admin interface.</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(users.length)} label="Anonymous Users" icon={<Users className="h-5 w-5 text-dusk-400" />} />
        <StatCard value={String(activeCount)} label="Active" icon={<UserCheck className="h-5 w-5 text-jade-500" />} />
        <StatCard value={String(suspendedCount)} label="Suspended" icon={<UserX className="h-5 w-5 text-wine-500" />} />
        <StatCard value={String(users.filter(u => u.status === 'PENDING').length)} label="Pending" icon={<Shield className="h-5 w-5 text-brass-500" />} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search anonymous ID..."
            className="w-full rounded-xl border border-ivory-200 bg-white py-2 pl-9 pr-4 text-sm text-dusk-900 placeholder:text-mist-400 focus:border-dusk-400 focus:outline-none focus:ring-1 focus:ring-dusk-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as UserRole)}
          className="rounded-xl border border-ivory-200 bg-white px-3 py-2 text-sm text-dusk-700 focus:border-dusk-400 focus:outline-none"
        >
          {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as UserStatusFilter)}
          className="rounded-xl border border-ivory-200 bg-white px-3 py-2 text-sm text-dusk-700 focus:border-dusk-400 focus:outline-none"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-ivory-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-ivory-200 bg-ivory-50">
                {[
                  { field: 'anonymousId' as SortField, label: 'Anonymous ID' },
                  { field: 'role' as SortField, label: 'Role' },
                  { field: 'status' as SortField, label: 'Status' },
                  { field: 'registeredAt' as SortField, label: 'Registered' },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => toggleSort(col.field)}
                    className="cursor-pointer p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600 hover:text-dusk-900 select-none"
                  >
                    {col.label}{sortIcon(col.field)}
                  </th>
                ))}
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-dusk-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-ivory-200/50 hover:bg-ivory-50 transition-colors">
                  <td className="p-3 font-mono font-medium text-dusk-900">{user.anonymousId}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-dusk-100 text-dusk-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getUserStatusBadgeClass(user.status))}>
                      {getUserStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-mist-600">{formatDate(user.registeredAt)}</td>
                  <td className="p-3 text-sm">
                    <Button variant="ghost" size="sm" aria-label={`View user ${user.anonymousId}`}>View</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState title="No users found" description="Try adjusting your search or filters." />
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
