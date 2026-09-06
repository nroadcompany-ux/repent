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

/**
 * Promise / Action writes.
 *
 * docs/04 and AC-05: a missed day is never a failure and never a sin, so no
 * action here writes a "missed" or "failed" row. Absence of a check simply
 * means nothing was recorded that day.
 */

export async function createPromise(form: FormData) {
  const { supabase, userId } = await requireUser()

  const title = text(form, 'title')
  if (!title) redirect('/promise/new?error=title')

  const groupId = text(form, 'group_id')
  const dueDate = text(form, 'due_date')
  const dailyTarget = Math.min(Math.max(number(form, 'daily_target', 1), 1), 10)

  const { data, error } = await supabase
    .from('promises')
    .insert({
      user_id: userId,
      title,
      group_id: groupId || null,
      background: text(form, 'background') || null,
      purpose: text(form, 'purpose') || null,
      due_date: dueDate || null,
      daily_target: dailyTarget,
    })
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

  const { error } = await supabase
    .from('promises')
    .update({
      title,
      group_id: groupId || null,
      background: text(form, 'background') || null,
      purpose: text(form, 'purpose') || null,
      due_date: dueDate || null,
      daily_target: Math.min(Math.max(number(form, 'daily_target', 1), 1), 10),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) redirect(`/promise/${id}/edit?error=save`)

  revalidatePath(`/promise/${id}`)
  redirect(`/promise/${id}`)
}

/**
 * Record one more keep for a given day, wrapping back to zero once the daily
 * target is reached so a mistap is easy to undo. `returnTo` keeps the member
 * where they were — the 3-day strip on Promise Home or the detail screen.
 */
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
  redirect(returnTo)
}

/** docs/04: user-facing finish label is `마무리됨`. */
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
 * Action — the execution record inside a Promise (docs/00, docs/01).
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

/**
 * Log how an action went. docs/04 requires all five outcomes to stay available
 * and equal: Retry / Modify / Reschedule / Record Only / Optional Repent.
 * `record_only` is the default so that simply noting what happened is always
 * the easiest option.
 */
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

  // Optional Repent — offered only because the member asked for it.
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
