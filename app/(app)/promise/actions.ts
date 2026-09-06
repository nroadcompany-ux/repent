'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  const recurrence = repeatType(form)
  const weekdays = recurrence === 'weekly' ? repeatWeekdays(form) : []

  const payload = {
    title,
    group_id: groupId || null,
    background: text(form, 'background') || null,
    purpose: text(form, 'purpose') || null,
    started_on: text(form, 'started_on') || todayKst(),
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
  redirect(`/promise/${id}`)
}

/** One tap records whether the promise itself was kept on that date. */
export async function bumpPromiseCheck(form: FormData) {
  const { supabase, userId } = await requireUser()

  const promiseId = text(form, 'promise_id')
  const checkDate = text(form, 'check_date') || todayKst()
  const target = Math.min(Math.max(number(form, 'daily_target', 1), 1), 10)
  const current = Math.max(number(form, 'done_count', 0), 0)
  const returnTo = text(form, 'return_to') || '/promise'

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
