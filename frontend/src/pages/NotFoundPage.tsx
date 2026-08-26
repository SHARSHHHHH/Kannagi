import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { AnkletRule } from '@/components/brand/AnkletRule'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <div>
        <p className="text-eyebrow font-semibold uppercase tracking-wider text-brass-600">
          Page not found
        </p>
        <h1 className="mt-3 font-display text-display-md font-semibold text-balance text-dusk-900">
          This page does not exist
        </h1>
        <p className="mt-3 text-mist-600">The link may be old, or slightly mistyped.</p>
      </div>
      <AnkletRule className="max-w-xs" />
      <Link to="/">
        <Button>Go to the start</Button>
      </Link>
    </div>
  )
}
