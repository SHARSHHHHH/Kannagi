import { useEffect, useState, type FormEvent } from 'react'
import { ExternalLink, Loader2, Search, ShieldCheck } from 'lucide-react'
import { legalResources, searchLegal } from '@/api/support'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ConcernPanel } from '@/components/ConcernPanel'
import { useLanguage } from '@/hooks/useLanguage'
import type { AIAnalysis, LegalResource } from '@/types'

export function LegalPage() {
  const { language, t } = useLanguage()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [noMatchNote, setNoMatchNote] = useState<string | null>(null)
  const [resources, setResources] = useState<LegalResource[]>([])
  const [disclaimer, setDisclaimer] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    legalResources()
      .then((result) => {
        setResources(result.resources)
        setDisclaimer(result.disclaimer)
      })
      .catch((caught) => setError(messageFrom(caught, 'We could not load that just now.')))
      .finally(() => setLoading(false))
  }, [])

  async function runSearch(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    setError(null)
    try {
      const result = await searchLegal(query.trim(), language)
      setAnalysis(result.analysis)
      setResources(result.resources)
      setNoMatchNote(result.noMatchNote)
      setDisclaimer(result.disclaimer)
    } catch (caught) {
      setError(messageFrom(caught, 'We could not search just now.'))
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <h1 className="font-display text-display-md font-semibold text-dusk-900">
        {t('legal.heading')}
      </h1>
      <p className="mt-3 leading-relaxed text-mist-600">
        Everything below comes from a written source, with a link to it and the date someone
        last checked it. Nothing here is generated.
      </p>

      <AnkletRule className="my-8" />

      {/* Describe the situation; the classifier picks which verified rows to
          show. It never writes what they say. */}
      <form onSubmit={runSearch} className="mb-8">
        <label htmlFor="legal-query" className="text-sm font-medium text-dusk-800">
          {t('legal.searchLabel')}
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <textarea
            id="legal-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={3}
            placeholder="My manager keeps sending me inappropriate messages…"
            className="flex-1 resize-y rounded-xl border border-ivory-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-dusk-900 placeholder:text-mist-500"
          />
          <Button type="submit" loading={searching} disabled={!query.trim()} className="sm:self-end">
            <Search className="h-4 w-4" aria-hidden="true" />
            {t('legal.searchButton')}
          </Button>
        </div>
      </form>

      {analysis && (
        <div className="mb-8">
          <ConcernPanel analysis={analysis} />
        </div>
      )}

      {noMatchNote && (
        <Alert className="mb-6">{noMatchNote}</Alert>
      )}

      {error && <Alert tone="safety">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mist-500" aria-label="Loading" />
        </div>
      ) : (
        <div className="space-y-5">
          {resources.map((resource) => (
            <article
              key={resource.id}
              className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card"
            >
              <h2 className="font-display text-lg font-semibold text-dusk-800">
                {resource.lawName}
              </h2>
              {resource.section && (
                <p className="mt-0.5 text-sm text-brass-600">{resource.section}</p>
              )}

              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-medium text-dusk-800">{t('legal.whatItMeans')}</p>
                  <p className="mt-1 text-mist-600">{resource.plainLanguageExplanation}</p>
                </div>

                {resource.whatItMayCover && (
                  <div>
                    <p className="font-medium text-dusk-800">{t('legal.whatItCovers')}</p>
                    <p className="mt-1 text-mist-600">{resource.whatItMayCover}</p>
                  </div>
                )}

                {resource.possibleNextSteps && (
                  <div>
                    <p className="font-medium text-dusk-800">{t('legal.nextSteps')}</p>
                    <p className="mt-1 text-mist-600">{resource.possibleNextSteps}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-ivory-200 pt-4 text-xs text-mist-600">
                <a
                  href={resource.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-medium text-dusk-600 hover:text-dusk-800"
                >
                  {resource.sourceName}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <p className="mt-1">
                  {t('legal.lastChecked')} {new Date(resource.lastVerifiedAt).toLocaleDateString()} ·{' '}
                  {resource.verifiedBy}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-8 flex gap-2 rounded-xl bg-ivory-200 px-4 py-3 text-sm leading-relaxed text-dusk-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {disclaimer}
      </p>
    </div>
  )
}
