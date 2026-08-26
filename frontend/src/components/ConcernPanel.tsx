import { AlertTriangle, Info } from 'lucide-react'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { cn } from '@/utils/cn'
import type { AIAnalysis, ConcernLevel } from '@/types'

const LEVEL_STYLE: Record<ConcernLevel, { label: string; className: string }> = {
  LOW: { label: 'Low signal', className: 'bg-ivory-200 text-dusk-800 border border-ivory-300' },
  MODERATE: { label: 'Moderate signal', className: 'bg-brass-100 text-brass-700 border border-brass-300' },
  HIGH: { label: 'High signal', className: 'bg-dusk-800 text-ivory-50 border border-dusk-700' },
  IMMEDIATE_SAFETY_CONCERN: {
    label: 'Immediate safety concern',
    className: 'bg-wine-700 text-white border border-wine-600',
  },
}

export function ConcernPanel({ analysis }: { analysis: AIAnalysis }) {
  const unsafe = analysis.safetyLevel === 'HIGH'

  return (
    <section className="rounded-2xl border border-ivory-200 bg-white p-6 sm:p-8 shadow-card">
      {unsafe && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-wine-300 bg-wine-50 p-4 text-sm leading-relaxed text-wine-900 shadow-sm"
        >
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-wine-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-wine-900">Immediate Safety Alert</p>
              <p className="mt-1">
                Some of what you wrote suggests you may not be physically safe right now. If you are in immediate danger, reaching local emergency services or someone who can respond quickly is critical.
              </p>
              <p className="mt-1.5 font-medium text-wine-800">
                Nothing has been reported to any authority. This platform never acts without your explicit instruction.
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="font-display text-xl font-semibold text-dusk-900">Identified Concern Areas</h2>
      <p className="mt-1 text-sm text-mist-600 leading-relaxed">
        This is a transparent analysis derived from your description, not a diagnostic decision. You remain the sole authority on your experience.
      </p>

      <AnkletRule className="my-5 max-w-sm" />

      {analysis.categories.length === 0 ? (
        <p className="text-sm text-mist-600">
          No specific legal or safety categories were detected yet. You can keep writing whenever you are ready.
        </p>
      ) : (
        <ul className="space-y-4">
          {analysis.categories.map((finding) => (
            <li key={finding.category} className="rounded-xl border border-ivory-200 bg-ivory-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-dusk-900">
                  {finding.label}
                </h3>
                <span
                  className={cn(
                    'rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                    LEVEL_STYLE[finding.level].className,
                  )}
                >
                  {LEVEL_STYLE[finding.level].label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mist-600">{finding.reason}</p>
            </li>
          ))}
        </ul>
      )}

      {analysis.distressIndicators.length > 0 && (
        <div className="mt-6 rounded-xl border border-brass-200/60 bg-brass-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brass-700">Distress Indicators Surfaced</p>
          <p className="mt-1.5 text-sm leading-relaxed text-dusk-900">
            {analysis.distressIndicators.join(', ')}. These indicators reflect common emotional strain under prolonged pressure and are not a psychiatric assessment.
          </p>
        </div>
      )}

      {analysis.followUpQuestions.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-dusk-700">Recommended questions to consider</p>
          <ul className="mt-2.5 space-y-2">
            {analysis.followUpQuestions.map((question) => (
              <li key={question} className="flex gap-2.5 text-sm text-mist-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 flex gap-2 border-t border-ivory-200 pt-4 text-xs leading-relaxed text-mist-600">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-600" aria-hidden="true" />
        <span>{analysis.disclaimer}</span>
      </p>
    </section>
  )
}
