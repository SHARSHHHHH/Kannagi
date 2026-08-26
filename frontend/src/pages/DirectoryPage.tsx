import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, MapPin, Star } from 'lucide-react'
import { lawyers, psychologists } from '@/api/support'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Select } from '@/components/ui/Select'
import { LANGUAGES } from '@/utils/languages'
import { BookingDialog } from '@/components/BookingDialog'
import { Button } from '@/components/ui/Button'
import type { Professional } from '@/types'

const STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana', 'Maharashtra', 'Delhi', 'Gujarat',
]

/**
 * One component serves both directories.
 *
 * For lawyers, the legal-aid answer chosen on the case decides which set is
 * shown — the two are never merged into one list, because the difference
 * between free and paid is the whole reason the fork exists.
 */
export function DirectoryPage({ kind }: { kind: 'LAWYER' | 'PSYCHOLOGIST' }) {
  const [params] = useSearchParams()
  const legalAidOnly = params.get('pathway') === 'LEGAL_AID'

  const [results, setResults] = useState<Professional[]>([])
  const [notice, setNotice] = useState('')
  const [state, setState] = useState('')
  const [language, setLanguage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<Professional | null>(null)

  useEffect(() => {
    setLoading(true)
    const filters = {
      state: state || undefined,
      language: language || undefined,
      ...(kind === 'LAWYER' && legalAidOnly ? { legalAid: true } : {}),
    }

    const request = kind === 'LAWYER' ? lawyers(filters) : psychologists(filters)

    request
      .then((result) => {
        setResults(result.professionals)
        setNotice(result.notice)
      })
      .catch((caught) => setError(messageFrom(caught, 'We could not load the directory.')))
      .finally(() => setLoading(false))
  }, [kind, state, language, legalAidOnly])

  const heading = kind === 'LAWYER'
    ? legalAidOnly ? 'Lawyers who take legal-aid cases' : 'Find legal support'
    : 'Find psychological support'

  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <h1 className="font-display text-display-md font-semibold text-dusk-900">{heading}</h1>

      {kind === 'LAWYER' && legalAidOnly && (
        <p className="mt-3 leading-relaxed text-mist-600">
          These practitioners take referrals through legal aid. Whether you qualify is
          decided by a District Legal Services Authority, not by us — the legal information
          page explains where to ask.
        </p>
      )}

      <AnkletRule className="my-8 max-w-sm" />

      <div className="flex flex-wrap gap-4">
        <Select
          label="State"
          value={state}
          onChange={(event) => setState(event.target.value)}
          options={STATES.map((item) => ({ value: item, label: item }))}
          placeholder="Anywhere"
          className="w-56"
        />
        <Select
          label="Language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          options={LANGUAGES.map((item) => ({ value: item.code, label: item.native }))}
          placeholder="Any language"
          className="w-56"
        />
      </div>

      {error && <Alert tone="safety" className="mt-6">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mist-500" aria-label="Loading" />
        </div>
      ) : results.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-ivory-300 px-6 py-12 text-center text-sm text-mist-600">
          Nobody matches those filters. Try widening them.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {results.map((person) => (
            <li
              key={person.id}
              className="rounded-2xl border border-ivory-200 bg-white p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-dusk-800">
                  {person.fullName}
                </h2>
                {person.demo && (
                  <span className="shrink-0 rounded-md bg-brass-200 px-2 py-0.5 text-xs font-semibold text-dusk-800">
                    DEMO PROFILE
                  </span>
                )}
              </div>

              {person.qualification && (
                <p className="mt-1 text-sm text-mist-600">{person.qualification}</p>
              )}

              <p className="mt-3 text-sm text-dusk-700">
                {kind === 'LAWYER' ? person.practiceAreas : person.specialisations}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-600">
                {person.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {person.city}, {person.state}
                  </span>
                )}
                {person.rating && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-brass-500 text-brass-500" aria-hidden="true" />
                    {person.rating} ({person.reviewCount})
                  </span>
                )}
                <span>{person.yearsExperience} years</span>
              </div>

              <p className="mt-2 text-xs text-mist-600">
                {person.languages
                  .split(',')
                  .map((code) => LANGUAGES.find((l) => l.code === code.trim())?.native ?? code)
                  .join(' · ')}
              </p>

              {person.consultationFeeInfo && (
                <p className="mt-3 rounded-lg bg-ivory-100 px-3 py-2 text-xs text-dusk-700">
                  {person.consultationFeeInfo}
                </p>
              )}

              <Button size="sm" className="mt-4 w-full" onClick={() => setBooking(person)}>
                Contact anonymously
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 rounded-xl bg-ivory-200 px-4 py-3 text-sm leading-relaxed text-dusk-800">
        {notice}
      </p>

      {booking && (
        <BookingDialog professional={booking} onClose={() => setBooking(null)} />
      )}
    </div>
  )
}
