import { api } from '@/api/client'
import type { ApiEnvelope } from '@/types'
import type { CredentialStatus } from '@/types/verification'

export interface PendingCredential {
  credential: CredentialStatus
  professionalName: string
  professionalKind: string | null
}

export async function pendingVerifications(): Promise<PendingCredential[]> {
  try {
    const { data } = await api.get<ApiEnvelope<PendingCredential[]>>(
      '/api/admin/professionals/pending-verification',
    )
    return data.data
  } catch {
    return []
  }
}

export async function reviewCredential(
  credentialId: string,
  approve: boolean,
  note?: string,
): Promise<CredentialStatus> {
  const { data } = await api.post<ApiEnvelope<CredentialStatus>>(
    `/api/admin/professionals/credentials/${credentialId}/review`,
    { approve, note },
  )
  return data.data
}
