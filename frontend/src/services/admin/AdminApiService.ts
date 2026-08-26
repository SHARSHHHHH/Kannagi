/**
 * Admin API Service
 *
 * DEAD CODE — not imported by any component.
 * Kept for reference only. The active admin services are:
 *   - AdminDataService.ts (real API calls)
 *   - UserService.ts (privacy-safe mock user data)
 *   - ProfessionalService.ts (mock professional data)
 *   - CaseService.ts (mock case data)
 *
 * This file previously contained PII (name, email) in mock data.
 * That data has been removed to prevent accidental use.
 */

export interface MockAdminStats {
  totalUsers: number
  activeCases: number
  pendingCases: number
  verifiedProfessionals: number
  newRequests: number
  securityAlerts: number
}

/**
 * Returns mock admin statistics.
 * TODO: Replace with real API call to /api/admin/overview when backend is implemented.
 */
export function getAdminStats(): MockAdminStats {
  return {
    totalUsers: 247,
    activeCases: 89,
    pendingCases: 23,
    verifiedProfessionals: 15,
    newRequests: 12,
    securityAlerts: 3,
  }
}

/**
 * Helper: format date string for display
 * Usage: formatDate('2024-03-15') → '15 Mar 2024'
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Helper: get status badge className
 */
export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-jade-100 text-jade-800',
    SUSPENDED: 'bg-wine-100 text-wine-800',
    PENDING: 'bg-brass-100 text-brass-800',
    ESCALATED: 'bg-wine-100 text-wine-800',
    CLOSED: 'bg-jade-100 text-jade-800',
    HIGH: 'bg-wine-600 text-wine-50',
    MEDIUM: 'bg-brass-600 text-brass-50',
    LOW: 'jade-600 text-jade-50',
  }
  return map[status] || 'bg-mist-100 text-mist-800'
}
