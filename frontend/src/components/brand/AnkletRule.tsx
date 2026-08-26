import { cn } from '@/utils/cn'

/**
 * The anklet rule.
 *
 * A hairline punctuated by small brass beads, after the silambu whose gemstones
 * were the evidence that finally got Kannagi believed. It marks the boundary
 * between sections and appears nowhere else — the one ornament in the interface,
 * so it has to stay rare to keep meaning anything.
 */
export function AnkletRule({
  className,
  tone = 'light',
  beads = 3,
}: {
  className?: string
  tone?: 'light' | 'dark'
  beads?: number
}) {
  const line = tone === 'dark' ? 'bg-dusk-400/40' : 'bg-ivory-400'
  const bead = tone === 'dark' ? 'bg-brass-400' : 'bg-brass-500'

  return (
    <div className={cn('flex items-center gap-2', className)} aria-hidden="true">
      <span className={cn('h-px flex-1', line)} />
      {Array.from({ length: beads }).map((_, index) => (
        <span key={index} className={cn('h-1 w-1 rounded-full', bead)} />
      ))}
      <span className={cn('h-px flex-1', line)} />
    </div>
  )
}
