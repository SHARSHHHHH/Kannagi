import { useEffect, useState } from 'react'
import { Heart, Loader2, PenLine } from 'lucide-react'
import { communityPosts, createPost, markHelpful } from '@/api/support'
import { messageFrom } from '@/api/client'
import { AnkletRule } from '@/components/brand/AnkletRule'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { CommunityPost } from '@/types'

const CATEGORIES = [
  { value: 'DOMESTIC', label: 'At home' },
  { value: 'WORKPLACE', label: 'At work' },
  { value: 'PUBLIC', label: 'In public' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'PSYCHOLOGICAL', label: 'Mental health' },
  { value: 'SUPPORT', label: 'Support' },
]

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('SUPPORT')
  const [notice, setNotice] = useState<{ text: string; reasons: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    communityPosts()
      .then((page) => setPosts(page.content))
      .catch((caught) => setError(messageFrom(caught, 'We could not load the community.')))
      .finally(() => setLoading(false))
  }, [])

  async function publish() {
    setError(null)
    setSaving(true)
    try {
      const result = await createPost({ title, content, category, anonymous: true })
      setNotice({ text: result.notice, reasons: result.moderationReasons })
      setTitle('')
      setContent('')
      setWriting(false)
    } catch (caught) {
      setError(messageFrom(caught, 'We could not save your post.'))
    } finally {
      setSaving(false)
    }
  }

  async function helpful(postId: string) {
    const updated = await markHelpful(postId)
    setPosts((current) => current.map((post) => (post.id === postId ? updated : post)))
  }

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md font-semibold text-dusk-900">Community</h1>
          <p className="mt-2 text-mist-600">
            What other women found useful. Everything here is anonymous and read by a
            moderator before it appears.
          </p>
        </div>
        <Button size="sm" onClick={() => setWriting((open) => !open)}>
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Share something
        </Button>
      </div>

      <AnkletRule className="my-8" />

      {error && <Alert tone="safety" className="mb-4">{error}</Alert>}

      {notice && (
        <Alert tone="success" className="mb-4" title="Thank you for writing">
          {notice.text}
          {notice.reasons.length > 0 && (
            <ul className="mt-2 space-y-1">
              {notice.reasons.map((reason) => (
                <li key={reason}>· {reason}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {writing && (
        <div className="mb-8 space-y-4 rounded-2xl border border-ivory-200 bg-white p-6 shadow-card">
          <Input
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
          />
          <div>
            <label htmlFor="post-body" className="text-sm font-medium text-dusk-800">
              What happened, and what helped
            </label>
            <textarea
              id="post-body"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              maxLength={5000}
              className="mt-1.5 w-full resize-y rounded-xl border border-ivory-300 px-3.5 py-2.5 text-sm leading-relaxed"
            />
          </div>
          <Select
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={CATEGORIES}
          />
          <p className="rounded-xl bg-ivory-100 px-4 py-3 text-xs leading-relaxed text-mist-600">
            Please do not include phone numbers, addresses, or anyone's full name — yours or
            theirs. Posts that appear to contain them are held for a moderator.
          </p>
          <Button loading={saving} disabled={!title.trim() || !content.trim()} onClick={publish}>
            Post anonymously
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mist-500" aria-label="Loading" />
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl border border-ivory-200 bg-white p-6 shadow-card"
            >
              <p className="text-eyebrow font-semibold uppercase text-brass-600">
                {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
              </p>
              <h2 className="mt-2 font-display text-lg font-semibold text-dusk-800">
                {post.title}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mist-600">
                {post.content}
              </p>
              <button
                type="button"
                onClick={() => void helpful(post.id)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-ivory-300 px-3 py-1.5 text-sm text-dusk-700 transition-colors hover:border-dusk-300"
              >
                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                Helpful · {post.helpfulCount}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
