import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Briefcase, Languages, Lock, MessageCircle,
  Mic, Scale, ShieldCheck, Users, ArrowRight, CheckCircle2, Menu, X,
  Shield, Heart, FileText, AlertTriangle, Search, HandHelping, EyeOff,
} from 'lucide-react'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { GovStrip } from '@/components/brand/GovStrip'
import { Wordmark } from '@/components/brand/Wordmark'
import { QuickExit } from '@/components/QuickExit'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { UrgentHelpBanner } from '@/components/UrgentHelpBanner'
import { PublicFooter } from '@/components/PublicFooter'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/Button'
import { LANGUAGES } from '@/utils/languages'
import { cn } from '@/utils/cn'
import type { TranslationKey } from '@/i18n/translations'

const SUPPORT_CATEGORIES = [
  {
    icon: Shield,
    title: 'Safety & Protection',
    body: 'Understanding protection orders, safe housing options, and emergency planning.',
    to: '/start',
  },
  {
    icon: AlertTriangle,
    title: 'Domestic Violence',
    body: 'Support for physical, emotional, or financial abuse within the home or family.',
    to: '/start',
  },
  {
    icon: Users,
    title: 'Harassment',
    body: 'Stalking, public harassment, online abuse, or unwanted contact.',
    to: '/start',
  },
  {
    icon: Briefcase,
    title: 'Workplace Issues',
    body: 'Sexual harassment at work, unequal treatment, or unpaid and unrecognised work.',
    to: '/start',
  },
  {
    icon: Scale,
    title: 'Legal Support',
    body: 'Know your rights under Indian law. Search verified legal resources and find counsel.',
    to: '/legal',
  },
  {
    icon: Heart,
    title: 'Emotional Support',
    body: 'Connect with qualified psychologists for confidential mental health support.',
    to: '/psychologists',
  },
]

const STEPS = [
  {
    icon: MessageCircle,
    title: '1. Describe it in your words',
    body: 'Type or speak in your own language. Take as long as you need. Nothing is submitted anywhere while you write.',
  },
  {
    icon: Scale,
    title: '2. Understand what applies',
    body: 'See possible concern areas and legal protections drawn directly from verified statutory sources—never generic predictions.',
  },
  {
    icon: Lock,
    title: '3. Decide what happens next',
    body: 'Connect with legal aid, private counsel, or psychological support—or simply hold your case privately. You retain complete choice.',
  },
]

const TRUST = [
  'Encrypted before storage',
  'Anonymous mode available',
  'No account needed',
  'Verified legal sources',
]

const STATS = [
  { value: '24×7', label: 'Available whenever you need to speak' },
  { value: '6', label: 'Languages with full native script' },
  { value: '3', label: 'Privacy modes — you decide how much is linked' },
  { value: 'AES-256', label: 'Encryption before anything is stored' },
]

const LANDING_NAV: { to: string; key: TranslationKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/start', key: 'nav.getSupport' },
  { to: '/legal', key: 'nav.legal' },
  { to: '/community', key: 'nav.community' },
]

