import { api, setTokens } from './client'
import type { ApiEnvelope } from '@/types'
import type { CredentialStatus, ProfessionalAuthResult } from '@/types/verification'

export interface LawyerRegisterPayload {
  email: string
  password: string
  fullName: string
  barStateCode: string
  barSerialNumber: string
  barEnrollmentYear: number
  certificateOfPractice: boolean
  qualification?: string
  practiceAreas?: string
  city?: string
  state?: string
  languages?: string
  captchaToken?: string
}

export interface TherapistRegisterPayload {
  email: string
  password: string
  credentialKind: 'CLINICAL_PSYCHOLOGIST' | 'PSYCHIATRIST'
  registeredFullName: string
  licenseNumber: string
  qualification?: string
  specialisations?: string
  city?: string
  state?: string
  languages?: string
  captchaToken?: string
}

/**
 * After a successful call, tokens are stored through the same mechanism the
 * regular user session uses (setTokens in api/client.ts). A lawyer or
 * therapist IS a User underneath — same JWT, same refresh flow, same
 * AuthContext — verification only decided whether this call was allowed to
 * succeed at all.
 */
async function applySession(result: ProfessionalAuthResult): Promise<ProfessionalAuthResult> {
  if (result.accessToken && result.refreshToken) {
    setTokens(result.accessToken, result.refreshToken)
  }
  return result
}

export async function registerLawyer(payload: LawyerRegisterPayload): Promise<ProfessionalAuthResult> {
  const { data } = await api.post<ApiEnvelope<ProfessionalAuthResult>>(
    '/api/professional-auth/lawyer/register',
    payload,
  )
  return applySession(data.data)
}

export async function registerTherapist(payload: TherapistRegisterPayload): Promise<ProfessionalAuthResult> {
  const { data } = await api.post<ApiEnvelope<ProfessionalAuthResult>>(
    '/api/professional-auth/therapist/register',
    payload,
  )
  return applySession(data.data)
}

export async function professionalLogin(
  email: string,
  password: string,
  captchaToken?: string,
): Promise<ProfessionalAuthResult> {
  const { data } = await api.post<ApiEnvelope<ProfessionalAuthResult>>('/api/professional-auth/login', {
    email,
    password,
    captchaToken,
  })
  return applySession(data.data)
}

export async function myCredential(): Promise<CredentialStatus> {
  const { data } = await api.get<ApiEnvelope<CredentialStatus>>('/api/professional-auth/me/credential')
  return data.data
}
