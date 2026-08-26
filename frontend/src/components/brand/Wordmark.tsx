import { BRAND } from '@/config/brand'
import { Seal } from '@/components/brand/Seal'
import { cn } from '@/utils/cn'

export function Wordmark({
  tone = 'dark',
  showTagline = false,
  official = false,
  className,
}: {
  tone?: 'dark' | 'light'
  showTagline?: boolean
  official?: boolean
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <Seal
        className={cn(
          'h-8 w-8 shrink-0',
          tone === 'light' ? 'text-brass-300' : 'text-brass-500',
        )}
      />
      <div className="inline-flex flex-col">
        <span
          className={cn(
            'font-display text-lg font-semibold tracking-tight leading-tight sm:text-xl',
            tone === 'light' ? 'text-ivory-50' : 'text-dusk-800',
          )}
        >
          {BRAND.displayName}
        </span>
        {official ? (
          <span
            className={cn(
              'text-[10px] leading-tight tracking-wide',
              tone === 'light' ? 'text-ivory-300/80' : 'text-mist-600',
            )}
          >
            Government of India · Women &amp; Child Development
          </span>
        ) : showTagline ? (
          <span
            className={cn(
              'mt-0.5 text-xs',
              tone === 'light' ? 'text-mist-300' : 'text-mist-600',
            )}
          >
            {BRAND.tagline}
          </span>
        ) : null}
      </div>
    </div>
  )
}
