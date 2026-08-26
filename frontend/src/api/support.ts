import { api } from './client'
import type {
  AIAnalysis, ApiEnvelope, Appointment, ChatReply, CommunityPost,
  Consent, LanguageCode, LegalCaseSummary, LegalResource, Page,
  PrivacyOverview, Professional, Transcription,
} from '@/types'

// ── Analysis ────────────────────────────────────────────────────

export async function analyse(text: string, language?: LanguageCode): Promise<AIAnalysis> {
  const { data } = await api.post<ApiEnvelope<AIAnalysis>>('/api/ai/analyse', { text, language })
  return data.data
}

export async function chat(
  message: string,
  language?: LanguageCode,
  psychologicalMode = false,
): Promise<ChatReply> {
  const { data } = await api.post<ApiEnvelope<ChatReply>>('/api/ai/chat', {
    message,
    language,
    psychologicalMode,
  })
  return data.data
}

// ── Speech ──────────────────────────────────────────────────────

export async function transcribe(blob: Blob, language?: LanguageCode): Promise<Transcription> {
  const form = new FormData()
  form.append('file', blob, 'recording.webm')
  if (language) form.append('language', language)

  const { data } = await api.post<ApiEnvelope<Transcription>>('/api/speech/transcribe', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// ── Legal ───────────────────────────────────────────────────────

export async function legalResources(
  category?: string,
): Promise<{ resources: LegalResource[]; disclaimer: string }> {
  const { data } = await api.get<ApiEnvelope<{ resources: LegalResource[]; disclaimer: string }>>(
    '/api/legal/resources',
    { params: { category } },
  )
  return data.data
}

export async function searchLegal(
  text: string,
  language?: LanguageCode,
): Promise<{
  analysis: AIAnalysis
  resources: LegalResource[]
  disclaimer: string
  noMatchNote: string | null
}> {
  const { data } = await api.post<
    ApiEnvelope<{
      analysis: AIAnalysis
      resources: LegalResource[]
      disclaimer: string
      noMatchNote: string | null
    }>
  >('/api/legal/search', { text, language })
  return data.data
}

export async function legalCases(): Promise<{ cases: LegalCaseSummary[]; disclaimer: string }> {
  const { data } = await api.get<ApiEnvelope<{ cases: LegalCaseSummary[]; disclaimer: string }>>(
    '/api/legal/cases',
  )
  return data.data
}

// ── Directories ─────────────────────────────────────────────────

interface DirectoryFilters {
  state?: string
  language?: string
  practiceArea?: string
  specialisation?: string
  legalAid?: boolean
  online?: boolean
}

export async function lawyers(
  filters: DirectoryFilters = {},
): Promise<{ professionals: Professional[]; notice: string }> {
  const { data } = await api.get<ApiEnvelope<{ professionals: Professional[]; notice: string }>>(
    '/api/lawyers',
    { params: filters },
  )
  return data.data
}

export async function psychologists(
  filters: DirectoryFilters = {},
): Promise<{ professionals: Professional[]; notice: string }> {
  const { data } = await api.get<ApiEnvelope<{ professionals: Professional[]; notice: string }>>(
    '/api/psychologists',
    { params: filters },
  )
  return data.data
}

// ── Appointments ────────────────────────────────────────────────

export async function bookAppointment(payload: {
  professionalId: string
  caseId?: string
  scheduledAt: string
  mode?: 'ONLINE' | 'IN_PERSON'
  anonymous: boolean
  note?: string
  consentToShare: boolean
}): Promise<Appointment> {
  const { data } = await api.post<ApiEnvelope<Appointment>>('/api/appointments', payload)
  return data.data
}

export async function myAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<ApiEnvelope<Appointment[]>>('/api/appointments')
  return data.data
}

// ── Community ───────────────────────────────────────────────────

export async function communityPosts(): Promise<Page<CommunityPost>> {
  const { data } = await api.get<ApiEnvelope<Page<CommunityPost>>>('/api/community/posts')
  return data.data
}

export async function createPost(payload: {
  title: string
  content: string
  category: string
  anonymous: boolean
}): Promise<{ post: CommunityPost; moderationReasons: string[]; notice: string }> {
  const { data } = await api.post<
    ApiEnvelope<{ post: CommunityPost; moderationReasons: string[]; notice: string }>
  >('/api/community/posts', payload)
  return data.data
}

export async function markHelpful(postId: string): Promise<CommunityPost> {
  const { data } = await api.post<ApiEnvelope<CommunityPost>>(
    `/api/community/posts/${postId}/helpful`,
  )
  return data.data
}

// ── Privacy ─────────────────────────────────────────────────────

export async function privacyOverview(): Promise<PrivacyOverview> {
  const { data } = await api.get<ApiEnvelope<PrivacyOverview>>('/api/privacy/overview')
  return data.data
}

export async function grantConsent(type: string, sharedWith?: string): Promise<Consent> {
  const { data } = await api.post<ApiEnvelope<Consent>>('/api/privacy/consents', null, {
    params: { type, sharedWith },
  })
  return data.data
}

export async function revokeConsent(id: string): Promise<Consent> {
  const { data } = await api.delete<ApiEnvelope<Consent>>(`/api/privacy/consents/${id}`)
  return data.data
}
