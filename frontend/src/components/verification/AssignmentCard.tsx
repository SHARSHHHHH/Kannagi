import { useState } from 'react'
import { Clock, Eye, EyeOff, MessageSquare, Phone, ThumbsDown, ThumbsUp } from 'lucide-react'
import { getCaseContact, respondToAssignment, sendCaseMessage } from '@/api/assignment'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { CaseAssignment, ContactInfo } from '@/types/verification'

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'past due'
  const hours = Math.round(diff / 3_600_000)
  return hours < 24 ? `${hours}h left` : `${Math.round(hours / 24)}d left`
}

export function AssignmentCard({
  assignment,
  accentClass,
  onChanged,
}: {
  assignment: CaseAssignment
  /** e.g. 'text-brass-600' for lawyers, 'text-jade-600' for therapists. */
  accentClass: string
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [loadingContact, setLoadingContact] = useState(false)

  async function respond(decision: 'ACCEPTED' | 'REJECTED') {
    setBusy(true)
    try {
      await respondToAssignment(assignment.id, decision)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function send() {
    if (!message.trim()) return
    setBusy(true)
    try {
      await sendCaseMessage(assignment.caseId, message.trim())
      setMessage('')
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  async function revealContact() {
    setLoadingContact(true)
    try {
      setContact(await getCaseContact(assignment.caseId))
    } finally {
      setLoadingContact(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ivory-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cn('font-mono text-sm font-semibold', accentClass)}>
            {assignment.caseReference ?? assignment.caseId.slice(0, 8)}
          </p>
          <p className="mt-1 text-sm font-medium text-dusk-900">
            {assignment.caseTitle ?? 'Untitled case'}
          </p>
          {assignment.caseConcernSummary && (
            <p className="mt-1 text-xs text-mist-600">{assignment.caseConcernSummary}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {assignment.caseAnonymous ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-100 px-2 py-1 text-mist-600">
              <EyeOff className="h-3 w-3" /> Anonymous
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-100 px-2 py-1 text-mist-600">
              <Eye className="h-3 w-3" /> Identified
            </span>
          )}
          <span className="rounded-full bg-ivory-100 px-2 py-1 text-mist-600">
            {assignment.assignmentType === 'LEGAL_AID' ? 'Legal aid' : assignment.assignmentType === 'PUBLIC' ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      {assignment.status === 'OFFERED' && (
        <>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-brass-700">
            <Clock className="h-3 w-3" /> {timeUntil(assignment.noticeDeadline)} to respond
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => respond('ACCEPTED')} loading={busy}
              className="bg-jade-600 text-white hover:bg-jade-700">
              <ThumbsUp className="h-3.5 w-3.5" /> Accept
            </Button>
            <Button size="sm" variant="secondary" onClick={() => respond('REJECTED')} loading={busy}>
              <ThumbsDown className="h-3.5 w-3.5" /> Decline
            </Button>
          </div>
        </>
      )}

      {assignment.status === 'ACCEPTED' && (
        <div className="mt-4 space-y-3 border-t border-ivory-100 pt-4">
          {assignment.caseAnonymous ? (
            <div>
              <button type="button" onClick={() => setShowMessage((s) => !s)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-dusk-700 hover:text-dusk-900">
                <MessageSquare className="h-3.5 w-3.5" />
                Message her through the case
              </button>
              {showMessage && (
                <div className="mt-2 space-y-2">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                    placeholder="Reaches her only through her case reference and key."
                    className="w-full resize-none rounded-lg border border-ivory-300 px-3 py-2 text-sm" />
                  <Button size="sm" onClick={send} loading={busy} disabled={!message.trim()}>
                    Send
                  </Button>
                  {sent && <p className="text-xs text-jade-700">Sent.</p>}
                </div>
              )}
            </div>
          ) : (
            <div>
              {!contact ? (
                <Button size="sm" variant="secondary" onClick={revealContact} loading={loadingContact}>
                  <Phone className="h-3.5 w-3.5" /> Show contact details
                </Button>
              ) : contact.shared ? (
                <div className="rounded-lg bg-ivory-50 px-3 py-2 text-sm">
                  <p className="font-medium text-dusk-900">{contact.displayName ?? 'Not provided'}</p>
                  <p className="text-mist-600">{contact.phone ?? 'No phone on file'}</p>
                </div>
              ) : (
                <p className="text-xs text-mist-600">{contact.note}</p>
              )}
            </div>
          )}
        </div>
      )}

      {(assignment.status === 'REJECTED' || assignment.status === 'EXPIRED') && (
        <p className="mt-3 text-xs text-mist-500">
          {assignment.status === 'EXPIRED' ? 'The notice period passed.' : 'You declined this request.'}
        </p>
      )}
    </div>
  )
}
