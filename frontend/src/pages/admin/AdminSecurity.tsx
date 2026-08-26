import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { ErrorState } from '@/components/admin/ErrorState'
import { PageHeader } from '@/components/admin/PageHeader'
import { fetchHealth } from '@/services/admin/AdminDataService'
import { cn } from '@/utils/cn'

export function AdminSecurity() {
  const [healthStatus, setHealthStatus] = useState<string>('UNKNOWN')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const health = await fetchHealth()
      setHealthStatus(health.status)
    } catch {
      setError('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />

  const isHealthy = healthStatus === 'UP'

  return (
    <div className="pt-8">
      <PageHeader title="Security" description="Security monitoring and alerts" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          value={isHealthy ? 'OK' : 'Attention'}
          label="System Status"
          icon={isHealthy ? <ShieldCheck className="h-5 w-5 text-jade-500" /> : <ShieldAlert className="h-5 w-5 text-wine-500" />}
          subtitle={isHealthy ? 'All systems operational' : 'System may require attention'}
        />
        <StatCard value="0" label="Critical Alerts" icon={<AlertTriangle className="h-5 w-5 text-mist-400" />} subtitle="No critical events" />
        <StatCard value="0" label="Warnings" icon={<Shield className="h-5 w-5 text-mist-400" />} subtitle="No warnings" />
      </div>

      <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Authentication Status</h2>
        <div className="flex items-center gap-3">
          <div className={cn('h-3 w-3 rounded-full', isHealthy ? 'bg-jade-500 animate-pulseSlow' : 'bg-wine-500')} />
          <span className="text-sm text-dusk-700">
            Authentication service is {isHealthy ? 'operational' : 'experiencing issues'}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">JWT Token Expiry</p>
            <p className="mt-1 text-sm text-mist-600">Standard session management active</p>
          </div>
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">Password Policy</p>
            <p className="mt-1 text-sm text-mist-600">BCrypt strength 12</p>
          </div>
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">CSRF Protection</p>
            <p className="mt-1 text-sm text-mist-600">Disabled (stateless API)</p>
          </div>
          <div className="rounded-xl bg-ivory-50 p-4">
            <p className="text-xs font-medium text-dusk-700">HSTS</p>
            <p className="mt-1 text-sm text-mist-600">Enabled with 1-year max-age</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Security Events</h2>
        <EmptyState
          title="No security events available"
          description="Security event logging will appear here when the backend exposes an audit endpoint."
        />
      </div>
    </div>
  )
}
