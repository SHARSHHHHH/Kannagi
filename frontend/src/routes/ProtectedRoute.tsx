import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'

/**
 * Keeps signed-out visitors away from signed-in screens.
 *
 * This is convenience, not security: every protected endpoint enforces its own
 * rule server-side. Removing this component would change what the interface
 * shows, not what the API allows.
 */
export function ProtectedRoute({ allow }: { allow?: Role[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-mist-500" aria-label="Loading" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
