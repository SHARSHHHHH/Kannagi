import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Scale } from 'lucide-react'
import { setLegalPathway } from '@/api/cases'
import { messageFrom } from '@/api/client'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { Case, LegalPathway } from '@/types'

/**
 * The fork between free legal aid and a private lawyer.
 *
 * These are two different systems, not two filters on one list. Legal aid is
 * applied for through a statutory body and costs nothing; private counsel is
 * chosen and paid for directly. Collapsing them into a single directory would
 * bury the only route available to someone with no money.
 *
 * Neither is recommended and neither is preselected. The directory that follows
 * depends on which she picks.
 */
const OPTIONS: {
  pathway: LegalPathway
  icon: typeof Scale
  title: string
  body: string
  points: string[]
}[] = [
  {
    pathway: 'LEGAL_AID',
    icon: Building2,
    title: 'Free legal aid',
    body: 'Legal help provided at no cost through government legal services authorities.',
    points: [
      'You do not pay anything',
      'A lawyer is assigned rather than chosen',
      'Applied for through a legal services authority',
    ],
  },
  {
    pathway: 'PRIVATE_COUNSEL',
    icon: Scale,
    title: 'A private lawyer',
    body: 'You choose a lawyer yourself and pay their fee directly.',
    points: [
      'You choose who represents you',
      'Fees vary and are agreed with the lawyer',
      'Usually faster to arrange a first consultation',
    ],
  },
]

export function LegalPathwayChooser({
  caseId,
  onChosen,
}: {
  caseId: string
  onChosen: (updated: Case) => void
}) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<LegalPathway | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function confirm() {
    if (!selected) return
    setError(null)
    setSaving(true)
    try {
      const updated = await setLegalPathway(caseId, selected)
      onChosen(updated)

      if (selected === 'LEGAL_AID' || selected === 'PRIVATE_COUNSEL') {
        navigate(`/lawyers?caseId=${caseId}&pathway=${selected}`)
      }
    } catch (caught) {
      setError(messageFrom(caught, 'We could not save that choice. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold text-dusk-900">
        What kind of legal help do you want to look at?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-mist-600">
        These work differently, so we show you different options depending on your answer.
        You can come back and change this.
      </p>

      {error && (
        <Alert tone="safety" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup">
        {OPTIONS.map(({ pathway, icon: Icon, title, body, points }) => {
          const active = selected === pathway
          return (
            <button
              key={pathway}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(pathway)}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                active
                  ? 'border-dusk-500 ring-1 ring-dusk-500'
                  : 'border-ivory-200 hover:border-ivory-400',
              )}
            >
              <Icon
                className={cn('h-5 w-5', active ? 'text-dusk-600' : 'text-jade-500')}
                aria-hidden="true"
              />
              <h3 className="mt-3 font-display text-base font-semibold text-dusk-800">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{body}</p>
              <ul className="mt-3 space-y-1">
                {points.map((point) => (
                  <li key={point} className="flex gap-2 text-xs text-mist-600">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={confirm} disabled={!selected} loading={saving}>
          Show me these options
        </Button>
        <button
          type="button"
          onClick={() => setSelected('NOT_SEEKING_LEGAL')}
          className="text-sm text-mist-600 underline-offset-4 hover:text-dusk-700 hover:underline"
        >
          I do not want legal help right now
        </button>
      </div>

      <p className="mt-5 border-t border-ivory-200 pt-4 text-xs leading-relaxed text-mist-600">
        Eligibility rules for free legal aid differ by state and by situation. The legal aid
        page will show the current rules with their source and the date they were last
        checked, rather than telling you here whether you qualify.
      </p>
    </section>
  )
}
