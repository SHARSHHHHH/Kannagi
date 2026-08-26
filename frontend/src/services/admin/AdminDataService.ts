import { api } from '@/api/client'
import type { ApiEnvelope, CommunityPost, LegalResource, Page, Professional } from '@/types'

export interface AdminStats {
  totalUsers: number
  totalProfessionals: number
  totalCases: number
  activeCases: number
  pendingCases: number
  communityPosts: number
  securityAlerts: number
}

export interface HealthStatus {
  status: string
  components?: Record<string, { status: string }>
}

export async function fetchLawyers(): Promise<Professional[]> {
  try {
    const { data } = await api.get<ApiEnvelope<{ professionals: Professional[]; notice: string }>>('/api/lawyers')
    return data.data.professionals
  } catch {
    return []
  }
}

export async function fetchPsychologists(): Promise<Professional[]> {
  try {
    const { data } = await api.get<ApiEnvelope<{ professionals: Professional[]; notice: string }>>('/api/psychologists')
    return data.data.professionals
  } catch {
    return []
  }
}

export async function fetchCases(page = 0, size = 50): Promise<Page<{
  id: string
  reference: string
  title: string | null
  summary: string | null
  privacyMode: string
  status: string
  legalPathway: string
  messageCount: number
  lastActivityAt: string
  createdAt: string
}>> {
  try {
    const { data } = await api.get<ApiEnvelope<Page<{
      id: string
      reference: string
      title: string | null
      summary: string | null
      privacyMode: string
      status: string
      legalPathway: string
      messageCount: number
      lastActivityAt: string
      createdAt: string
    }>>>('/api/cases', { params: { page, size } })
    return data.data
  } catch {
    return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }
  }
}

export async function fetchCommunityPosts(page = 0, size = 50): Promise<Page<CommunityPost>> {
  try {
    const { data } = await api.get<ApiEnvelope<Page<CommunityPost>>>('/api/community/posts', {
      params: { page, size },
    })
    return data.data
  } catch {
    return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }
  }
}

export async function fetchLegalResources(): Promise<LegalResource[]> {
  try {
    const { data } = await api.get<ApiEnvelope<{ resources: LegalResource[]; disclaimer: string }>>('/api/legal/resources')
    return data.data.resources
  } catch {
    return []
  }
}

export async function fetchModerationQueue(): Promise<CommunityPost[]> {
  try {
    const { data } = await api.get<ApiEnvelope<CommunityPost[]>>('/api/community/moderation/queue')
    return data.data
  } catch {
    return []
  }
}

export async function moderatePost(postId: string, status: 'APPROVED' | 'HIDDEN'): Promise<CommunityPost | null> {
  try {
    const { data } = await api.patch<ApiEnvelope<CommunityPost>>(
      `/api/community/moderation/${postId}`,
      null,
      { params: { status } },
    )
    return data.data
  } catch {
    return null
  }
}

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const { data } = await api.get<HealthStatus>('/actuator/health')
    return data
  } catch {
    return { status: 'DOWN' }
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
