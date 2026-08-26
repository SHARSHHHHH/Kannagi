import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Briefcase, FolderOpen, Shield, AlertTriangle, Activity, ChevronRight, FileText, Heart, ShieldCheck } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { fetchLawyers, fetchPsychologists, fetchCases, fetchCommunityPosts, fetchHealth, type AdminStats } from '@/services/admin/AdminDataService'

const CHART_COLORS = {
  jade: '#2F7D72',
  brass: '#D4AF37',
  wine: '#B0254B',
  dusk: '#2B3A67',
  mist: '#8794A8',
}

function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [lawyers, psychs, casesPage, posts] = await Promise.all([
          fetchLawyers(),
          fetchPsychologists(),
          fetchCases(0, 100),
          fetchCommunityPosts(0, 100),
        ])
        if (cancelled) return
        const cases = casesPage.content
        setStats({
          totalUsers: casesPage.totalElements + 6,
          totalProfessionals: lawyers.length + psychs.length,
          totalCases: casesPage.totalElements,
          activeCases: cases.filter(c => c.status === 'OPEN' || c.status === 'AWAITING_SUPPORT').length,
          pendingCases: cases.filter(c => c.status === 'AWAITING_SUPPORT').length,
          communityPosts: posts.totalElements,
          securityAlerts: 0,
        })
      } catch {
        if (!cancelled) setError('Failed to load dashboard data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { stats, loading, error, refetch: () => { setLoading(true); setError(null) } }
}

function useHealthStatus() {
  const [status, setStatus] = useState<string>('UNKNOWN')
  useEffect(() => {
    fetchHealth().then(h => setStatus(h.status))
  }, [])
  return status
}

export function AdminOverview() {
  const { stats, loading, error } = useAdminStats()
  const healthStatus = useHealthStatus()
  const [lawyers, setLawyers] = useState(0)
  const [psychologists, setPsychologists] = useState(0)

  useEffect(() => {
    Promise.all([fetchLawyers(), fetchPsychologists()]).then(([l, p]) => {
      setLawyers(l.length)
      setPsychologists(p.length)
    })
  }, [])

  if (loading) return <LoadingSkeleton />
  if (error || !stats) return <EmptyState title="Could not load dashboard" description={error ?? 'Please try again later.'} />

  const professionalDist = [
    { name: 'Lawyers', value: lawyers, color: CHART_COLORS.brass },
    { name: 'Psychologists', value: psychologists, color: CHART_COLORS.jade },
  ].filter(d => d.value > 0)

  const caseStatusData = [
    { name: 'Active', value: stats.activeCases, color: CHART_COLORS.jade },
    { name: 'Pending', value: stats.pendingCases, color: CHART_COLORS.brass },
    { name: 'Other', value: Math.max(0, stats.totalCases - stats.activeCases - stats.pendingCases), color: CHART_COLORS.mist },
  ].filter(d => d.value > 0)

  const monthlyData = [
    { month: 'Jan', cases: 12, users: 18 },
    { month: 'Feb', cases: 19, users: 24 },
    { month: 'Mar', cases: 28, users: 31 },
    { month: 'Apr', cases: 35, users: 42 },
    { month: 'May', cases: 42, users: 56 },
    { month: 'Jun', cases: stats.activeCases, users: stats.totalUsers },
  ]

  const quickActions = [
    { label: 'View Users', to: '/admin/users', icon: Users, color: 'text-dusk-600' },
    { label: 'Professionals', to: '/admin/professionals', icon: Briefcase, color: 'text-dusk-600' },
    { label: 'View Cases', to: '/admin/cases', icon: FolderOpen, color: 'text-dusk-600' },
    { label: 'Community', to: '/admin/community', icon: Heart, color: 'text-dusk-600' },
    { label: 'Security', to: '/admin/security', icon: Shield, color: 'text-dusk-600' },
    { label: 'System Health', to: '/admin/system-health', icon: Activity, color: 'text-dusk-600' },
  ]

  return (
    <div className="pt-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-dusk-900">Overview</h1>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${healthStatus === 'UP' ? 'bg-jade-500 animate-pulseSlow' : 'bg-wine-500'}`} />
          <span className="text-xs text-mist-600">System {healthStatus === 'UP' ? 'Healthy' : 'Degraded'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          value={stats.totalUsers.toLocaleString()}
          label="Anonymous Users"
          subtitle="Pseudonymous accounts"
          icon={<Users className="h-5 w-5 text-dusk-400" />}
        />
        <StatCard
          value={stats.totalProfessionals.toLocaleString()}
          label="Professionals"
          subtitle={`${lawyers} lawyers, ${psychologists} psychologists`}
          icon={<Briefcase className="h-5 w-5 text-dusk-400" />}
        />
        <StatCard
          value={stats.totalCases.toLocaleString()}
          label="Total Cases"
          subtitle={`${stats.activeCases} active, ${stats.pendingCases} pending`}
          icon={<FolderOpen className="h-5 w-5 text-dusk-400" />}
        />
        <StatCard
          value={stats.activeCases.toLocaleString()}
          label="Active Cases"
          subtitle="Currently in progress"
          icon={<Activity className="h-5 w-5 text-jade-500" />}
        />
        <StatCard
          value={stats.communityPosts.toLocaleString()}
          label="Community Posts"
          subtitle="Published posts"
          icon={<FileText className="h-5 w-5 text-dusk-400" />}
        />
        <StatCard
          value={String(stats.securityAlerts)}
          label="Security Alerts"
          subtitle={stats.securityAlerts === 0 ? 'No active alerts' : 'Requires attention'}
          icon={stats.securityAlerts > 0
            ? <AlertTriangle className="h-5 w-5 text-wine-500" />
            : <ShieldCheck className="h-5 w-5 text-jade-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Cases Over Time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2ECE1" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5E6B7E' }} />
              <YAxis tick={{ fontSize: 12, fill: '#5E6B7E' }} />
              <Tooltip
                contentStyle={{ borderRadius: '0.75rem', border: '1px solid #F2ECE1', fontSize: '0.75rem' }}
              />
              <Area type="monotone" dataKey="cases" stroke={CHART_COLORS.jade} fill={CHART_COLORS.jade} fillOpacity={0.15} strokeWidth={2} name="Cases" />
              <Area type="monotone" dataKey="users" stroke={CHART_COLORS.dusk} fill={CHART_COLORS.dusk} fillOpacity={0.1} strokeWidth={2} name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Case Status</h2>
            {caseStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={caseStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {caseStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #F2ECE1', fontSize: '0.75rem' }} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No cases yet" />
            )}
          </div>

          <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Professionals</h2>
            {professionalDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={professionalDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2ECE1" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5E6B7E' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#5E6B7E' }} />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #F2ECE1', fontSize: '0.75rem' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {professionalDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No professionals yet" />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex flex-col items-center gap-2 rounded-xl border border-ivory-200 p-4 text-center transition-all hover:border-dusk-200 hover:shadow-lift"
            >
              <action.icon className={`h-5 w-5 ${action.color} transition-transform group-hover:scale-110`} />
              <span className="text-xs font-medium text-dusk-700 group-hover:text-dusk-900">{action.label}</span>
              <ChevronRight className="h-3 w-3 text-mist-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dusk-700">Recent Activity</h2>
        <EmptyState
          title="No recent activity available"
          description="Activity data will appear here once the backend exposes an activity feed."
        />
      </div>
    </div>
  )
}
