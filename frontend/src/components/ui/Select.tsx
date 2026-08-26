import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  optional?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, optional, options, placeholder, className, id, ...rest },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="flex items-baseline gap-2 text-sm font-medium text-dusk-900">
        {label}
        {optional && <span className="text-xs font-normal text-mist-600">Optional</span>}
      </label>

      <select
        ref={ref}
        id={selectId}
        className={cn(
          'w-full rounded-xl border border-ivory-300 bg-white px-3.5 py-2.5 text-sm shadow-sm',
          'text-dusk-900 transition-colors hover:border-ivory-400 focus:border-brass-500 focus:ring-1 focus:ring-brass-500',
          className,
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && <p className="text-xs text-mist-600">{hint}</p>}
    </div>
  )
})
