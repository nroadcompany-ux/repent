'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { PROFILE_GALLERY_MAX } from '@/domain/product-lock'
import { requireUser } from '@/lib/supabase/server'

/**
 * Profile media and hashtags (docs/04, docs/07, AC-07).
 *
 *   대표 프로필 사진 1장 · Profile Gallery 최대 30장 · Profile Hashtag
 *
 * Photos are self-expression, never proof of membership: docs/08 forbids the
 * phrase 정상 교인 인증 and forbids treating a gallery photo as verification.
 * Nothing here derives anything from an image.
 *
 * The file itself is uploaded straight from the browser to a private bucket
 * under `<user_id>/…`, which is the only prefix storage RLS accepts. These
 * actions record the resulting path.
 */

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Rejects a path outside the member's own storage prefix. */
function ownedPath(path: string, userId: string): string | null {
  return path.startsWith(`${userId}/`) ? path : null
}

export async function setAvatar(form: FormData) {
  const { supabase, userId } = await requireUser()
  const path = ownedPath(text(form, 'storage_path'), userId)

  if (!path) redirect('/settings/profile-media?error=upload')

  // Remove the previous file so a replaced avatar does not linger in storage.
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle()

  const { error } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', userId)
  if (error) redirect('/settings/profile-media?error=save')

  if (profile?.avatar_path && profile.avatar_path !== path) {
    await supabase.storage.from('avatars').remove([profile.avatar_path])
  }

  revalidatePath('/settings/profile-media')
  revalidatePath('/settings')
  redirect('/settings/profile-media?saved=1')
}

export async function removeAvatar() {
  const { supabase, userId } = await requireUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle()

  await supabase.from('profiles').update({ avatar_path: null }).eq('id', userId)
  if (profile?.avatar_path) {
    await supabase.storage.from('avatars').remove([profile.avatar_path])
  }

  revalidatePath('/settings/profile-media')
  redirect('/settings/profile-media')
}

export async function addGalleryPhoto(form: FormData) {
  const { supabase, userId } = await requireUser()
  const path = ownedPath(text(form, 'storage_path'), userId)

  if (!path) redirect('/settings/profile-media?error=upload')

  const { count } = await supabase
    .from('profile_media')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  // The database trigger enforces this too; checking here lets the member see a
  // sentence instead of a constraint error.
  if ((count ?? 0) >= PROFILE_GALLERY_MAX) {
    await supabase.storage.from('gallery').remove([path])
    redirect('/settings/profile-media?error=limit')
  }

  const { error } = await supabase.from('profile_media').insert({
    user_id: userId,
    storage_path: path,
    category: text(form, 'category') || null,
    caption: text(form, 'caption') || null,
    sort_order: count ?? 0,
  })

  if (error) {
    await supabase.storage.from('gallery').remove([path])
    redirect('/settings/profile-media?error=save')
  }

  revalidatePath('/settings/profile-media')
  redirect('/settings/profile-media?saved=1')
}

export async function deleteGalleryPhoto(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  const { data: media } = await supabase
    .from('profile_media')
    .select('storage_path')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  await supabase.from('profile_media').delete().eq('id', id).eq('user_id', userId)
  if (media?.storage_path) {
    await supabase.storage.from('gallery').remove([media.storage_path])
  }

  revalidatePath('/settings/profile-media')
  redirect('/settings/profile-media')
}

export async function addProfileHashtag(form: FormData) {
  const { supabase, userId } = await requireUser()
  const tag = text(form, 'tag').replace(/^#/, '').slice(0, 30)

  if (!tag) redirect('/settings/profile-media?error=tag')

  await supabase.from('profile_hashtags').upsert({ user_id: userId, tag })

  revalidatePath('/settings/profile-media')
  redirect('/settings/profile-media')
}

export async function removeProfileHashtag(form: FormData) {
  const { supabase, userId } = await requireUser()
  const tag = text(form, 'tag')

  await supabase.from('profile_hashtags').delete().eq('user_id', userId).eq('tag', tag)

  revalidatePath('/settings/profile-media')
  redirect('/settings/profile-media')
}
