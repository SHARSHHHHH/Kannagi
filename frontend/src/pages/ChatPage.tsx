import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Keyboard, Mic, Send, ShieldCheck } from 'lucide-react'
import { chat, searchLegal } from '@/api/support'
import { messageFrom } from '@/api/client'
import { ConcernPanel } from '@/components/ConcernPanel'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { LANGUAGES } from '@/utils/languages'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'
import type { AIAnalysis, LanguageCode, LegalResource } from '@/types'

interface Turn {
  id: string
  from: 'you' | 'assistant'
  text: string
}

export function ChatPage() {
  const [params] = useSearchParams()
  const psychologicalMode = params.get('mode') === 'psychology'
  const startInVoice = params.get('mode') === 'voice'

  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const { language, setLanguage, t } = useLanguage()
  const [voiceMode, setVoiceMode] = useState(startInVoice)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [laws, setLaws] = useState<LegalResource[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns.length, analysis])

  async function submit(text: string) {
    if (!text.trim()) return

    setTurns((current) => [
      ...current,
      { id: crypto.randomUUID(), from: 'you', text: text.trim() },
    ])
    setDraft('')
    setSending(true)
    setError(null)

    try {
      const reply = await chat(text.trim(), language, psychologicalMode)
      setTurns((current) => [
        ...current,
        { id: crypto.randomUUID(), from: 'assistant', text: reply.reply },
      ])
      setAnalysis(reply.analysis)
      setSuggestions(reply.suggestedReplies)

      if (reply.analysis.categories.length > 0) {
        try {
          const legal = await searchLegal(text.trim(), language)
          setLaws(legal.resources.slice(0, 3))
        } catch {
          setLaws([])
        }
      }
    } catch (caught) {
      setError(messageFrom(caught, 'We could not get a reply just now. Please try again.'))
    } finally {
      setSending(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void submit(draft)
  }

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <header className="rounded-2xl border border-ivory-200 bg-white p-6 sm:p-8 shadow-card">
        <p className="text-eyebrow font-semibold uppercase tracking-wider text-brass-600">
          {psychologicalMode ? 'Emotional & Psychological Support' : 'Confidential Conversation'}
        </p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-dusk-900">
          {psychologicalMode ? 'Someone to talk to' : t('chat.heading')}
        </h1>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-mist-600">
          {psychologicalMode
            ? 'Automated supportive dialogue. This space provides emotional grounding and does not replace clinical therapy.'
            : t('chat.subtitle')}
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Select
          label={t('chat.language')}
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
          options={LANGUAGES.map((item) => ({
            value: item.code,
            label: item.code === 'en' ? item.native : `${item.native} · ${item.english}`,
          }))}
          className="w-48"
        />
        <Button variant="secondary" size="sm" onClick={() => setVoiceMode((on) => !on)}>
          {voiceMode ? (
            <>
              <Keyboard className="h-4 w-4" aria-hidden="true" /> {t('chat.typeInstead')}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" aria-hidden="true" /> {t('chat.speakInstead')}
            </>
          )}
        </Button>
      </div>

      <AnkletRule className="my-6" />

      {error && (
        <Alert tone="safety" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        {turns.length === 0 && !voiceMode && (
          <p className="rounded-2xl border border-dashed border-ivory-300 bg-white p-8 text-center text-sm leading-relaxed text-mist-600 shadow-sm">
            Start wherever feels safest. You can write in your own words, at your own pace.
          </p>
        )}

        {turns.map((turn) => (
          <div key={turn.id} className={cn('flex', turn.from === 'you' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm',
                turn.from === 'you'
                  ? 'bg-dusk-800 text-ivory-50 border border-dusk-700'
                  : 'border border-ivory-200 bg-white text-dusk-900',
              )}
            >
              {turn.text}
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      {voiceMode ? (
        <div className="mt-6">
          <VoiceRecorder
            language={language}
            onTranscript={(text) => {
              setVoiceMode(false)
              void submit(text)
            }}
          />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6">
          <div className="flex items-end gap-2 rounded-2xl border border-ivory-300 bg-white p-2.5 shadow-card focus-within:border-brass-500 focus-within:ring-1 focus-within:ring-brass-500 transition-all">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void submit(draft)
                }
              }}
              rows={2}
              placeholder={t('chat.placeholder')}
              aria-label="Your message"
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-dusk-900 placeholder:text-mist-500 focus:outline-none"
            />
            <Button type="submit" size="sm" loading={sending} disabled={!draft.trim()}>
              <Send className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void submit(suggestion)}
              className="rounded-full border border-ivory-300 bg-white px-4 py-2 text-xs font-medium text-dusk-800 transition-all hover:border-brass-400 hover:bg-ivory-50 shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {analysis && (
        <div className="mt-8 space-y-6">
          <ConcernPanel analysis={analysis} />

          {laws.length > 0 && (
            <section className="rounded-2xl border border-ivory-200 bg-white p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-jade-600" aria-hidden="true" />
                <h2 className="font-display text-xl font-semibold text-dusk-900">
                  Statutory Protections That May Apply
                </h2>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-mist-600">
                Retrieved directly from verified statutory references with verification dates.
              </p>

              <ul className="mt-5 space-y-5">
                {laws.map((law) => (
                  <li key={law.id} className="border-l-2 border-brass-400 pl-4 py-1">
                    <h3 className="font-display text-base font-semibold text-dusk-900">
                      {law.lawName}
                    </h3>
                    {law.section && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-brass-700">{law.section}</p>
                    )}
                    <p className="mt-1.5 text-sm leading-relaxed text-mist-600">
                      {law.plainLanguageExplanation}
                    </p>
                    <a
                      href={law.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2.5 inline-block text-xs font-semibold text-dusk-700 hover:text-brass-600 underline underline-offset-4"
                    >
                      {law.sourceName} · Verified{' '}
                      {new Date(law.lastVerifiedAt).toLocaleDateString()}
                    </a>
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-ivory-200 pt-4 text-xs leading-relaxed text-mist-600">
                This verified legal information is for awareness and does not replace formal legal counsel.
              </p>
            </section>
          )}

          <div className="flex flex-wrap gap-3">
            {analysis.supportTypes.includes('LEGAL') && (
              <Link to="/legal">
                <Button variant="secondary">Explore Legal Options</Button>
              </Link>
            )}
            {analysis.supportTypes.includes('PSYCHOLOGICAL') && (
              <Link to="/psychologists">
                <Button variant="secondary">Find Psychological Support</Button>
              </Link>
            )}
            <Link to="/start">
              <Button variant="secondary">Save as Private Case</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
