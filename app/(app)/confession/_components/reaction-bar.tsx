import Link from 'next/link'

import { tallyReactions } from '@/domain/confession-reactions'
import {
  CONFESSION_VOTES,
  CONFESSION_VOTE_ICONS,
  CONFESSION_VOTE_LABELS,
  type ConfessionVote,
} from '@/domain/product-lock'
import { toggleSimpleReaction } from '../vote-actions'

export type VoteType = ConfessionVote

/** Re-exported so the feed and detail screens keep their existing import. */
export { tallyReactions }

/**
 * Owner simplified Confession feedback to 👍 / 👎 / 💬 + counts.
 * The vote set comes from the Product Lock so the bar and the contract cannot
 * drift apart; legacy reaction rows are ignored by tallyReactions below.
 */
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
  const buttons = CONFESSION_VOTES.map((type) => ({
    type,
    icon: CONFESSION_VOTE_ICONS[type],
    label: CONFESSION_VOTE_LABELS[type],
  }))

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
