import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, FolderOpen, BookOpen, MessageSquare, Shield, Activity, ShieldQuestion, AlertTriangle, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/utils/cn'

const SIDEBAR_NAV = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/professionals', label: 'Professionals', icon: Briefcase },
  { to: '/admin/professional-verification', label: 'Verification Queue', icon: ShieldQuestion },
  { to: '/admin/escalated-cases', label: 'Escalated Cases', icon: AlertTriangle },
  { to: '/admin/cases', label: 'Cases', icon: FolderOpen },
  { to: '/admin/resources', label: 'Resources', icon: BookOpen },
  { to: '/admin/community', label: 'Community', icon: MessageSquare },
  { to: '/admin/security', label: 'Security', icon: Shield },
  { to: '/admin/system-health', label: 'System Health', icon: Activity },
]

interface AdminSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function AdminSidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: AdminSidebarProps) {
  const location = useLocation()

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-ivory-50 shadow-lift transition-all duration-300',
        'lg:relative lg:z-auto lg:flex-shrink-0',
        collapsed ? 'lg:w-[4.5rem]' : 'lg:w-64',
        'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
      aria-label="Admin sidebar navigation"
    >
      <div className="flex items-center justify-between border-b border-ivory-200/80 p-4">
        {!collapsed && (
          <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-dusk-700">
            Kannagi Admin
          </h2>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-dusk-500 hover:bg-ivory-200 hover:text-dusk-700 lg:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-dusk-500 hover:bg-ivory-200 hover:text-dusk-700 lg:hidden"
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2" aria-label="Admin navigation">
        {SIDEBAR_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={cn(
              'mx-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isActive(item.to)
                ? 'bg-dusk-800 text-ivory-50 font-semibold shadow-sm'
                : 'text-dusk-700 hover:bg-ivory-200 hover:text-dusk-900',
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ivory-200/80 p-4 mt-auto">
        <button
          type="button"
          className="w-full rounded-xl px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-dusk-600 transition-colors hover:bg-ivory-200 hover:text-dusk-900"
          aria-label="View admin profile"
        >
          {collapsed ? '•••' : 'Profile'}
        </button>
      </div>
    </aside>
  )
}
