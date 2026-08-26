export type CredentialKind = 'LAWYER' | 'CLINICAL_PSYCHOLOGIST' | 'PSYCHIATRIST'

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED'

export interface CredentialStatus {
  id: string
  professionalId: string
  credentialKind: CredentialKind
  displayIdentifier: string
  verificationStatus: VerificationStatus
  verificationMethod: string | null
  verificationNotes: string | null
  submittedAt: string
  verifiedAt: string | null
}

export interface ProfessionalAuthResult {
  verificationStatus: VerificationStatus
  message: string
  accessToken: string | null
  refreshToken: string | null
  expiresInSeconds: number | null
  user: import('./index').User | null
}

export type AssignmentType = 'PRIVATE' | 'PUBLIC' | 'LEGAL_AID'
export type AssignmentStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'COMPLETED'

export interface CaseAssignment {
  id: string
  caseId: string
  caseReference: string | null
  professionalId: string
  professionalName: string | null
  assignmentType: AssignmentType
  status: AssignmentStatus
  offeredAt: string
  respondedAt: string | null
  noticeDeadline: string
  escalated: boolean
  caseAnonymous: boolean
  caseTitle: string | null
  caseConcernSummary: string | null
}

export interface ContactInfo {
  shared: boolean
  displayName: string | null
  phone: string | null
  note: string
}

export interface EscalatedCase {
  caseId: string
  caseReference: string | null
  legalPathway: string | null
  lastAssignmentId: string
  lastProfessionalName: string | null
  lastAssignmentType: AssignmentType
  escalatedAt: string | null
}

export interface AdminNotificationItem {
  id: string
  type: string
  resourceType: string
  resourceId: string
  message: string
  severity: 'INFO' | 'WARN' | 'CRITICAL'
  readAt: string | null
  resolvedAt: string | null
  createdAt: string
}
