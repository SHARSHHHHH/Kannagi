import { api } from './client'
import type {
  ApiEnvelope, Case, CaseCreated, CaseMessage, CaseSummary,
  LanguageCode, LegalPathway, Page, PrivacyMode,
} from '@/types'

/**
 * The access key for an anonymous case is held in memory only, and mirrored
 * into sessionStorage so a page refresh does not lose the case.
 *
 * It is never put in a URL. A query string ends up in browser history, in
 * server logs, and in the Referer header of any outbound link.
 */
const ACCESS_KEY_STORE = 'case.accessKeys'

type KeyMap = Record<string, string>

function readKeys(): KeyMap {
  try {
    return JSON.parse(sessionStorage.getItem(ACCESS_KEY_STORE) ?? '{}') as KeyMap
  } catch {
    return {}
  }
}

export function rememberAccessKey(caseId: string, accessKey: string) {
  sessionStorage.setItem(ACCESS_KEY_STORE, JSON.stringify({ ...readKeys(), [caseId]: accessKey }))
}

export function getAccessKey(caseId: string): string | undefined {
  return readKeys()[caseId]
}

export function forgetAccessKeys() {
  sessionStorage.removeItem(ACCESS_KEY_STORE)
}

function keyHeader(caseId: string) {
  const key = getAccessKey(caseId)
  return key ? { 'X-Case-Access-Key': key } : undefined
}

export interface CreateCasePayload {
  privacyMode: PrivacyMode
  title?: string
  firstMessage?: string
  language?: LanguageCode
  captchaToken?: string
}

export async function createCase(payload: CreateCasePayload): Promise<CaseCreated> {
  const { data } = await api.post<ApiEnvelope<CaseCreated>>('/api/cases', payload)
  const created = data.data
  if (created.accessKey) {
    rememberAccessKey(created.caseDetail.id, created.accessKey)
  }
  return created
}

export async function resumeCase(
  reference: string,
  accessKey: string,
  captchaToken?: string,
): Promise<Case> {
  const { data } = await api.post<ApiEnvelope<Case>>('/api/cases/resume', {
    reference,
    accessKey,
    captchaToken,
  })
  rememberAccessKey(data.data.id, accessKey)
  return data.data
}

export async function listCases(page = 0, size = 20): Promise<Page<CaseSummary>> {
  const { data } = await api.get<ApiEnvelope<Page<CaseSummary>>>('/api/cases', {
    params: { page, size },
  })
  return data.data
}

export async function getCase(caseId: string): Promise<Case> {
  const { data } = await api.get<ApiEnvelope<Case>>(`/api/cases/${caseId}`, {
    headers: keyHeader(caseId),
  })
  return data.data
}

export async function addMessage(
  caseId: string,
  content: string,
  language?: LanguageCode,
): Promise<CaseMessage> {
  const { data } = await api.post<ApiEnvelope<CaseMessage>>(
    `/api/cases/${caseId}/messages`,
    { content, language },
    { headers: keyHeader(caseId) },
  )
  return data.data
}

export async function setLegalPathway(
  caseId: string,
  legalPathway: LegalPathway,
): Promise<Case> {
  const { data } = await api.patch<ApiEnvelope<Case>>(
    `/api/cases/${caseId}/legal-pathway`,
    { legalPathway },
    { headers: keyHeader(caseId) },
  )
  return data.data
}

export async function deleteCase(caseId: string): Promise<void> {
  await api.delete(`/api/cases/${caseId}`, { headers: keyHeader(caseId) })
}
