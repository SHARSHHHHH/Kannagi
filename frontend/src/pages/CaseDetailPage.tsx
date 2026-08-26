import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { addMessage, deleteCase, getCase } from '@/api/cases'
import { messageFrom } from '@/api/client'
import { AccessKeyNotice } from '@/components/AccessKeyNotice'
import { LegalPathwayChooser } from '@/components/LegalPathwayChooser'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { Case } from '@/types'

const MODE_LABEL: Record<Case['privacyMode'], string> = {
  ANONYMOUS: 'Anonymous',
  CONFIDENTIAL: 'Confidential',
  IDENTIFIED: 'Identified',
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const handoff = location.state as { accessKey?: string; notice?: string } | null

  const [caseDetail, setCaseDetail] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showKeyNotice, setShowKeyNotice] = useState(Boolean(handoff?.accessKey))

  const endOfMessages = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    getCase(id)
      .then((loaded) => {
        if (!cancelled) setCaseDetail(loaded)
      })
      .catch((caught) => {
        if (!cancelled) setError(messageFrom(caught, 'We could not open that case.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: 'smooth' })
  }, [caseDetail?.messages.length])

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!id || !draft.trim()) return

    setSending(true)
    setError(null)
    try {
      const message = await addMessage(id, draft.trim())
      setCaseDetail((current) =>
        current ? { ...current, messages: [...current.messages, message] } : current,
      )
      setDraft('')
    } catch (caught) {
      setError(messageFrom(caught, 'That message did not send. Try again.'))
    } finally {
      setSending(false)
    }
  }

  async function removeCase() {
    if (!id) return

    try {
      await deleteCase(id)
      navigate('/cases', { replace: true })
    } catch (caught) {
      setError(messageFrom(caught, 'We could not delete that case.'))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-mist-500" aria-label="Loading" />
      </div>
    )
  }

  if (!caseDetail) {
    return (
      <Alert tone="safety">
        {error ?? 'We could not open that case.'}
      </Alert>
    )
  }

  return (
    <>
      {showKeyNotice && handoff?.accessKey && (
        <AccessKeyNotice
          reference={caseDetail.reference}
          accessKey={handoff.accessKey}
          onAcknowledge={() => setShowKeyNotice(false)}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dusk-900/70 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-case-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift sm:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-wine-50 p-2.5 text-wine-700">
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="delete-case-title" className="font-display text-xl font-semibold text-dusk-900">
                  Delete this case?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mist-600">
                  The messages are cleared straight away and cannot be brought back. If you
                  are unsure, keep it — deleting is always available later.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="safety" loading={sending} onClick={removeCase}>
                Delete this case
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Keep it
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl animate-rise">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm font-semibold text-brass-600">
              {caseDetail.reference}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-dusk-900">
              {caseDetail.title ?? 'Your case'}
            </h1>
            <p className="mt-1 text-sm text-mist-600">
              {MODE_LABEL[caseDetail.privacyMode]} · started{' '}
              {new Date(caseDetail.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-mist-600 transition-colors hover:bg-ivory-200 hover:text-wine-700"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </button>
        </header>

        <AnkletRule className="my-6" />

        {error && (
          <Alert tone="safety" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-3">
          {caseDetail.messages.length === 0 && (
            <p className="rounded-2xl border border-dashed border-ivory-300 px-5 py-8 text-center text-sm text-mist-600">
              Nothing written yet. Start wherever feels easiest — it does not have to be
              the beginning.
            </p>
          )}

          {caseDetail.messages.map((message) => {
            if (message.senderType === 'SYSTEM') {
              return (
                <p key={message.id} className="py-1 text-center text-xs text-mist-600">
                  {message.content}
                </p>
              )
            }
            const fromUser = message.senderType === 'USER'
            return (
              <div key={message.id} className={cn('flex', fromUser ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                    fromUser
                      ? 'border border-dusk-700 bg-dusk-800 text-ivory-50'
                      : 'border border-ivory-200 bg-white text-dusk-900',
                  )}
                >
                  {message.content}
                </div>
              </div>
            )
          })}
          <div ref={endOfMessages} />
        </div>

        <form onSubmit={send} className="sticky bottom-4 mt-6">
          <div className="flex items-end gap-2 rounded-2xl border border-ivory-200 bg-white p-2 shadow-card">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send(event)
                }
              }}
              rows={2}
              placeholder="Write what happened, in your own words…"
              aria-label="Your message"
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-dusk-900 placeholder:text-mist-500 focus:outline-none"
            />
            <Button type="submit" size="sm" loading={sending} disabled={!draft.trim()}>
              <Send className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="mt-2 px-1 text-xs text-mist-600">
            Saved encrypted to your case. Not sent to any professional.
          </p>
        </form>

        {/* The legal fork appears once there is something to reason about, and
            only until she has chosen. */}
        {caseDetail.legalPathway === 'UNDECIDED' && caseDetail.messages.length > 0 && (
          <div className="mt-10">
            <LegalPathwayChooser caseId={caseDetail.id} onChosen={setCaseDetail} />
          </div>
        )}
      </div>
    </>
  )
}
