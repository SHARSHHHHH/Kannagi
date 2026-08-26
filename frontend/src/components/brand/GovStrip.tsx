import { Seal } from '@/components/brand/Seal'
import { cn } from '@/utils/cn'

/**
 * The slim official strip above the header on every screen.
 *
 * It does three jobs at once: it states that this is a government digital
 * service, it carries the Digital India mark, and it is deliberately unreadable
 * at a glance from across a room — no recognisable product name, just the
 * formal ministry line. The quick exit stays in the header below it.
 */
export function GovStrip({ className }: { className?: string }) {
  return (
    <div className={cn('border-b border-dusk-800/60 bg-dusk-950 text-ivory-200', className)}>
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4 px-4 text-[11px] tracking-wide sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Seal className="h-4 w-4 shrink-0 text-brass-400" />
          <span className="truncate font-medium">
            <span className="hidden sm:inline">भारत सरकार · </span>Government of India
            <span className="hidden md:inline text-ivory-300/70"> · Ministry of Women &amp; Child Development</span>
          </span>
        </div>
        <div className="shrink-0 font-semibold tracking-wider text-brass-300">Digital India</div>
      </div>
    </div>
  )
}
