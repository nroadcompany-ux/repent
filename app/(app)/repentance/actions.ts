'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/supabase/server'

/**
 * Repentance writes.
 *
 * Canonical constraints held here (docs/02, docs/03, docs/04, AC-04):
 *   * Draft 임시저장 is always allowed and never validated — a half-written
 *     record must be savable, so no field is ever required while state is draft.
 *   * Error handling preserves the draft first. A failed save never discards
 *     what the member typed.
 *   * Nothing computes completion, sufficiency, or forgiveness. `state` moves
 *     draft -> recorded and that is the entire lifecycle.
 */

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Start a new record. Creates the draft immediately so nothing can be lost. */
export async function startRepentance() {
  const { supabase, userId } = await requireUser()

  const { data, error } = await supabase
    .from('repentances')
    .insert({ user_id: userId, state: 'draft' })
    .select('id')
    .single()

  if (error || !data) redirect('/repentance?error=start')

  revalidatePath('/repentance')
  redirect(`/repentance/${data.id}/write?step=looking_back`)
}

const STEP_FIELDS = {
  looking_back: 'looking_back',
  realization: 'realization',
  turning_promise: 'turning_promise',
  returning: 'returning_note',
} as const

export type RepentanceStep = keyof typeof STEP_FIELDS

const STEP_ORDER: RepentanceStep[] = ['looking_back', 'realization', 'turning_promise', 'returning']

/**
 * Save one step. `intent` decides where the member goes next:
 *   next   — save and advance
 *   back   — save and step back
 *   draft  — save and leave (임시저장)
 *   finish — save and go to Preview/Review (docs/02)
 */
export async function saveRepentanceStep(form: FormData) {
  const { supabase, userId } = await requireUser()

  const id = text(form, 'id')
  const step = text(form, 'step') as RepentanceStep
  const intent = text(form, 'intent')
  const title = text(form, 'title')

  if (!id || !STEP_ORDER.includes(step)) redirect('/repentance')

  const column = STEP_FIELDS[step]
  const body = text(form, column) || null

  // Written key by key so the update stays typed against RepentanceRow.
  const payload =
    step === 'looking_back'
      ? { looking_back: body, title }
      : step === 'realization'
        ? { realization: body }
        : step === 'turning_promise'
          ? { turning_promise: body }
          : { returning_note: body }

  const { error } = await supabase
    .from('repentances')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    // Draft preservation first: keep the member on the same step with their
    // text still in the form rather than navigating away.
    redirect(`/repentance/${id}/write?step=${step}&error=save`)
  }

  revalidatePath(`/repentance/${id}/write`)

  if (intent === 'draft') redirect('/repentance?saved=draft')
  if (intent === 'finish') redirect(`/repentance/${id}/review`)

  const index = STEP_ORDER.indexOf(step)
  const target =
    intent === 'back'
      ? (STEP_ORDER[Math.max(index - 1, 0)] as RepentanceStep)
      : (STEP_ORDER[Math.min(index + 1, STEP_ORDER.length - 1)] as RepentanceStep)

  redirect(`/repentance/${id}/write?step=${target}`)
}

/**
 * Commit the record after Preview/Review. This is the only place `state`
 * becomes 'recorded'. It records that the member finished writing — it makes
 * no claim about repentance being sufficient or sin being forgiven.
 */
export async function commitRepentance(form: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(form, 'id')

  const { error } = await supabase
    .from('repentances')
    .update({ state: 'recorded', recorded_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) redirect(`/repentance/${id}/review?error=save`)

  revalidatePath('/repentance')
  revalidatePath('/journey')
  redirect(`/repentance/${id}?just_saved=1`)
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
