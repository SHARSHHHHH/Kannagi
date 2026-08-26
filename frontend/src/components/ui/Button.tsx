import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'safety' | 'onDark' | 'gold'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-dusk-800 text-ivory-50 hover:bg-dusk-900 active:bg-dusk-950 shadow-sm border border-dusk-700/50 hover:border-brass-500/40',
  secondary:
    'bg-white text-dusk-800 border border-ivory-300 hover:border-dusk-400 hover:bg-ivory-50 active:bg-ivory-100 shadow-sm',
  ghost: 'text-dusk-700 hover:bg-ivory-200/60 active:bg-ivory-200',
  gold: 'bg-brass-500 text-dusk-950 hover:bg-brass-400 active:bg-brass-600 font-semibold shadow-sm',
  // Reserved for genuine safety actions. Deep wine red tone.
  safety: 'bg-wine-700 text-white hover:bg-wine-800 active:bg-wine-900 shadow-sm border border-wine-600/50',
  // For the dark hero.
  onDark:
    'bg-ivory-50 text-dusk-900 hover:bg-white hover:shadow-gold active:bg-ivory-200 border border-brass-400/30',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs tracking-wide rounded-lg gap-1.5 font-medium',
  md: 'h-11 px-5 text-sm rounded-xl gap-2 font-medium',
  lg: 'h-12 px-7 text-base rounded-xl gap-2.5 font-medium',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.985]',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  )
})
