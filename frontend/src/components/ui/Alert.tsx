import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

type Tone = 'info' | 'success' | 'safety'

const TONES: Record<Tone, { wrap: string; icon: typeof Info }> = {
  info: { wrap: 'bg-ivory-100 border-ivory-300 text-dusk-900', icon: Info },
  success: { wrap: 'bg-jade-50 border-jade-200 text-jade-800', icon: CheckCircle2 },
  // Wine tone reserved for critical safety alerts.
  safety: { wrap: 'bg-wine-50 border-wine-300 text-wine-900', icon: AlertTriangle },
}

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone
  title?: string
  children: ReactNode
  className?: string
}) {
  const { wrap, icon: Icon } = TONES[tone]

  return (
    <div
      role={tone === 'safety' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border px-4 py-3.5 text-sm shadow-sm', wrap, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-current opacity-90" aria-hidden="true" />
      <div className="space-y-0.5">
        {title && <p className="font-semibold text-current">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
