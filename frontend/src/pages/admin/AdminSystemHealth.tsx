import { useState, useEffect } from 'react'
import { Activity, RefreshCw, Server, Database, Wifi } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { ErrorState } from '@/components/admin/ErrorState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/Button'
import { fetchHealth, formatDateTime } from '@/services/admin/AdminDataService'
import type { HealthStatus } from '@/services/admin/AdminDataService'
import { cn } from '@/utils/cn'

export function AdminSystemHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string>('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const h = await fetchHealth()
      setHealth(h)
      setLastChecked(new Date().toISOString())
    } catch {
      setError('Failed to reach health endpoint')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!health) return <EmptyState title="No health data available" />

  const isUp = health.status === 'UP'

  return (
    <div className="pt-8">
      <PageHeader
        title="System Health"
        description="Backend and service health status"
        actions={
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          value={isUp ? 'Healthy' : 'Down'}
          label="Backend Status"
          icon={isUp ? <Activity className="h-5 w-5 text-jade-500" /> : <Activity className="h-5 w-5 text-wine-500" />}
          subtitle={isUp ? 'All services operational' : 'Service unavailable'}
        />
        <StatCard value={health.status} label="Health Code" icon={<Server className="h-5 w-5 text-dusk-400" />} />
        <StatCard
          value={health.components ? String(Object.keys(health.components).length) : '—'}
          label="Components"
          icon={<Database className="h-5 w-5 text-dusk-400" />}
          subtitle="Monitored subsystems"
        />
        <StatCard
          value={lastChecked ? formatDateTime(lastChecked) : '—'}
          label="Last Checked"
          icon={<Wifi className="h-5 w-5 text-dusk-400" />}
        />
      </div>

      {health.components && Object.keys(health.components).length > 0 && (
        <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card mb-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Component Details</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(health.components).map(([name, component]) => (
              <div key={name} className="flex items-center justify-between rounded-xl bg-ivory-50 p-4">
                <span className="text-sm font-medium text-dusk-700 capitalize">{name}</span>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  component.status === 'UP' ? 'bg-jade-100 text-jade-800' : 'bg-wine-100 text-wine-800'
                )}>
                  {component.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Configuration</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">Actuator Endpoints</p>
            <p className="mt-1 text-sm text-mist-600">health, info (exposed)</p>
          </div>
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">Health Detail Level</p>
            <p className="mt-1 text-sm text-mist-600">Summary only (no component details)</p>
          </div>
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">API Base URL</p>
            <p className="mt-1 text-sm text-mist-600 font-mono">{import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}</p>
          </div>
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">Management Port</p>
            <p className="mt-1 text-sm text-mist-600">Same as application</p>
          </div>
        </div>
      </div>
    </div>
  )
}
