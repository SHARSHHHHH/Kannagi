import { api } from './client'
import type { ApiEnvelope, AuthResult, Gender, LanguageCode, MaritalStatus, OccupationStatus, User } from '@/types'

export interface RegisterPayload {
  email: string
  password: string
  displayName?: string
  phone?: string
  gender?: Gender
  dateOfBirth?: string
  maritalStatus?: MaritalStatus
  occupationStatus?: OccupationStatus
  city?: string
  district?: string
  state?: string
  preferredLanguage?: LanguageCode
  captchaToken?: string
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const { data } = await api.post<ApiEnvelope<AuthResult>>('/api/auth/register', payload)
  return data.data
}

export async function login(
  email: string,
  password: string,
  captchaToken?: string,
): Promise<AuthResult> {
  const { data } = await api.post<ApiEnvelope<AuthResult>>('/api/auth/login', {
    email,
    password,
    captchaToken,
  })
  return data.data
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/api/auth/logout', { refreshToken })
}

export async function forgotPassword(email: string, captchaToken?: string): Promise<string> {
  const { data } = await api.post<ApiEnvelope<{ message: string }>>('/api/auth/forgot-password', {
    email,
    captchaToken,
  })
  return data.data.message
}

export async function sendVerificationCode(
  email: string,
): Promise<{ sent: boolean; message: string; devCode: string | null }> {
  const { data } = await api.post<
    ApiEnvelope<{ sent: boolean; message: string; devCode: string | null }>
  >('/api/auth/send-code', { email })
  return data.data
}

export async function verifyCode(email: string, code: string): Promise<string> {
  const { data } = await api.post<ApiEnvelope<{ message: string }>>('/api/auth/verify-code', {
    email,
    code,
  })
  return data.data.message
}

export async function me(): Promise<User> {
  const { data } = await api.get<ApiEnvelope<User>>('/api/users/me')
  return data.data
}
