import Link from 'next/link'

import { toggleSimpleReaction } from '../vote-actions'

export type VoteType = 'like' | 'dislike'

/** Owner simplified Confession feedback to 👍 / 👎 / 💬 + counts. */
export function ReactionBar({
  postId,
  counts,
  mine,
  returnTo,
  commentCount = 0,
  commentHref,
}: {
  postId: string
  counts: Map<VoteType, number>
  mine: VoteType | null
  returnTo: string
  commentCount?: number
  commentHref?: string
}) {
  const buttons: Array<{ type: VoteType; icon: string; label: string }> = [
    { type: 'like', icon: '👍', label: '좋아요' },
    { type: 'dislike', icon: '👎', label: '싫어요' },
  ]

  return (
    <div className="flex items-center gap-2">
      {buttons.map(({ type, icon, label }) => {
        const selected = mine === type
        return (
          <form key={type} action={toggleSimpleReaction}>
            <input type="hidden" name="post_id" value={postId} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="return_to" value={returnTo} />
            <button
              type="submit"
              aria-label={label}
              aria-pressed={selected}
              className={`text-body-sm inline-flex min-h-9 items-center gap-1 rounded-chip px-3 font-medium ${
                selected ? 'bg-accent-tint text-accent' : 'text-ink-muted'
              }`}
            >
              <span aria-hidden="true">{icon}</span>
              <span>{counts.get(type) ?? 0}</span>
            </button>
          </form>
        )
      })}

      {commentHref ? (
        <Link
          href={commentHref}
          aria-label="댓글"
          className="text-body-sm inline-flex min-h-9 items-center gap-1 rounded-chip px-3 font-medium text-ink-muted"
        >
          <span aria-hidden="true">💬</span>
          <span>{commentCount}</span>
        </Link>
      ) : null}
    </div>
  )
}

export function tallyReactions(
  rows: ReadonlyArray<{ post_id: string; user_id: string; type: unknown }>,
  userId: string,
) {
  const counts = new Map<string, Map<VoteType, number>>()
  const mine = new Map<string, VoteType>()

  for (const row of rows) {
    const type = String(row.type)
    if (type !== 'like' && type !== 'dislike') continue
    const vote = type as VoteType
    const perPost = counts.get(row.post_id) ?? new Map<VoteType, number>()
    perPost.set(vote, (perPost.get(vote) ?? 0) + 1)
    counts.set(row.post_id, perPost)
    if (row.user_id === userId) mine.set(row.post_id, vote)
  }

  return { counts, mine }
}
