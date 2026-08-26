import { cn } from '@/utils/cn'

/**
 * The Kannagi seal: a protective ring punctuated by three brass beads, the
 * silambu motif the whole interface is built around. It reads as an official
 * mark while staying true to the product's own identity — the ring is the
 * boundary she controls, the beads are the evidence she chose to share.
 */
export function Seal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('text-current', className)}
    >
      <circle cx="16" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3.2" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <circle cx="16" cy="16" r="1.1" fill="currentColor" />
      <circle cx="16" cy="7.5" r="1.6" fill="#BE9B4B" />
      <circle cx="24.5" cy="16" r="1.6" fill="#BE9B4B" />
      <circle cx="7.5" cy="16" r="1.6" fill="#BE9B4B" />
    </svg>
  )
}
