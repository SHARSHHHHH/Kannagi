import { cn } from '@/utils/cn'

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('min-h-[400px] flex items-center justify-center p-8', className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ivory-300 border-t-dusk-600" />
        <p className="text-sm text-mist-500">Loading...</p>
      </div>
    </div>
  )
}
