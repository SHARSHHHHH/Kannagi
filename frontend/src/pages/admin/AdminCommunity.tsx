import { useState, useEffect } from 'react'
import { Search, MessageSquare, CheckCircle, Eye, EyeOff, Flag } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton'
import { ErrorState } from '@/components/admin/ErrorState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/Button'
import { fetchCommunityPosts, fetchModerationQueue, moderatePost, formatDate } from '@/services/admin/AdminDataService'
import type { CommunityPost } from '@/types'
import { cn } from '@/utils/cn'

type Tab = 'all' | 'moderation'

function modStatusBadge(status: string): string {
  const map: Record<string, string> = {
    APPROVED: 'bg-jade-100 text-jade-800',
    PENDING: 'bg-brass-100 text-brass-800',
    FLAGGED: 'bg-wine-100 text-wine-800',
    HIDDEN: 'bg-mist-100 text-mist-800',
  }
  return map[status] ?? 'bg-mist-100 text-mist-800'
}

export function AdminCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [moderationQueue, setModerationQueue] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [moderating, setModerating] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [postsPage, queue] = await Promise.all([
        fetchCommunityPosts(0, 200),
        fetchModerationQueue(),
      ])
      setPosts(postsPage.content)
      setModerationQueue(queue)
    } catch {
      setError('Failed to load community data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleModerate(postId: string, status: 'APPROVED' | 'HIDDEN') {
    setModerating(postId)
    try {
      const updated = await moderatePost(postId, status)
      if (updated) {
        setPosts(prev => prev.map(p => p.id === postId ? updated : p))
        setModerationQueue(prev => prev.filter(p => p.id !== postId))
      }
    } finally {
      setModerating(null)
    }
  }

  const displayPosts = tab === 'moderation' ? moderationQueue : posts
  const filtered = displayPosts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = posts.filter(p => p.moderationStatus === 'PENDING').length
  const flaggedCount = posts.filter(p => p.moderationStatus === 'FLAGGED').length
  const approvedCount = posts.filter(p => p.moderationStatus === 'APPROVED').length

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="pt-8">
      <PageHeader title="Community" description="Manage community posts and moderation" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={String(posts.length)} label="Total Posts" icon={<MessageSquare className="h-5 w-5 text-dusk-400" />} />
        <StatCard value={String(approvedCount)} label="Approved" icon={<CheckCircle className="h-5 w-5 text-jade-500" />} />
        <StatCard value={String(pendingCount)} label="Pending" icon={<Eye className="h-5 w-5 text-brass-500" />} />
        <StatCard value={String(flaggedCount)} label="Flagged" icon={<Flag className="h-5 w-5 text-wine-500" />} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-xl bg-ivory-100 p-1">
          <button
            onClick={() => setTab('all')}
            className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', tab === 'all' ? 'bg-white text-dusk-900 shadow-sm' : 'text-dusk-600 hover:text-dusk-900')}
          >
            All Posts ({posts.length})
          </button>
          <button
            onClick={() => setTab('moderation')}
            className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', tab === 'moderation' ? 'bg-white text-dusk-900 shadow-sm' : 'text-dusk-600 hover:text-dusk-900')}
          >
            Moderation Queue ({moderationQueue.length})
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-xl border border-ivory-200 bg-white py-2 pl-9 pr-4 text-sm text-dusk-900 placeholder:text-mist-400 focus:border-dusk-400 focus:outline-none focus:ring-1 focus:ring-dusk-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={tab === 'moderation' ? 'No posts in moderation queue' : 'No posts found'}
          description={tab === 'moderation' ? 'All posts have been reviewed.' : 'Try adjusting your search.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div key={post.id} className="rounded-2xl border border-ivory-200 bg-white p-5 shadow-card hover:shadow-lift transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-dusk-900">{post.title}</h3>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', modStatusBadge(post.moderationStatus))}>
                      {post.moderationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-mist-500 mb-2">{post.category} · {formatDate(post.createdAt)} · {post.helpfulCount} helpful</p>
                  <p className="text-sm text-dusk-700 line-clamp-2">{post.content}</p>
                </div>
                {tab === 'moderation' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={moderating === post.id}
                      onClick={() => handleModerate(post.id, 'APPROVED')}
                      aria-label="Approve post"
                    >
                      <CheckCircle className="h-4 w-4 text-jade-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={moderating === post.id}
                      onClick={() => handleModerate(post.id, 'HIDDEN')}
                      aria-label="Hide post"
                    >
                      <EyeOff className="h-4 w-4 text-wine-600" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
