import { cn } from '@/utils/cn'

/**
 * StatCard - Statistics card component for Admin Dashboard overview.
 * 
 * Uses Kannagi design system colors: dusk, ivory, brass, wine.
 * Accepts a value, label, and optional trend indicator.
 */
interface StatCardProps {
  value: string | number
  label: string
  subtitle?: string
  trend?: { label: string; value: string; positive: boolean }
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ value, label, subtitle, trend, icon, className }: StatCardProps) {
  const positiveTrend = trend?.positive !== false

  return (
    <div
      className={cn(
        'rounded-2xl border border-ivory-200 bg-white p-6 shadow-card hover:shadow-lift transition-all duration-200',
        className,
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-dusk-700">{label}</span>
        <div className="flex items-center gap-2">
          {icon}
          {trend && (
            <span
              className={cn(
                'text-xs font-medium uppercase tracking-wider transition-colors',
                positiveTrend ? 'text-jade-600' : 'text-wine-600',
              )}
            >
              {trend.label}: {trend.value}
            </span>
          )}
        </div>
      </div>

      <div className="text-3xl font-display font-bold text-dusk-900">{value}</div>

      {subtitle && (
        <p className="mt-1 text-sm text-mist-600">{subtitle}</p>
      )}
    </div>
  )
}