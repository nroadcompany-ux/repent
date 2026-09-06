import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

import { classifyAuthError, logAuthFailure } from '@/lib/auth/errors'
import { siteOrigin } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

/**
 * Email link return — both flows land here:
 *   signup   → confirms the address, then continues into onboarding
 *   recovery → establishes a short-lived session, then /reset-password
 *
 * Supabase's own error text never reaches the browser: a failure leaves as a
 * short key that /login renders from src/lib/auth/errors.ts.
 */

const ALLOWED_TYPES: readonly EmailOtpType[] = ['signup', 'recovery', 'email_change', 'magiclink']

export async function GET(request: NextRequest) {
  const origin = siteOrigin()
  const params = request.nextUrl.searchParams
  const tokenHash = params.get('token_hash')
  const typeParam = params.get('type') ?? ''

  if (!tokenHash || !(ALLOWED_TYPES as readonly string[]).includes(typeParam)) {
    return NextResponse.redirect(`${origin}/login?error=reset_link_invalid`)
  }
  const type = typeParam as EmailOtpType

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    logAuthFailure(`email confirm (${type})`, error)
    const key = classifyAuthError(error)
    return NextResponse.redirect(
      `${origin}/login?error=${key === 'unknown' ? 'reset_link_invalid' : key}`,
    )
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login?error=session`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed_at) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }
  return NextResponse.redirect(`${origin}/journey`)
}
