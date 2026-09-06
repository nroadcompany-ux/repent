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

/*
 * Comments are deliberately absent from this file. Canonical docs/04 includes
 * Comment in the Confession MVP, but the Owner execution order lists it under
 * DO NOT INVENT, so no write action exists — and public.confession_comments has
 * no INSERT policy either, closing it at both layers. Screens read the switch
 * from CONFESSION_COMMENTS_ENABLED in src/domain/product-lock.ts.
 */
