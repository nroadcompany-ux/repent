'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/supabase/server'

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function updateProfile(form: FormData) {
  const { supabase, userId } = await requireUser()

  const displayName = text(form, 'display_name')
  if (!displayName) redirect('/settings?error=name')

  const birthDate = text(form, 'birth_date')
  const today = new Date().toISOString().slice(0, 10)
  if (birthDate && birthDate > today) redirect('/settings?error=birth')

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      birth_date: birthDate || null,
      church_name: text(form, 'church_name') || null,
      denomination: text(form, 'denomination') || null,
      bio: text(form, 'bio') || null,
      // docs/04 / docs/07: never automatic — only what the member ticked here.
      church_info_public: form.get('church_info_public') === 'on',
      profile_visibility: form.get('profile_public') === 'on' ? 'public' : 'private',
    })
    .eq('id', userId)

  if (error) redirect('/settings?error=save')

  revalidatePath('/settings')
  revalidatePath('/journey')
  redirect('/settings?saved=1')
}

/**
 * AI Memory consent. docs/06, docs/07, AC-10: Default OFF, explicit opt-in
 * required before any past record is used as AI context, and the member can
 * revoke at any time. Revoking writes revoked_at so the change is auditable.
 */
export async function setAiMemoryConsent(form: FormData) {
  const { supabase, userId } = await requireUser()
  const enabled = text(form, 'enabled') === 'on'
  const now = new Date().toISOString()

  const { error } = await supabase.from('ai_memory_consent').upsert(
    {
      user_id: userId,
      enabled,
      enabled_at: enabled ? now : null,
      revoked_at: enabled ? null : now,
    },
    { onConflict: 'user_id' },
  )

  if (error) redirect('/settings?error=save')

  revalidatePath('/settings')
  redirect('/settings?saved=1')
}
