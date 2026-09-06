import { NextResponse, type NextRequest } from 'next/server'

import { isSupabaseProviderEnabled } from '@/lib/auth/providers'
import { siteOrigin } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

/**
 * Google sign-in (docs/00, AC-07). Runs server-side so the PKCE code verifier
 * is written as an httpOnly cookie rather than living in browser storage.
 */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') ?? '/journey'

  // Guard: a disabled provider makes Supabase answer the browser with raw JSON
  // on its own domain, which the member cannot get back from. Only redirect
  // when we positively know the provider is enabled; an unreachable settings
  // endpoint falls through and lets Supabase decide.
  if (!(await isSupabaseProviderEnabled('google', true))) {
    return NextResponse.redirect(`${siteOrigin()}/login?error=google_unconfigured`)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data.url) {
    const failed = new URL('/login', siteOrigin())
    failed.searchParams.set('error', 'google')
    return NextResponse.redirect(failed)
  }

  return NextResponse.redirect(data.url)
}
