import { Link } from 'react-router-dom'
import {
  Brain, FolderOpen, Gavel, MessageCircle, Mic, Scale, ShieldCheck, Users, type LucideIcon,
  ArrowRight,
} from 'lucide-react'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'

interface Action {
  to: string
  icon: LucideIcon
  title: string
  body: string
  ready: boolean
}

const ACTIONS: Action[] = [
  {
    to: '/start',
    icon: MessageCircle,
    title: 'Talk to someone',
    body: 'Describe what you are experiencing in your own words and your own time.',
    ready: true,
  },
  {
    to: '/legal',
    icon: Scale,
    title: 'Understand my legal rights',
    body: 'See statutory protections explained plainly from verified legal sources.',
    ready: true,
  },
  {
    to: '/chat?mode=voice',
    icon: Mic,
    title: 'Speak instead of typing',
    body: 'Record in your own language. Review and confirm transcript before anything is processed.',
    ready: true,
  },
  {
    to: '/psychologists',
    icon: Brain,
    title: 'Find psychological support',
    body: 'Connect with qualified mental health professionals, completely anonymously if preferred.',
    ready: true,
  },
  {
    to: '/lawyers',
    icon: Gavel,
    title: 'Find legal counsel',
    body: 'Search free legal aid bodies or private counsel by area, language and district.',
    ready: true,
  },
  {
    to: '/community',
    icon: Users,
    title: 'Community space',
    body: 'Read verified experiences shared by other women and contribute safely.',
    ready: true,
  },
  {
    to: '/cases',
    icon: FolderOpen,
    title: 'Your confidential cases',
    body: 'Revisit saved cases, manage updates, or permanently remove your history.',
    ready: true,
  },
  {
    to: '/privacy',
    icon: ShieldCheck,
    title: 'Privacy & consent centre',
    body: 'Inspect stored data, audit logs, active encryption keys, and export or wipe records.',
    ready: true,
  },
]

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const name = user?.profile?.displayName

  return (
    <div className="animate-rise space-y-8">
      <header className="rounded-2xl border border-ivory-200 bg-white p-8 shadow-card">
        <p className="text-eyebrow font-semibold uppercase tracking-wider text-brass-600">
          {name ? `Welcome back, ${name}` : 'Confidential Session Active'}
        </p>

        <h1 className="mt-3 font-display text-display-md font-semibold text-balance text-dusk-900">
          {t('dashboard.heading')}
        </h1>
        <p className="mt-2 text-sm text-mist-600 max-w-2xl">
          Select an action below. Your choices remain private and under your explicit control at every step.
        </p>

        <AnkletRule className="my-6 max-w-xs" />
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map(({ to, icon: Icon, title, body, ready }) => {
          const content = (
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="inline-flex items-center justify-center rounded-xl bg-ivory-100 p-3 text-dusk-800 transition-colors group-hover:bg-dusk-800 group-hover:text-brass-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-dusk-900">{title}</h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-mist-600">{body}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-ivory-200 pt-3 text-xs font-semibold uppercase tracking-wider text-dusk-700 group-hover:text-brass-600">
                <span>{ready ? 'Open' : 'Upcoming'}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          )

          return ready ? (
            <Link
              key={title}
              to={to}
              className="group rounded-2xl border border-ivory-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brass-300/80 hover:shadow-lift"
            >
              {content}
            </Link>
          ) : (
            <div
              key={title}
              className="rounded-2xl border border-ivory-200 bg-white/60 p-6 opacity-60 shadow-card"
            >
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
