import { api } from './client'
import type { ApiEnvelope } from '@/types'
import type {
  AssignmentType, CaseAssignment, ContactInfo, EscalatedCase, AdminNotificationItem,
} from '@/types/verification'

// ── Requesting a professional from a case (she does this) ─────────

export async function requestAssignment(
  caseId: string,
  professionalId: string,
  assignmentType: AssignmentType,
  noteToProfessional: string | undefined,
  accessKey: string | undefined,
): Promise<CaseAssignment> {
  const { data } = await api.post<ApiEnvelope<CaseAssignment>>(
    `/api/cases/${caseId}/assignments`,
    { professionalId, assignmentType, noteToProfessional },
    { headers: accessKey ? { 'X-Case-Access-Key': accessKey } : undefined },
  )
  return data.data
}

// ── The professional's own queue ───────────────────────────────────

export async function myOfferedAssignments(): Promise<CaseAssignment[]> {
  const { data } = await api.get<ApiEnvelope<CaseAssignment[]>>('/api/professional/assignments/offered')
  return data.data
}

export async function myAcceptedAssignments(): Promise<CaseAssignment[]> {
  const { data } = await api.get<ApiEnvelope<CaseAssignment[]>>('/api/professional/assignments/accepted')
  return data.data
}

export async function respondToAssignment(
  assignmentId: string,
  decision: 'ACCEPTED' | 'REJECTED',
  note?: string,
): Promise<CaseAssignment> {
  const { data } = await api.post<ApiEnvelope<CaseAssignment>>(
    `/api/professional/assignments/${assignmentId}/respond`,
    { decision, note },
  )
  return data.data
}

export async function sendCaseMessage(caseId: string, content: string): Promise<void> {
  await api.post(`/api/professional/cases/${caseId}/messages`, { content })
}

export async function getCaseContact(caseId: string): Promise<ContactInfo> {
  const { data } = await api.get<ApiEnvelope<ContactInfo>>(`/api/professional/cases/${caseId}/contact`)
  return data.data
}

// ── Admin: escalation queue ────────────────────────────────────────

export async function escalatedCases(): Promise<EscalatedCase[]> {
  const { data } = await api.get<ApiEnvelope<EscalatedCase[]>>('/api/admin/cases/escalated')
  return data.data
}

export async function assignPublicProfessional(
  caseId: string,
  professionalId: string,
): Promise<CaseAssignment> {
  const { data } = await api.post<ApiEnvelope<CaseAssignment>>(
    `/api/admin/cases/${caseId}/assign-public`,
    { professionalId },
  )
  return data.data
}

export async function adminNotifications(): Promise<AdminNotificationItem[]> {
  const { data } = await api.get<ApiEnvelope<AdminNotificationItem[]>>('/api/admin/notifications')
  return data.data
}
