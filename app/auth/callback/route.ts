import { NextResponse, type NextRequest } from 'next/server'

import { siteOrigin } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth return for every Supabase-native provider (currently Google).
 * Exchanges the authorization code for a session cookie, then sends the user
 * on to onboarding or to where they were originally heading.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = request.nextUrl.searchParams.get('next') ?? '/journey'
  const origin = siteOrigin()

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Provider errors carry no user content; log the code path, not the payload.
    console.error('[auth] code exchange failed')
    return NextResponse.redirect(`${origin}/login?error=exchange`)
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

  return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/journey'}`)
}
