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
 * Journey writes.
 *
 * Journey owns only the records that have no other home: the 5-step self
 * record, life events, saved scripture references, and reading progress
 * (docs/01, docs/05). It never writes into Prayer, Repentance, or Promise.
 */

/**
 * 5-step self record. docs/04: no input = Missing, so there is deliberately no
 * way to write a "no record" row — the member either records a level or the
 * day simply stays empty. Recording the same day again overwrites it.
 */
export async function saveMood(form: FormData) {
  const { supabase, userId } = await requireUser()

  const level = Number.parseInt(text(form, 'level'), 10)
  const recordedOn = text(form, 'recorded_on') || todayKst()
  const returnTo = text(form, 'return_to') || '/journey/graph'

  if (!Number.isFinite(level) || level < 1 || level > 5) redirect(`${returnTo}?error=level`)

  const { error } = await supabase.from('mood_records').upsert(
    { user_id: userId, recorded_on: recordedOn, level, note: text(form, 'note') || null },
    { onConflict: 'user_id,recorded_on' },
  )

  if (error) redirect(`${returnTo}?error=save`)

  revalidatePath('/journey')
  revalidatePath('/journey/graph')
  redirect(returnTo)
}

export async function deleteMood(form: FormData) {
  const { supabase, userId } = await requireUser()
  const recordedOn = text(form, 'recorded_on')
  const returnTo = text(form, 'return_to') || '/journey/graph'

  await supabase
    .from('mood_records')
    .delete()
    .eq('user_id', userId)
    .eq('recorded_on', recordedOn)

  revalidatePath('/journey/graph')
  redirect(returnTo)
}

/** 생애 사건 — the only Journey layer drawn as a connected line. */
export async function saveLifeEvent(form: FormData) {
  const { supabase, userId } = await requireUser()

  const title = text(form, 'title')
  const occurredOn = text(form, 'occurred_on') || todayKst()
  const significance = Number.parseInt(text(form, 'significance'), 10)
  const id = text(form, 'id')

  if (!title) redirect('/journey/graph?error=title')

  const payload = {
    user_id: userId,
    title,
    occurred_on: occurredOn,
    body: text(form, 'body') || null,
    category: text(form, 'category') || null,
    significance: Number.isFinite(significance) ? Math.min(Math.max(significance, -5), 5) : 0,
  }

  const { error } = id
    ? await supabase.from('life_events').update(payload).eq('id', id).eq('user_id', userId)
    : await supabase.from('life_events').insert(payload)

  if (error) redirect('/journey/graph?error=save')

  revalidatePath('/journey')
  revalidatePath('/journey/graph')
  redirect('/journey/graph')
}

export async function deleteLifeEvent(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('life_events').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/journey/graph')
  redirect('/journey/graph')
}

/** 나의 말씀 — a reference plus the member's own note. */
export async function saveScripture(form: FormData) {
  const { supabase, userId } = await requireUser()

  const reference = text(form, 'reference')
  if (!reference) redirect('/journey/scripture?error=reference')

  const { error } = await supabase.from('saved_scriptures').insert({
    user_id: userId,
    reference,
    memo: text(form, 'memo') || null,
    saved_on: text(form, 'saved_on') || todayKst(),
  })

  if (error) redirect('/journey/scripture?error=save')

  revalidatePath('/journey')
  revalidatePath('/journey/scripture')
  redirect('/journey/scripture')
}

export async function deleteScripture(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('saved_scriptures').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/journey/scripture')
  redirect('/journey/scripture')
}

/** 성경읽기표 — toggling one chapter on or off. */
export async function toggleChapter(form: FormData) {
  const { supabase, userId } = await requireUser()

  const book = text(form, 'book')
  const chapter = Number.parseInt(text(form, 'chapter'), 10)
  const alreadyRead = text(form, 'read') === '1'
  const returnTo = text(form, 'return_to') || '/journey/bible'

  if (!book || !Number.isFinite(chapter)) redirect(returnTo)

  if (alreadyRead) {
    await supabase
      .from('bible_reading_progress')
      .delete()
      .eq('user_id', userId)
      .eq('book', book)
      .eq('chapter', chapter)
  } else {
    await supabase
      .from('bible_reading_progress')
      .upsert(
        { user_id: userId, book, chapter, read_on: todayKst() },
        { onConflict: 'user_id,book,chapter' },
      )
  }

  revalidatePath('/journey')
  revalidatePath('/journey/bible')
  redirect(returnTo)
}
