'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/supabase/server'

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/*
 * The old startRepentance() was removed on 2026-09-07 (Issue #21 §B).
 *
 * It inserted a draft the moment the 회개하기 button was pressed, so opening
 * the screen and walking away left a row behind: every one of the 5 rows in
 * the table was an untouched draft. The entry point is now a plain link to
 * /repentance/write, and saveRepentanceStep below creates the row on the first
 * real save instead. Existing drafts are left exactly as they are.
 */

const STEP_FIELDS = {
  looking_back: 'looking_back',
  realization: 'realization',
  returning: 'returning_note',
} as const

export type RepentanceStep = keyof typeof STEP_FIELDS

const STEP_ORDER: RepentanceStep[] = ['looking_back', 'realization', 'returning']

function recordedAtFromDate(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  // Noon KST avoids accidental date shifts when rendered across environments.
  return `${date}T12:00:00+09:00`
}

export async function saveRepentanceStep(form: FormData) {
  const { supabase, userId } = await requireUser()

  const submittedId = text(form, 'id')
  const step = text(form, 'step') as RepentanceStep
  const intent = text(form, 'intent')
  const title = text(form, 'title')

  if (!STEP_ORDER.includes(step)) redirect('/repentance')

  const column = STEP_FIELDS[step]
  const body = text(form, column) || null
  const recordedOn = text(form, 'recorded_on')

  const payload =
    step === 'looking_back'
      ? {
          looking_back: body,
          title,
          ...(recordedAtFromDate(recordedOn) ? { recorded_at: recordedAtFromDate(recordedOn) } : {}),
        }
      : step === 'realization'
        ? { realization: body }
        : { returning_note: body }

  let id = submittedId

  if (id) {
    const { error } = await supabase
      .from('repentances')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) redirect(`/repentance/${id}/write?step=${step}&error=save`)
  } else {
    // Delayed creation (Issue #21 §B): the row appears on the first real save.
    // Opening the screen and leaving writes nothing.
    if (step !== 'looking_back') redirect('/repentance')

    const { data, error } = await supabase
      .from('repentances')
      .insert({
        user_id: userId,
        state: 'draft',
        recorded_at: recordedAtFromDate(recordedOn) ?? new Date().toISOString(),
        ...payload,
      })
      .select('id')
      .single()

    if (error || !data) redirect(`/repentance/write?error=save`)
    id = data.id
  }

  if (intent === 'draft') {
    revalidatePath('/repentance')
    redirect('/repentance?saved=draft')
  }

  if (intent === 'finish') {
    const { error: finishError } = await supabase
      .from('repentances')
      .update({ state: 'recorded' })
      .eq('id', id)
      .eq('user_id', userId)

    if (finishError) redirect(`/repentance/${id}/write?step=${step}&error=save`)

    revalidatePath('/repentance')
    revalidatePath('/journey')
    redirect('/repentance?saved=recorded')
  }

  const index = STEP_ORDER.indexOf(step)
  const target =
    intent === 'back'
      ? (STEP_ORDER[Math.max(index - 1, 0)] as RepentanceStep)
      : (STEP_ORDER[Math.min(index + 1, STEP_ORDER.length - 1)] as RepentanceStep)

  redirect(`/repentance/${id}/write?step=${target}`)
}

/** Legacy review route support for records created before the three-step flow. */
export async function commitRepentance(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  const { error } = await supabase
    .from('repentances')
    .update({ state: 'recorded' })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) redirect(`/repentance/${id}/review?error=save`)

  revalidatePath('/repentance')
  revalidatePath('/journey')
  redirect('/repentance?saved=recorded')
}

export async function reopenRepentance(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase
    .from('repentances')
    .update({ state: 'draft' })
    .eq('id', id)
    .eq('user_id', userId)

  redirect(`/repentance/${id}/write?step=looking_back`)
}

export async function deleteRepentance(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  await supabase.from('repentances').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/repentance')
  redirect('/repentance')
}
