import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, optional, className, id, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="flex items-baseline gap-2 text-sm font-medium text-dusk-900">
        {label}
        {optional && <span className="text-xs font-normal text-mist-600">Optional</span>}
      </label>

      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-dusk-900 shadow-sm transition-all',
          'placeholder:text-mist-500 focus:border-brass-500 focus:ring-1 focus:ring-brass-500',
          error ? 'border-wine-600 bg-wine-50/20' : 'border-ivory-300 hover:border-ivory-400',
          className,
        )}
        {...rest}
      />

      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-wine-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-mist-600">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
