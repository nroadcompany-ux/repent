'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ENABLED_REACTIONS } from '@/domain/product-lock'
import { requireUser } from '@/lib/supabase/server'
import type { ConfessionType, ReactionType, ShareSourceKind } from '@/lib/supabase/database.types'

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const TYPES: readonly ConfessionType[] = ['prayer', 'confession', 'grace', 'daily']
const SOURCE_KINDS: readonly ShareSourceKind[] = [
  'repentance',
  'prayer_record',
  'prayer_topic',
  'promise',
  'action_record',
]

/**
 * Confession writes.
 *
 * The ShareCopy rule (docs/05, docs/07, AC-08) is enforced here: publishing
 * composes a NEW row from the fields the member selected. It never links the
 * private original by foreign key, never copies fields the member did not tick,
 * and later edits to the original do not reach the published copy.
 */
export async function publishConfession(form: FormData) {
  const { supabase, userId } = await requireUser()

  const typeRaw = text(form, 'type')
  const type = (TYPES as readonly string[]).includes(typeRaw)
    ? (typeRaw as ConfessionType)
    : 'daily'
  const body = text(form, 'body')
  const photoPath = text(form, 'photo_path')
  const sourceKindRaw = text(form, 'source_kind')
  const sourceKind = (SOURCE_KINDS as readonly string[]).includes(sourceKindRaw)
    ? (sourceKindRaw as ShareSourceKind)
    : null
  const sourceId = text(form, 'source_id')

  if (!body) {
    const query = sourceKind ? `?source=${sourceKind}&sourceId=${sourceId}&error=empty` : '?error=empty'
    redirect(`/confession/write${query}`)
  }

  // The photo path must live under this member's own folder; storage RLS would
  // reject anything else, but rejecting it here keeps the row clean too.
  const safePhotoPath = photoPath.startsWith(`${userId}/`) ? photoPath : null

  const { data, error } = await supabase
    .from('confession_posts')
    .insert({
      user_id: userId,
      type,
      body,
      photo_path: safePhotoPath,
      source_kind: sourceKind,
      source_id: sourceKind && sourceId ? sourceId : null,
    })
    .select('id')
    .single()

  if (error || !data) redirect('/confession/write?error=save')

  const tags = text(form, 'hashtags')
    .split(/[\s,]+/)
    .map((tag) => tag.replace(/^#/, '').trim())
    .filter((tag) => tag.length > 0 && tag.length <= 30)
    .slice(0, 10)

  if (tags.length > 0) {
    await supabase.from('post_hashtags').insert(tags.map((tag) => ({ post_id: data.id, tag })))
  }

  revalidatePath('/confession')
  redirect(`/confession/${data.id}`)
}

export async function deleteConfession(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('confession_posts').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/confession')
  redirect('/confession')
}

/**
 * Toggle the member's reaction on a post.
 *
 * 1 user : 1 reaction per post, changeable (docs/04, AC-06) — the table's
 * primary key guarantees it, and pressing the same reaction again removes it.
 * Only reactions in ENABLED_REACTIONS are accepted; see product-lock.ts for
 * the open question about 공감 1종 vs the canonical three.
 */
export async function toggleReaction(form: FormData) {
  const { supabase, userId } = await requireUser()

  const postId = text(form, 'post_id')
  const typeRaw = text(form, 'type')
  const returnTo = text(form, 'return_to') || '/confession'

  if (!(ENABLED_REACTIONS as readonly string[]).includes(typeRaw)) redirect(returnTo)
  const type = typeRaw as ReactionType

  const { data: existing } = await supabase
    .from('confession_reactions')
    .select('type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.type === type) {
    await supabase.from('confession_reactions').delete().eq('post_id', postId).eq('user_id', userId)
  } else {
    await supabase
      .from('confession_reactions')
      .upsert({ post_id: postId, user_id: userId, type }, { onConflict: 'post_id,user_id' })
  }

  revalidatePath('/confession')
  redirect(returnTo)
}

/**
 * Report a post. docs/08: the reason taxonomy carries no spiritual judgment,
 * and a single report never triggers an automatic restriction — it only opens
 * a case for review.
 */
export async function reportConfession(form: FormData) {
  const { supabase, userId } = await requireUser()

  const postId = text(form, 'post_id')
  const reasonRaw = text(form, 'reason')
  const allowed = ['personal_info', 'harassment', 'spam', 'safety'] as const

  if (!(allowed as readonly string[]).includes(reasonRaw)) {
    redirect(`/confession/${postId}?error=reason`)
  }

  await supabase.from('reports').insert({
    reporter_id: userId,
    post_id: postId,
    reason: reasonRaw as (typeof allowed)[number],
    detail: text(form, 'detail') || null,
  })

  redirect(`/confession/${postId}?reported=1`)
}

export async function blockAuthor(form: FormData) {
  const { supabase, userId } = await requireUser()
  const blockedId = text(form, 'user_id')

  if (blockedId && blockedId !== userId) {
    await supabase.from('user_blocks').insert({ blocker_id: userId, blocked_id: blockedId })
  }

  revalidatePath('/confession')
  redirect('/confession?blocked=1')
}

export async function unblockAuthor(form: FormData) {
  const { supabase, userId } = await requireUser()
  const blockedId = text(form, 'user_id')

  await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', userId)
    .eq('blocked_id', blockedId)

  revalidatePath('/confession')
  redirect('/settings/blocked')
}

/* ---------------------------------------------------------------------------
 * Comments — Confession MVP (docs/04, AC-06, docs/08 Comment Safety).
 *
 * Scope is exactly what docs/08 names: write, read, author delete, report,
 * block, moderator hide/delete. No threading, no reactions on comments, no
 * mentions — none of those exist in a canonical source, so none are built.
 * ------------------------------------------------------------------------ */

const COMMENT_MAX_LENGTH = 1000

export async function createComment(form: FormData) {
  const { supabase, userId } = await requireUser()

  const postId = text(form, 'post_id')
  const body = text(form, 'body')

  if (!postId) redirect('/confession')
  if (!body) redirect(`/confession/${postId}?error=comment_empty`)

  const { error } = await supabase.from('confession_comments').insert({
    post_id: postId,
    user_id: userId,
    body: body.slice(0, COMMENT_MAX_LENGTH),
  })

  if (error) redirect(`/confession/${postId}?error=comment_save`)

  revalidatePath(`/confession/${postId}`)
  revalidatePath('/confession')
  redirect(`/confession/${postId}#comments`)
}

export async function updateComment(form: FormData) {
  const { supabase, userId } = await requireUser()

  const id = text(form, 'comment_id')
  const postId = text(form, 'post_id')
  const body = text(form, 'body')

  if (!id || !postId) redirect('/confession')
  if (!body) redirect(`/confession/${postId}?error=comment_empty`)

  const { error } = await supabase
    .from('confession_comments')
    .update({ body: body.slice(0, COMMENT_MAX_LENGTH) })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) redirect(`/confession/${postId}?error=comment_save`)

  revalidatePath(`/confession/${postId}`)
  redirect(`/confession/${postId}#comments`)
}

/**
 * docs/08: 작성자 본인 삭제. Soft delete — the row stays so the thread keeps its
 * shape and a moderator can still review what was said, but the RLS select
 * policy filters `deleted_at is null`, so no member can read it back.
 */
export async function deleteComment(form: FormData) {
  const { supabase, userId } = await requireUser()

  const id = text(form, 'comment_id')
  const postId = text(form, 'post_id')

  await supabase
    .from('confession_comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  revalidatePath(`/confession/${postId}`)
  revalidatePath('/confession')
  redirect(`/confession/${postId}#comments`)
}

/** Same reason taxonomy as a post report — no spiritual judgment (docs/08). */
export async function reportComment(form: FormData) {
  const { supabase, userId } = await requireUser()

  const commentId = text(form, 'comment_id')
  const postId = text(form, 'post_id')
  const reasonRaw = text(form, 'reason')
  const allowed = ['personal_info', 'harassment', 'spam', 'safety'] as const

  if (!(allowed as readonly string[]).includes(reasonRaw)) {
    redirect(`/confession/${postId}?error=reason`)
  }

  await supabase.from('reports').insert({
    reporter_id: userId,
    comment_id: commentId,
    reason: reasonRaw as (typeof allowed)[number],
    detail: text(form, 'detail') || null,
  })

  redirect(`/confession/${postId}?reported=comment#comments`)
}
