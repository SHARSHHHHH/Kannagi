/**
 * Admin User Service
 *
 * Privacy-first design: admins see pseudonymous identities only.
 * The backend internally maintains real accounts (for auth, notifications, etc.)
 * but the admin UI never surfaces name, email, phone, or address.
 *
 * Mock data for Phase 3 - replace with real API call to /api/admin/users
 * when backend is implemented. When that happens, use an admin-safe DTO
 * that omits PII fields.
 */

export interface UserSummary {
  id: string
  anonymousId: string
  role: string
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DEACTIVATED'
  registeredAt: string
  caseCount: number
}

/**
 * Derive a stable pseudonymous identifier from an internal UUID.
 * Uses the first 5 hex characters of the UUID (dashes stripped).
 * This is NOT derived from name or email.
 */
export function toAnonymousId(uuid: string): string {
  const hex = uuid.replace(/-/g, '').substring(0, 5).toUpperCase()
  return `USR-${hex}`
}

/**
 * Returns mock user summary list.
 * TODO: Replace with real API call to /api/admin/users when backend is implemented.
 * The response should use an admin-safe DTO that excludes name, email, phone, address.
 */
export function getUserSummaryList(): UserSummary[] {
  const mockUuids = [
    { uuid: '4a1c8d32-7e5f-4b9a-a6f1-2c3d4e5f6a7b', role: 'USER', status: 'ACTIVE' as const, registeredAt: '2024-03-15', caseCount: 3 },
    { uuid: '9f2e1d88-3b4a-4c5d-b7e6-f8a9b0c1d2e3', role: 'USER', status: 'SUSPENDED' as const, registeredAt: '2024-01-22', caseCount: 0 },
    { uuid: '7c6b5a43-2e1f-4d8c-9a0b-1c2d3e4f5a6b', role: 'USER', status: 'ACTIVE' as const, registeredAt: '2024-05-10', caseCount: 7 },
    { uuid: '3d4e5f6a-7b8c-4d9e-a0f1-2c3d4e5f6a7b', role: 'USER', status: 'PENDING' as const, registeredAt: '2024-06-28', caseCount: 1 },
    { uuid: 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', role: 'USER', status: 'DEACTIVATED' as const, registeredAt: '2023-11-05', caseCount: 2 },
  ]

  return mockUuids.map(m => ({
    id: m.uuid,
    anonymousId: toAnonymousId(m.uuid),
    role: m.role,
    status: m.status,
    registeredAt: m.registeredAt,
    caseCount: m.caseCount,
  }))
}

/** Status badge class mapping for UI */
export function getUserStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-jade-100 text-jade-800',
    SUSPENDED: 'bg-wine-100 text-wine-800',
    PENDING: 'bg-brass-100 text-brass-800',
    DEACTIVATED: 'bg-mist-100 text-mist-800',
  }
  return map[status] || 'bg-mist-100 text-mist-800'
}

/** Short status text for display */
export function getUserStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    PENDING: 'Pending',
    DEACTIVATED: 'Deactivated',
  }
  return map[status] || status
}
