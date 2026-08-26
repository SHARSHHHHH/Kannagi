import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '@/api/auth'
import { clearTokens, getRefreshToken, setTokens } from '@/api/client'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, captchaToken?: string) => Promise<void>
  signUp: (payload: authApi.RegisterPayload) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore the session on load. A stored token may have expired while the tab
  // was closed, so a failure here is normal and just means "not signed in".
  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (!getRefreshToken()) {
        setLoading(false)
        return
      }
      try {
        const current = await authApi.me()
        if (!cancelled) setUser(current)
      } catch {
        clearTokens()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  // The API client raises this when a refresh fails mid-session.
  useEffect(() => {
    function onExpired() {
      setUser(null)
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const signIn = useCallback(async (email: string, password: string, captchaToken?: string) => {
    const result = await authApi.login(email, password, captchaToken)
    setTokens(result.accessToken, result.refreshToken)
    setUser(result.user)
  }, [])

  const signUp = useCallback(async (payload: authApi.RegisterPayload) => {
    const result = await authApi.register(payload)
    setTokens(result.accessToken, result.refreshToken)
    setUser(result.user)
  }, [])

  const signOut = useCallback(async () => {
    const token = getRefreshToken()
    if (token) {
      try {
        await authApi.logout(token)
      } catch {
        // Signing out locally matters more than the server acknowledging it.
      }
    }
    clearTokens()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    setUser(await authApi.me())
  }, [])

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, refreshUser }),
    [user, loading, signIn, signUp, signOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
