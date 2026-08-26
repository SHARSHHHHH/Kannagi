/**
 * Admin Professional Service
 * 
 * Isolated service layer for Admin Professionals page.
 * Mock data for Phase 3 - replace with real API call to /api/admin/professionals when backend is implemented.
 * 
 * Professional types prepared for future expansion:
 * - LAWYER (with PRIVATE_LAWYER and GOVERNMENT_LAWYER subtypes)
 * - PSYCHOLOGIST
 * - SUPPORT_WORKER
 */

export type ProfessionalType = 
  | 'LAWYER' 
  | 'PRIVATE_LAWYER' 
  | 'GOVERNMENT_LAWYER' 
  | 'PSYCHOLOGIST' 
  | 'SUPPORT_WORKER'

export interface ProfessionalSummary {
  id: string
  name: string
  professionalType: ProfessionalType
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  caseCount: number
  registeredAt: string
}

/** Mock professional data - will be replaced with real backend API */
export function getProfessionalSummaryList(): ProfessionalSummary[] {
  return [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Adv. Menon',
      professionalType: 'LAWYER',
      verificationStatus: 'VERIFIED',
      availability: 'AVAILABLE',
      caseCount: 12,
      registeredAt: '2024-02-10',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Dr. Sharma',
      professionalType: 'PSYCHOLOGIST',
      verificationStatus: 'VERIFIED',
      availability: 'BUSY',
      caseCount: 8,
      registeredAt: '2024-03-15',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Legal Aid Corp',
      professionalType: 'GOVERNMENT_LAWYER',
      verificationStatus: 'PENDING',
      availability: 'AVAILABLE',
      caseCount: 0,
      registeredAt: '2024-04-01',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'SupportLine Services',
      professionalType: 'SUPPORT_WORKER',
      verificationStatus: 'VERIFIED',
      availability: 'AVAILABLE',
      caseCount: 5,
      registeredAt: '2024-01-20',
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Adv. Rao',
      professionalType: 'PRIVATE_LAWYER',
      verificationStatus: 'REJECTED',
      availability: 'BUSY',
      caseCount: 3,
      registeredAt: '2024-05-05',
    },
  ]
}

/** Professional type label for display */
export function getProfessionalTypeLabel(type: ProfessionalType): string {
  const map: Record<ProfessionalType, string> = {
    LAWYER: 'Lawyer',
    PRIVATE_LAWYER: 'Private Lawyer',
    GOVERNMENT_LAWYER: 'Government Lawyer',
    PSYCHOLOGIST: 'Psychologist',
    SUPPORT_WORKER: 'Support Worker',
  }
  return map[type] || type
}

/** Professional type color class */
export function getProfessionalTypeClass(type: ProfessionalType): string {
  const map: Record<ProfessionalType, string> = {
    LAWYER: 'bg-brass-100 text-brass-800',
    PRIVATE_LAWYER: 'bg-brass-100 text-brass-800',
    GOVERNMENT_LAWYER: 'bg-dusk-100 text-dusk-800',
    PSYCHOLOGIST: 'bg-jade-100 text-jade-800',
    SUPPORT_WORKER: 'bg-mist-100 text-mist-800',
  }
  return map[type] || 'bg-mist-100 text-mist-800'
}

/** Verification status badge class */
export function getVerificationStatusClass(status: string): string {
  const map: Record<string, string> = {
    VERIFIED: 'bg-jade-100 text-jade-800',
    PENDING: 'bg-brass-100 text-brass-800',
    REJECTED: 'bg-wine-100 text-wine-800',
  }
  return map[status] || 'bg-mist-100 text-mist-800'
}

/** Verification status label */
export function getVerificationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    VERIFIED: 'Verified',
    PENDING: 'Pending',
    REJECTED: 'Rejected',
  }
  return map[status] || status
}

/** Availability label */
export function getAvailabilityLabel(availability: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'Available',
    BUSY: 'Busy',
    OFFLINE: 'Offline',
  }
  return map[availability] || availability
}

/** Availability color class */
export function getAvailabilityClass(availability: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'bg-jade-100 text-jade-800',
    BUSY: 'bg-wine-100 text-wine-800',
    OFFLINE: 'bg-mist-100 text-mist-800',
  }
  return map[availability] || 'bg-mist-100 text-mist-800'
}