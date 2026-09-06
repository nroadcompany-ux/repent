'use server'

import { redirect } from 'next/navigation'

import { classifyAuthError, logAuthFailure } from '@/lib/auth/errors'
import { siteOrigin } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

/**
 * Email / Password auth. Canonical since the Owner decision of 2026-09-06
 * (AUTH SCOPE ONLY).
 *
 * Every failure leaves through a short KEY in the URL — never a Supabase
 * message — so the browser can only ever render one of the sentences in
 * src/lib/auth/errors.ts. The technical detail is logged server-side.
 *
 * Password rules are Supabase's. RETURN checks only that the field is filled
 * and that the confirmation matches, then surfaces Supabase's verdict as a calm
 * sentence. Inventing a stricter local rule would be new Product Meaning.
 */

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Only used to catch obvious typos before a round trip. Supabase is the authority. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function signUpFailure(key: string): never {
  redirect(`/login/email?mode=signup&error=${key}`)
}

function signInFailure(key: string, next: string): never {
  const suffix = next ? `&next=${encodeURIComponent(next)}` : ''
  redirect(`/login/email?mode=signin&error=${key}${suffix}`)
}

export async function signUpWithEmail(form: FormData) {
  const email = text(form, 'email').toLowerCase()
  const password = form.get('password')
  const confirm = form.get('password_confirm')

  if (!looksLikeEmail(email)) signUpFailure('email_invalid')
  if (typeof password !== 'string' || password.length === 0) signUpFailure('password_weak')
  if (password !== confirm) signUpFailure('password_mismatch')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteOrigin()}/auth/confirm` },
  })

  if (error) {
    logAuthFailure('email sign-up', error)
    signUpFailure(classifyAuthError(error))
  }

  // Supabase does not error on a duplicate address while email confirmation is
  // on; it returns a user with an empty identities array instead. The Owner
  // asked for an explicit "이미 가입된 이메일입니다" message, so we surface it.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    signUpFailure('email_taken')
  }

  redirect(`/login/email/sent?email=${encodeURIComponent(email)}`)
}

export async function signInWithEmail(form: FormData) {
  const email = text(form, 'email').toLowerCase()
  const password = form.get('password')
  const next = text(form, 'next')

  if (!looksLikeEmail(email)) signInFailure('email_invalid', next)
  if (typeof password !== 'string' || password.length === 0) {
    signInFailure('credentials_invalid', next)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    logAuthFailure('email sign-in', error)
    signInFailure(classifyAuthError(error), next)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) signInFailure('session', next)

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')
  redirect(next.startsWith('/') ? next : '/journey')
}

/**
 * Always reports success, whether or not the address exists. Confirming which
 * emails are registered here would turn the reset form into an account lookup.
 */
export async function requestPasswordReset(form: FormData) {
  const email = text(form, 'email').toLowerCase()

  if (!looksLikeEmail(email)) redirect('/login/email/forgot?error=email_invalid')

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/confirm?type=recovery`,
  })

  if (error) logAuthFailure('password reset request', error)

  redirect(`/login/email/forgot?sent=1&email=${encodeURIComponent(email)}`)
}

/**
 * Runs while the member holds the short-lived recovery session created by
 * /auth/confirm.
 */
export async function updatePassword(form: FormData) {
  const password = form.get('password')
  const confirm = form.get('password_confirm')

  if (typeof password !== 'string' || password.length === 0) {
    redirect('/reset-password?error=password_weak')
  }
  if (password !== confirm) redirect('/reset-password?error=password_mismatch')

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    logAuthFailure('password update', error)
    redirect(`/reset-password?error=${classifyAuthError(error)}`)
  }

  redirect('/journey')
}