export function LandingPage() {
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ivory-50 text-dusk-900 selection:bg-brass-200">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <GovStrip />
      <section className="relative overflow-hidden bg-dusk-950 text-ivory-50 shadow-lift">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(190,155,75,0.25), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 100%, rgba(43,58,103,0.6), transparent 75%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-lg p-2 text-ivory-300 hover:bg-dusk-800 lg:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Wordmark tone="light" />
            </div>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {LANDING_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                      isActive
                        ? 'bg-ivory-100/15 text-ivory-50'
                        : 'text-ivory-300 hover:bg-dusk-800 hover:text-ivory-100',
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden text-xs font-semibold uppercase tracking-wider text-ivory-300 transition-colors hover:text-brass-300 sm:block"
              >
                {t('nav.signIn')}
              </Link>
              <LanguageSwitcher tone="dark" />
              <QuickExit tone="dark" />
            </div>
          </header>

          {mobileMenuOpen && (
            <nav className="border-t border-dusk-800 pb-4 lg:hidden animate-rise" aria-label="Mobile navigation">
              <div className="flex flex-col gap-1 pt-2">
                {LANDING_NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-dusk-800 text-ivory-50 font-semibold'
                          : 'text-ivory-200 hover:bg-dusk-800/60',
                      )
                    }
                  >
                    {t(item.key)}
                  </NavLink>
                ))}
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-ivory-200 hover:bg-dusk-800/60"
                >
                  {t('nav.signIn')}
                </Link>
              </div>
            </nav>
          )}

          <div className="max-w-3xl py-12 sm:py-20">
            <p className="text-eyebrow font-semibold uppercase tracking-widest text-brass-400">
              {t('landing.eyebrow')}
            </p>

            <h1 className="mt-5 font-display text-display-lg font-semibold text-balance text-white leading-tight">
              {t('landing.hero')}
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-ivory-200/90 font-sans">
              {t('landing.subHero')}
            </p>

            <AnkletRule tone="dark" className="my-8 max-w-xs" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/start">
                <Button size="lg" variant="onDark" className="w-full sm:w-auto font-semibold">
                  <span>{t('landing.talkAnonymously')}</span>
                  <ArrowRight className="h-4 w-4 ml-1 text-dusk-800" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full border border-ivory-300/30 bg-dusk-900/80 text-ivory-100 hover:border-brass-400/50 hover:bg-dusk-800 sm:w-auto"
                >
                  {t('landing.createAccount')}
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-ivory-300/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-jade-400" aria-hidden="true" />
                {t('landing.noAccountNeeded')}
              </span>
              <span>•</span>
              <span>
                {t('landing.hasCase')}{' '}
                <Link to="/resume" className="text-brass-300 underline underline-offset-4 hover:text-brass-200">
                  {t('landing.enterReference')}
                </Link>
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {TRUST.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ivory-300/15 bg-dusk-900/60 px-3 py-1 text-[11px] font-medium text-ivory-200"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-jade-400" aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Urgent help ────────────────────────────────────────── */}
      <UrgentHelpBanner />

      {/* ── Trust band ─────────────────────────────────────────── */}
      <section className="border-b border-ivory-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
              <span className="font-display text-2xl font-semibold text-dusk-900 sm:text-3xl">
                {value}
              </span>
              <span className="max-w-[13rem] text-xs leading-relaxed text-mist-600">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── What do you need help with? ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-xl">
          <p className="text-eyebrow font-semibold uppercase text-brass-600">Support & Guidance</p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-dusk-900">
            What do you need help with?
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-mist-600">
            You do not need legal terms or proof. Select a category to get started, or describe your situation in your own words.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_CATEGORIES.map(({ icon: Icon, title, body, to }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-2xl border border-ivory-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brass-300/60 hover:shadow-lift"
            >
              <div className="inline-flex items-center justify-center rounded-xl bg-ivory-100 p-3 text-dusk-700 transition-colors group-hover:bg-dusk-800 group-hover:text-brass-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-dusk-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-600">{body}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-dusk-700 group-hover:text-brass-600">
                <span>Explore</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-y border-ivory-200 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-xl">
            <p className="text-eyebrow font-semibold uppercase text-brass-600">Autonomy & Process</p>
            <h2 className="mt-2 font-display text-display-md font-semibold text-dusk-900">
              How Kannagi works
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col justify-between rounded-2xl border border-ivory-200 bg-ivory-50/50 p-7 shadow-card"
              >
                <div>
                  <div className="inline-flex items-center justify-center rounded-xl bg-dusk-800 p-3 text-brass-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-dusk-900">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mist-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Talk anonymously ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-ivory-200 bg-white shadow-card sm:grid sm:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="text-eyebrow font-semibold uppercase text-brass-600">Anonymous Support</p>
            <h2 className="mt-3 font-display text-display-md font-semibold text-balance text-dusk-900">
              Talk anonymously. No account required.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-mist-600">
              You can explore support without sharing your identity. Choose a privacy mode when you start — anonymous, confidential, or identified. You are always in control of what is shared and with whom.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/start">
                <Button size="lg" className="font-semibold shadow-lift">
                  <span>{t('landing.talkAnonymously')}</span>
                  <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 bg-ivory-50/60 p-8 sm:p-10 border-t border-ivory-200 sm:border-t-0 sm:border-l">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-jade-50 p-2 text-jade-600">
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dusk-900">Anonymous mode</p>
                <p className="text-xs text-mist-600">No name, phone, or account required. Your case is never linked to you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-jade-50 p-2 text-jade-600">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dusk-900">Encrypted before storage</p>
                <p className="text-xs text-mist-600">Your descriptions are encrypted with AES-256-GCM before anything is written.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-jade-50 p-2 text-jade-600">
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dusk-900">Nothing shared without consent</p>
                <p className="text-xs text-mist-600">No data is reported to authorities or third parties on your behalf.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Language & Security ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-ivory-200 bg-white p-8 shadow-card">
            <div>
              <div className="inline-flex items-center justify-center rounded-xl bg-jade-50 p-3 text-jade-600">
                <Languages className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-dusk-900">
                Speak in your own language
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-600">
                Type or speak using your microphone. Our platform supports six major regional languages with full native script support.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {LANGUAGES.map((language) => (
                  <span
                    key={language.code}
                    className="rounded-lg border border-ivory-200 bg-ivory-50 px-3 py-1 text-xs font-semibold text-dusk-800"
                  >
                    {language.native}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 border-t border-ivory-200 pt-4 text-xs font-medium text-mist-600">
              <Mic className="h-4 w-4 text-jade-600" aria-hidden="true" />
              <span>You always review and confirm transcripts before processing.</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-dusk-800 bg-dusk-900 p-8 text-ivory-100 shadow-lift">
            <div>
              <div className="inline-flex items-center justify-center rounded-xl bg-dusk-800 p-3 text-brass-400">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-white">
                Your privacy, your control
              </h3>
              <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-ivory-200/90">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-brass-400 shrink-0" aria-hidden="true" />
                  <span>AES-256-GCM encryption before anything is stored.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-brass-400 shrink-0" aria-hidden="true" />
                  <span>Anonymous mode never links any account, identity or IP address.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-brass-400 shrink-0" aria-hidden="true" />
                  <span>Nothing is ever reported to authorities or third parties on your behalf.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-brass-400 shrink-0" aria-hidden="true" />
                  <span>You choose what to share, with whom, and can withdraw consent anytime.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-dusk-800 pt-4">
              <Link to="/privacy" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brass-400 hover:text-brass-300">
                <span>Read our full privacy charter</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Legal information preview ───────────────────────── */}
      <section className="border-y border-ivory-200 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-eyebrow font-semibold uppercase text-brass-600">Know Your Rights</p>
              <h2 className="mt-3 font-display text-display-md font-semibold text-balance text-dusk-900">
                Verified legal information, explained plainly
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-mist-600">
                Every legal resource on Kannagi is sourced from verified statutory references — never generated by AI. Understand what protections may apply to your situation, what they cover, and what steps you can take next.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/legal">
                  <Button size="lg" className="font-semibold shadow-lift">
                    <Scale className="h-4 w-4" aria-hidden="true" />
                    <span>Explore legal rights</span>
                    <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-ivory-200 bg-ivory-50/60 p-8 shadow-card">
              <div className="space-y-5">
                {[
                  {
                    icon: Scale,
                    title: 'Know your rights',
                    desc: 'Plain-language explanations of applicable laws and protections.',
                  },
                  {
                    icon: FileText,
                    title: 'Verified sources',
                    desc: 'Every resource links to its original statutory or legal reference.',
                  },
                  {
                    icon: Search,
                    title: 'Search by situation',
                    desc: 'Describe what is happening and find relevant legal protections.',
                  },
                  {
                    icon: HandHelping,
                    title: 'Find support',
                    desc: 'Connect with legal aid, private counsel, or psychological support.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-dusk-800 p-2 text-brass-400">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dusk-900">{title}</p>
                      <p className="text-xs text-mist-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ────────────────────────────────────────────── */}
      <section className="border-t border-ivory-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-display-md font-semibold text-balance text-dusk-900">
            You can start whenever you are ready.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-mist-600 leading-relaxed">
            There is no sign-up requirement, no time limit, and nothing you have to justify.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/start">
              <Button size="lg" className="font-semibold shadow-lift">
                Talk anonymously
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <PublicFooter />
    </div>
  )
}
