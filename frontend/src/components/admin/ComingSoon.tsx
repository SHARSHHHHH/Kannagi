import { cn } from '@/utils/cn'

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className={cn('p-6 text-dusk-700')}>
      <p>{title}</p>
    </div>
  )
}