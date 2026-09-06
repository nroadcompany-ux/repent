import { ENABLED_REACTIONS, REACTION_LABELS } from '@/domain/product-lock'
import type { ReactionType } from '@/lib/supabase/database.types'
import { toggleReaction } from '../actions'

/**
 * Confession reactions — the canonical three (docs/04, AC-06):
 *   함께 기도해요 / 은혜받았어요 / 마음이 닿았어요
 *
 * Rules held here:
 *   · 1 user : 1 reaction per post, changeable — picking a second one replaces
 *     the first; picking the same one again clears it. The composite primary
 *     key on confession_reactions enforces the same thing in the database.
 *   · Counts are shown per reaction, never summed into a rank and never used
 *     to order the feed (docs/04, docs/08 forbid 인기순 / TOP / 영적 Ranking).
 *   · A count is a count of people, not a measure of the writer's faith.
 */
export function ReactionBar({
  postId,
  counts,
  mine,
  returnTo,
}: {
  postId: string
  /** reaction type -> number of members who chose it */
  counts: Map<ReactionType, number>
  /** the reaction this member currently has on this post, if any */
  mine: ReactionType | null
  returnTo: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ENABLED_REACTIONS.map((type) => {
        const selected = mine === type
        const count = counts.get(type) ?? 0
        return (
          <form key={type} action={toggleReaction}>
            <input type="hidden" name="post_id" value={postId} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="return_to" value={returnTo} />
            <button
              type="submit"
              aria-pressed={selected}
              className={`text-caption inline-flex items-center gap-[6px] rounded-chip px-3 py-[7px] font-medium transition-colors ${
                selected
                  ? 'bg-accent text-white'
                  : 'border border-line bg-surface text-ink-muted'
              }`}
            >
              <span>{REACTION_LABELS[type]}</span>
              {count > 0 ? (
                <span className={selected ? 'text-white/80' : 'text-ink-faint'}>{count}</span>
              ) : null}
            </button>
          </form>
        )
      })}
    </div>
  )
}

/** Groups reaction rows into per-type counts plus this member's own choice. */
export function tallyReactions(
  rows: ReadonlyArray<{ post_id: string; user_id: string; type: ReactionType }>,
  userId: string,
) {
  const counts = new Map<string, Map<ReactionType, number>>()
  const mine = new Map<string, ReactionType>()

  for (const row of rows) {
    const perPost = counts.get(row.post_id) ?? new Map<ReactionType, number>()
    perPost.set(row.type, (perPost.get(row.type) ?? 0) + 1)
    counts.set(row.post_id, perPost)
    if (row.user_id === userId) mine.set(row.post_id, row.type)
  }

  return { counts, mine }
}
