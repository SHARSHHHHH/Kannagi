import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = 'No data available',
  description,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-4 rounded-full bg-ivory-100 p-4">
        {icon ?? <Inbox className="h-8 w-8 text-mist-400" />}
      </div>
      <p className="text-sm font-medium text-dusk-700">{title}</p>
      {description && <p className="mt-1 text-xs text-mist-500">{description}</p>}
    </div>
  )
}
