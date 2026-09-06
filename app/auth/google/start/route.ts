import { NextResponse, type NextRequest } from 'next/server'

import { isSupabaseProviderEnabled } from '@/lib/auth/providers'
import { rememberReturnTo } from '@/lib/auth/return-to'
import { siteOrigin } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

/**
 * Google sign-in (docs/00, AC-07). Runs server-side so the PKCE code verifier
 * is written as an httpOnly cookie rather than living in browser storage.
 */
export async function GET(request: NextRequest) {
  const origin = siteOrigin()

  // Guard: a disabled provider makes Supabase answer the browser with raw JSON
  // on its own domain, which the member cannot get back from. Only redirect
  // when we positively know the provider is enabled; an unreachable settings
  // endpoint falls through and lets Supabase decide.
  if (!(await isSupabaseProviderEnabled('google', true))) {
    return NextResponse.redirect(`${origin}/login?error=google_unconfigured`)
  }

  const supabase = await createClient()

  // The return path travels in an httpOnly cookie, not a query string, so the
  // URL registered with Supabase stays a bare path.
  await rememberReturnTo(request.nextUrl.searchParams.get('next'), origin.startsWith('https://'))

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=google`)
  }

  return NextResponse.redirect(data.url)
}
