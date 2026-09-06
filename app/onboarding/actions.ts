'use server'

import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/supabase/server'

/**
 * Onboarding writes each step as it is completed, so a member who closes the
 * app mid-way resumes exactly where they left off (docs/02 "Onboarding 중단 시
 * Resume 가능해야 한다").
 */

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function saveProfileStep(form: FormData) {
  const { supabase, userId } = await requireUser()
  const displayName = text(form, 'display_name')
  const birthDate = text(form, 'birth_date')
  const today = new Date().toISOString().slice(0, 10)

  if (!displayName) redirect('/onboarding?step=profile&error=name')
  if (!birthDate || birthDate > today) redirect('/onboarding?step=profile&error=birth')

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName, birth_date: birthDate })
    .eq('id', userId)

  if (error) redirect('/onboarding?step=profile&error=save')
  redirect('/onboarding?step=church')
}

export async function saveChurchStep(form: FormData) {
  const { supabase, userId } = await requireUser()
  const churchName = text(form, 'church_name')
  const denomination = text(form, 'denomination')

  if (!churchName || !denomination) redirect('/onboarding?step=church&error=required')

  const { error } = await supabase
    .from('profiles')
    // church_info_public stays false: docs/04 forbids auto-publishing these.
    .update({ church_name: churchName, denomination })
    .eq('id', userId)

  if (error) redirect('/onboarding?step=church&error=save')
  redirect('/onboarding?step=terms')
}

export async function saveTermsStep(form: FormData) {
  const { supabase, userId } = await requireUser()

  if (form.get('terms') !== 'on' || form.get('privacy') !== 'on') {
    redirect('/onboarding?step=terms&error=required')
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({ terms_agreed_at: now, privacy_agreed_at: now })
    .eq('id', userId)

  if (error) redirect('/onboarding?step=terms&error=save')
  redirect('/onboarding?step=questions')
}

/**
 * The three opening questions (docs/00). Answers are optional on purpose:
 * the Owner order forbids UX that pressures a member into a record, so an
 * empty answer must never block entry.
 */
export async function saveQuestionsStep(form: FormData) {
  const { supabase, userId } = await requireUser()

  const answers = [
    { question_key: 'q1_word' as const, body: text(form, 'q1_word') },
    { question_key: 'q2_walk' as const, body: text(form, 'q2_walk') },
    { question_key: 'q3_promise' as const, body: text(form, 'q3_promise') },
  ].filter((answer) => answer.body.length > 0)

  if (answers.length > 0) {
    const { error } = await supabase
      .from('onboarding_answers')
      .upsert(answers.map((answer) => ({ ...answer, user_id: userId })))
    if (error) redirect('/onboarding?step=questions&error=save')
  }

  const { error: completeError } = await supabase
    .from('profiles')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', userId)

  if (completeError) redirect('/onboarding?step=questions&error=save')
  redirect('/journey')
}
