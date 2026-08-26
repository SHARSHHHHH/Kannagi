import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Wordmark } from '@/components/brand/Wordmark'
import { QuickExit } from '@/components/QuickExit'

interface AdminHeaderProps {
  onMenuToggle: () => void
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-ivory-200/80 bg-ivory-50/80 backdrop-blur-sm shadow-sm"
      aria-label="Admin header"
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-dusk-700 hover:bg-ivory-200 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/admin/overview"
            className="shrink-0 transition-opacity hover:opacity-90"
            aria-label="Go to admin overview"
          >
            <Wordmark />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <QuickExit />
        </div>
      </div>
    </header>
  )
}
