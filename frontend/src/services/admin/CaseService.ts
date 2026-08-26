/**
 * Admin Case Service
 * 
 * Isolated service layer for Admin Cases page.
 * Mock data for Phase 3 - replace with real API call to /api/admin/cases when backend is implemented.
 */

export type CaseStatus = 'ACTIVE' | 'PENDING' | 'ESCALATED' | 'CLOSED'
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface CaseSummary {
  reference: string
  type: string
  status: CaseStatus
  priority: CasePriority
  assignedProfessional: string | null
  createdAt: string
  updatedAt: string
  privacyMode: 'ANONYMOUS' | 'CONFIDENTIAL' | 'IDENTIFIED'
}

/** Mock case data - will be replaced with real backend API */
export function getCaseSummaryList(): CaseSummary[] {
  return [
    {
      reference: 'KN-2024-001',
      type: 'Workplace harassment',
      status: 'ACTIVE',
      priority: 'HIGH',
      assignedProfessional: 'Adv. Menon',
      createdAt: '2024-06-01',
      updatedAt: '2024-08-10',
      privacyMode: 'CONFIDENTIAL',
    },
    {
      reference: 'KN-2024-002',
      type: 'Domestic violence',
      status: 'PENDING',
      priority: 'MEDIUM',
      assignedProfessional: null,
      createdAt: '2024-07-12',
      updatedAt: '2024-07-12',
      privacyMode: 'ANONYMOUS',
    },
    {
      reference: 'KN-2024-003',
      type: 'Dowry harassment',
      status: 'ESCALATED',
      priority: 'HIGH',
      assignedProfessional: 'Dr. Sharma',
      createdAt: '2024-05-20',
      updatedAt: '2024-08-05',
      privacyMode: 'IDENTIFIED',
    },
    {
      reference: 'KN-2024-004',
      type: 'Stalking',
      status: 'CLOSED',
      priority: 'LOW',
      assignedProfessional: 'Adv. Rao',
      createdAt: '2024-04-15',
      updatedAt: '2024-05-20',
      privacyMode: 'CONFIDENTIAL',
    },
    {
      reference: 'KN-2024-005',
      type: 'Emotional abuse',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      assignedProfessional: null,
      createdAt: '2024-06-20',
      updatedAt: '2024-08-01',
      privacyMode: 'ANONYMOUS',
    },
  ]
}

/** Case status label */
export function getCaseStatusLabel(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    ESCALATED: 'Escalated',
    CLOSED: 'Closed',
  }
  return map[status]
}

/** Case status color class */
export function getCaseStatusClass(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    ACTIVE: 'bg-jade-100 text-jade-800',
    PENDING: 'bg-brass-100 text-brass-800',
    ESCALATED: 'bg-wine-100 text-wine-800',
    CLOSED: 'bg-jade-100 text-jade-800',
  }
  return map[status]
}

/** Case priority color class */
export function getCasePriorityClass(priority: CasePriority): string {
  const map: Record<CasePriority, string> = {
    LOW: 'bg-jade-100 text-jade-800',
    MEDIUM: 'bg-brass-100 text-brass-800',
    HIGH: 'bg-wine-100 text-wine-800',
  }
  return map[priority]
}

/** Privacy mode label */
export function getPrivacyModeLabel(privacyMode: string): string {
  const map: Record<string, string> = {
    ANONYMOUS: 'Anonymous',
    CONFIDENTIAL: 'Confidential',
    IDENTIFIED: 'Identified',
  }
  return map[privacyMode]
}

/** Privacy mode color class */
export function getPrivacyModeClass(privacyMode: string): string {
  const map: Record<string, string> = {
    ANONYMOUS: 'bg-mist-100 text-mist-800',
    CONFIDENTIAL: 'bg-jade-100 text-jade-800',
    IDENTIFIED: 'bg-dusk-100 text-dusk-800',
  }
  return map[privacyMode]
}