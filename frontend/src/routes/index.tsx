import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LandingPage } from '@/pages/LandingPage'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { PublicShell } from '@/layouts/PublicShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CaseDetailPage } from '@/pages/CaseDetailPage'
import { CasesPage } from '@/pages/CasesPage'
import { ResumeCasePage } from '@/pages/ResumeCasePage'
import { StartPage } from '@/pages/StartPage'
import { ChatPage } from '@/pages/ChatPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { DirectoryPage } from '@/pages/DirectoryPage'
import { LegalPage } from '@/pages/LegalPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminOverview } from '@/pages/admin/AdminOverview'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminProfessionals } from '@/pages/admin/AdminProfessionals'
import { AdminCases } from '@/pages/admin/AdminCases'
import { AdminResources } from '@/pages/admin/AdminResources'
import { AdminCommunity } from '@/pages/admin/AdminCommunity'
import { AdminSecurity } from '@/pages/admin/AdminSecurity'
import { AdminSystemHealth } from '@/pages/admin/AdminSystemHealth'
import { ProtectedRoute } from './ProtectedRoute'

function DashboardOrAdmin() {
  const { user } = useAuth()
  if (user?.role === 'ADMIN') return <Navigate to="/admin/overview" replace />
  return <DashboardPage />
}

/**
 * Routes are added as each phase lands. Phase 1 covers the public entry points
 * and the signed-in dashboard; /chat, /legal, /lawyers, /psychologists,
 * /community and /privacy arrive with their phases.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/resume" element={<ResumeCasePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardOrAdmin />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>
      </Route>

      <Route element={<PublicShell />}>
        <Route path="/start" element={<StartPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/lawyers" element={<DirectoryPage kind="LAWYER" />} />
        <Route path="/psychologists" element={<DirectoryPage kind="PSYCHOLOGIST" />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute allow={['ADMIN']} />}>
        <Route element={<AdminDashboard />}>
          <Route path="/admin/overview" element={<AdminOverview />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/professionals" element={<AdminProfessionals />} />
          <Route path="/admin/cases" element={<AdminCases />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/community" element={<AdminCommunity />} />
          <Route path="/admin/security" element={<AdminSecurity />} />
          <Route path="/admin/system-health" element={<AdminSystemHealth />} />
        </Route>
      </Route>

    </Routes>
  )
}
