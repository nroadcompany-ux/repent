/**
 * Confession vote tally.
 *
 * Owner decision 2026-09-06 replaced the three semantic reactions with
 * 좋아요 / 싫어요. Rows written under the old model are still in
 * confession_reactions and are never deleted or rewritten by this product —
 * they are simply not counted, so a member's past feedback stays in their
 * history while the feed shows only the current model.
 *
 * Extracted from the reaction bar so this rule is provable without rendering.
 */

import { CONFESSION_VOTES, type ConfessionVote } from './product-lock'

const LIVE_VOTES: ReadonlySet<string> = new Set(CONFESSION_VOTES)

export function isLiveVote(type: unknown): type is ConfessionVote {
  return typeof type === 'string' && LIVE_VOTES.has(type)
}

export type ReactionRow = { post_id: string; user_id: string; type: unknown }

export function tallyReactions(rows: ReadonlyArray<ReactionRow>, userId: string) {
  const counts = new Map<string, Map<ConfessionVote, number>>()
  const mine = new Map<string, ConfessionVote>()

  for (const row of rows) {
    // A superseded type is skipped, never coerced into a like or a dislike.
    if (!isLiveVote(row.type)) continue
    const vote = row.type
    const perPost = counts.get(row.post_id) ?? new Map<ConfessionVote, number>()
    perPost.set(vote, (perPost.get(vote) ?? 0) + 1)
    counts.set(row.post_id, perPost)
    if (row.user_id === userId) mine.set(row.post_id, vote)
  }

  return { counts, mine }
}
