import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiEnvelope, ApiErrorBody, AuthResult } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const ACCESS_TOKEN_KEY = 'auth.access'
const REFRESH_TOKEN_KEY = 'auth.refresh'

/**
 * Tokens are held in memory, with a sessionStorage copy so a page refresh does
 * not sign the user out.
 *
 * sessionStorage rather than localStorage is deliberate: closing the tab ends
 * the session. On a shared or monitored device that difference matters more
 * than the convenience of staying signed in.
 */
let accessToken: string | null = sessionStorage.getItem(ACCESS_TOKEN_KEY)
let refreshToken: string | null = sessionStorage.getItem(REFRESH_TOKEN_KEY)

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access
  refreshToken = refresh
  if (access) sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
  else sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  if (refresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  else sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getRefreshToken() {
  return refreshToken
}

export function clearTokens() {
  setTokens(null, null)
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

/** A single refresh is shared by every request that got a 401 at the same time. */
let refreshInFlight: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) throw new Error('No refresh token')

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<ApiEnvelope<AuthResult>>(`${BASE_URL}/api/auth/refresh`, { refreshToken })
      .then((response) => {
        const result = response.data.data
        setTokens(result.accessToken, result.refreshToken)
        return result.accessToken
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean }
    const isAuthCall = original?.url?.includes('/api/auth/')

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true
      try {
        const fresh = await refreshAccessToken()
        original.headers.set('Authorization', `Bearer ${fresh}`)
        return api(original)
      } catch {
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth:expired'))
      }
    }
    return Promise.reject(error)
  },
)

/** Pulls the server's message out of an error, with a usable fallback. */
export function messageFrom(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data

    if (error.response?.status === 429) {
      return 'Too many attempts in a short time. Wait a minute and try again.'
    }
    if (body?.fieldErrors?.length) return body.fieldErrors[0].message
    if (body?.message) return body.message

    if (!error.response) {
      // No response at all means the request never completed: the API is down,
      // or the browser discarded the response because CORS headers were missing.
      // Naming both saves a long hunt in the wrong direction.
      return (
        'We could not reach the server. Check that the backend is running on ' +
        (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080') +
        ', then try again.'
      )
    }
    if (error.response.status >= 500) {
      return 'The server had a problem with that. Try again in a moment.'
    }
  }
  return fallback
}
