'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Prayer writes. Every mutation runs through the RLS-bound session client, so
 * the `user_id` we set is also the only `user_id` the database will accept.
 *
 * Nothing here records whether a prayer was answered — docs/04 forbids the
 * system judging 응답/미응답 or God's will.
 */

export async function createPrayerTopic(form: FormData) {
  const { supabase, userId } = await requireUser()

  const title = text(form, 'title')
  const kind = text(form, 'kind') === 'intercession' ? 'intercession' : 'mine'
  const subjectName = text(form, 'subject_name')
  const body = text(form, 'body')

  if (!title) redirect(`/prayer/topic/new?kind=${kind}&error=title`)

  const { data, error } = await supabase
    .from('prayer_topics')
    .insert({
      user_id: userId,
      title,
      kind,
      subject_name: kind === 'intercession' && subjectName ? subjectName : null,
      body: body || null,
    })
    .select('id')
    .single()

  if (error || !data) redirect(`/prayer/topic/new?kind=${kind}&error=save`)

  revalidatePath('/prayer')
  redirect(`/prayer/topic/${data.id}`)
}

export async function updatePrayerTopic(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')
  const title = text(form, 'title')
  const body = text(form, 'body')
  const subjectName = text(form, 'subject_name')

  if (!id || !title) redirect(`/prayer/topic/${id}?error=title`)

  const { error } = await supabase
    .from('prayer_topics')
    .update({ title, body: body || null, subject_name: subjectName || null })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) redirect(`/prayer/topic/${id}?error=save`)

  revalidatePath(`/prayer/topic/${id}`)
  redirect(`/prayer/topic/${id}`)
}

/** Primary CTA on Prayer Detail: 오늘의 기도 남기기 (docs/03). */
export async function addPrayerRecord(form: FormData) {
  const { supabase, userId } = await requireUser()
  const topicId = text(form, 'topic_id')
  const body = text(form, 'body')
  const prayedOn = text(form, 'prayed_on') || todayKst()

  if (!topicId || !body) redirect(`/prayer/topic/${topicId}?error=empty`)

  const { error } = await supabase.from('prayer_records').insert({
    user_id: userId,
    topic_id: topicId,
    body,
    prayed_on: prayedOn,
  })

  if (error) redirect(`/prayer/topic/${topicId}?error=save`)

  revalidatePath(`/prayer/topic/${topicId}`)
  revalidatePath('/journey')
  redirect(`/prayer/topic/${topicId}`)
}

export async function deletePrayerRecord(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'record_id')
  const topicId = text(form, 'topic_id')

  await supabase.from('prayer_records').delete().eq('id', id).eq('user_id', userId)

  revalidatePath(`/prayer/topic/${topicId}`)
  redirect(`/prayer/topic/${topicId}`)
}

/**
 * Close a prayer topic. This records only that the member chose to stop
 * carrying it here — it is not a judgment that the prayer was answered.
 */
export async function closePrayerTopic(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase
    .from('prayer_topics')
    .update({ closed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  revalidatePath('/prayer')
  redirect('/prayer')
}

export async function reopenPrayerTopic(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('prayer_topics').update({ closed_at: null }).eq('id', id).eq('user_id', userId)

  revalidatePath(`/prayer/topic/${id}`)
  redirect(`/prayer/topic/${id}`)
}

export async function deletePrayerTopic(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('prayer_topics').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/prayer')
  redirect('/prayer')
}

/* ---------------------------------------------------------------------------
 * 기도문 — prepared prayers, including 대표기도 for 주일예배 / 소모임 기도회.
 * ------------------------------------------------------------------------ */

export async function createPrayerText(form: FormData) {
  const { supabase, userId } = await requireUser()
  const title = text(form, 'title')
  const occasion = text(form, 'occasion')
  const body = text(form, 'body')

  if (!title) redirect('/prayer/text/new?error=title')

  const { data, error } = await supabase
    .from('prayer_texts')
    .insert({ user_id: userId, title, occasion: occasion || null, body })
    .select('id')
    .single()

  if (error || !data) redirect('/prayer/text/new?error=save')

  revalidatePath('/prayer')
  redirect(`/prayer/text/${data.id}`)
}

export async function updatePrayerText(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')
  const title = text(form, 'title')
  const occasion = text(form, 'occasion')
  const body = text(form, 'body')

  if (!id || !title) redirect(`/prayer/text/${id}?error=title`)

  const { error } = await supabase
    .from('prayer_texts')
    .update({ title, occasion: occasion || null, body })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) redirect(`/prayer/text/${id}?error=save`)

  revalidatePath(`/prayer/text/${id}`)
  redirect(`/prayer/text/${id}`)
}

export async function deletePrayerText(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('prayer_texts').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/prayer')
  redirect('/prayer')
}

/* ---------------------------------------------------------------------------
 * 기도함 — the folder level of 기도함 → 기도 제목 → 날짜별 기도 기록 (docs/01).
 * ------------------------------------------------------------------------ */

export async function createPrayerFolder(form: FormData) {
  const { supabase, userId } = await requireUser()
  const name = text(form, 'name')

  if (!name) redirect('/prayer/folders?error=name')

  const { error } = await supabase.from('prayer_folders').insert({ user_id: userId, name })
  if (error) redirect('/prayer/folders?error=save')

  revalidatePath('/prayer/folders')
  redirect('/prayer/folders')
}

export async function renamePrayerFolder(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')
  const name = text(form, 'name')

  if (!id || !name) redirect('/prayer/folders?error=name')

  await supabase.from('prayer_folders').update({ name }).eq('id', id).eq('user_id', userId)

  revalidatePath('/prayer/folders')
  redirect('/prayer/folders')
}

/**
 * Deleting a folder never deletes the prayers inside it — the FK is
 * ON DELETE SET NULL, so the topics simply become unfiled.
 */
export async function deletePrayerFolder(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('prayer_folders').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/prayer/folders')
  redirect('/prayer/folders')
}

export async function movePrayerTopic(form: FormData) {
  const { supabase, userId } = await requireUser()
  const topicId = text(form, 'topic_id')
  const folderId = text(form, 'folder_id')

  await supabase
    .from('prayer_topics')
    .update({ folder_id: folderId || null })
    .eq('id', topicId)
    .eq('user_id', userId)

  revalidatePath(`/prayer/topic/${topicId}`)
  redirect(`/prayer/topic/${topicId}`)
}
