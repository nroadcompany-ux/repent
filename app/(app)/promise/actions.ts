'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { readProvenance } from '@/domain/provenance'
import { safeReturnPath } from '@/lib/auth/safe-path'
import { todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function number(form: FormData, key: string, fallback: number): number {
  const parsed = Number.parseInt(text(form, key), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function repeatType(form: FormData): 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' {
  const value = text(form, 'repeat_type')
  return ['daily', 'weekly', 'monthly', 'yearly'].includes(value)
    ? (value as 'daily' | 'weekly' | 'monthly' | 'yearly')
    : 'none'
}

function repeatWeekdays(form: FormData): number[] {
  return form
    .getAll('repeat_weekdays')
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
}

export async function createPromise(form: FormData) {
  const { supabase, userId } = await requireUser()

  const title = text(form, 'title')
  if (!title) redirect('/promise/new?error=title')

  const groupId = text(form, 'group_id')
  const dueDate = text(form, 'due_date')
  const startedOn = text(form, 'started_on') || todayKst()
  const recurrence = repeatType(form)
  const weekdays = recurrence === 'weekly' ? repeatWeekdays(form) : []

  if (dueDate && dueDate < startedOn) redirect('/promise/new?error=date')
  if (recurrence === 'weekly' && weekdays.length === 0) redirect('/promise/new?error=weekday')

  const payload = {
    user_id: userId,
    title,
    group_id: groupId || null,
    background: text(form, 'background') || null,
    purpose: text(form, 'purpose') || null,
    started_on: startedOn,
    due_date: dueDate || null,
    daily_target: 1,
    repeat_type: recurrence,
    repeat_weekdays: weekdays,
    // 0011: re-validated here, never trusted from the form. A half-filled
    // pointer becomes null/null rather than failing the pair CHECK.
    ...(readProvenance(text(form, 'source_kind'), text(form, 'source_id')) ?? {
      source_kind: null,
      source_id: null,
    }),
  }

  const { data, error } = await supabase
    .from('promises')
    .insert(payload as never)
    .select('id')
    .single()

  if (error || !data) redirect('/promise/new?error=save')

  revalidatePath('/promise')
  revalidatePath('/journey')
  redirect(`/promise/${data.id}`)
}

export async function updatePromise(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')
  const title = text(form, 'title')

  if (!id || !title) redirect(`/promise/${id}/edit?error=title`)

  const dueDate = text(form, 'due_date')
  const groupId = text(form, 'group_id')
  const startedOn = text(form, 'started_on') || todayKst()
  const recurrence = repeatType(form)
  const weekdays = recurrence === 'weekly' ? repeatWeekdays(form) : []

  if (dueDate && dueDate < startedOn) redirect(`/promise/${id}/edit?error=date`)
  if (recurrence === 'weekly' && weekdays.length === 0) redirect(`/promise/${id}/edit?error=weekday`)

  const payload = {
    title,
    group_id: groupId || null,
    background: text(form, 'background') || null,
    purpose: text(form, 'purpose') || null,
    started_on: startedOn,
    due_date: dueDate || null,
    daily_target: 1,
    repeat_type: recurrence,
    repeat_weekdays: weekdays,
  }

  const { error } = await supabase
    .from('promises')
    .update(payload as never)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) redirect(`/promise/${id}/edit?error=save`)

  revalidatePath(`/promise/${id}`)
  revalidatePath('/promise')
  revalidatePath('/journey')
  // Owner decision 2026-09-08: finishing a promise must not be a dead end. The
  // member stays on the promise they just acted on — that is where the result
  // belongs — and `closed` tells the screen to offer the way onward.
  redirect(`/promise/${id}?closed=1`)
}

/** One tap records whether the promise itself was kept on that date. */
export async function bumpPromiseCheck(form: FormData) {
  const { supabase, userId } = await requireUser()

  const promiseId = text(form, 'promise_id')
  const checkDate = text(form, 'check_date') || todayKst()
  const target = Math.min(Math.max(number(form, 'daily_target', 1), 1), 10)
  const current = Math.max(number(form, 'done_count', 0), 0)
  const returnTo = safeReturnPath(text(form, 'return_to')) ?? '/promise'

  const nextCount = current >= target ? 0 : current + 1

  const { error } = await supabase.from('promise_checks').upsert(
    {
      promise_id: promiseId,
      user_id: userId,
      check_date: checkDate,
      done_count: nextCount,
    },
    { onConflict: 'promise_id,check_date' },
  )

  if (error) redirect(`${returnTo}?error=check`)

  revalidatePath('/promise')
  revalidatePath('/journey')
  revalidatePath(`/promise/${promiseId}`)
  redirect(returnTo)
}

export async function closePromise(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase
    .from('promises')
    .update({ state: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  revalidatePath('/promise')
  revalidatePath('/journey')
  redirect(`/promise/${id}`)
}

export async function reopenPromise(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase
    .from('promises')
    .update({ state: 'active', closed_at: null })
    .eq('id', id)
    .eq('user_id', userId)

  revalidatePath('/promise')
  redirect(`/promise/${id}`)
}

/**
 * Owner decision 2026-09-08: the three seeded group names are an initial value,
 * not fixed wording. A member renames them into their own language.
 *
 * No migration is involved. promise_groups has been user-owned since 0002 —
 * per-user rows, `name text not null` rather than an enum, and RLS keyed on
 * auth.uid() — so a rename is a plain UPDATE that no other member can see, and
 * promises.group_id is untouched, so nothing is regrouped.
 */
export async function renamePromiseGroup(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')
  const name = text(form, 'name')

  if (!id || !name) redirect('/promise/groups?error=name')

  await supabase.from('promise_groups').update({ name }).eq('id', id).eq('user_id', userId)

  revalidatePath('/promise/groups')
  revalidatePath('/promise')
  redirect('/promise/groups?saved=1')
}

export async function deletePromise(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('promises').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/promise')
  redirect('/promise')
}

/* ---------------------------------------------------------------------------
 * Legacy Action writes — kept for historical records/backward compatibility.
 * New promise UX does not ask members to re-enter the same execution sentence.
 * ------------------------------------------------------------------------ */

export async function createAction(form: FormData) {
  const { supabase, userId } = await requireUser()
  const promiseId = text(form, 'promise_id')
  const title = text(form, 'title')

  if (!promiseId || !title) redirect(`/promise/${promiseId}?error=action_title`)

  const plannedFor = text(form, 'planned_for')

  const { error } = await supabase.from('actions').insert({
    user_id: userId,
    promise_id: promiseId,
    title,
    planned_for: plannedFor || null,
  })

  if (error) redirect(`/promise/${promiseId}?error=save`)

  revalidatePath(`/promise/${promiseId}`)
  redirect(`/promise/${promiseId}`)
}

export async function recordAction(form: FormData) {
  const { supabase, userId } = await requireUser()

  const actionId = text(form, 'action_id')
  const promiseId = text(form, 'promise_id')
  const outcomeRaw = text(form, 'outcome')
  const allowed = ['done', 'retry', 'modified', 'rescheduled', 'record_only'] as const
  const outcome = (allowed as readonly string[]).includes(outcomeRaw)
    ? (outcomeRaw as (typeof allowed)[number])
    : 'record_only'

  const { error } = await supabase.from('action_records').insert({
    user_id: userId,
    action_id: actionId,
    outcome,
    note: text(form, 'note') || null,
  })

  if (error) redirect(`/promise/${promiseId}?error=save`)

  revalidatePath(`/promise/${promiseId}`)

  if (text(form, 'then') === 'repent') redirect('/repentance')
  redirect(`/promise/${promiseId}`)
}

export async function deleteAction(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'action_id')
  const promiseId = text(form, 'promise_id')

  await supabase.from('actions').delete().eq('id', id).eq('user_id', userId)

  revalidatePath(`/promise/${promiseId}`)
  redirect(`/promise/${promiseId}`)
}
