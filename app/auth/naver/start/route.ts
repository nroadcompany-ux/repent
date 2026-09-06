import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import {
  NAVER_AUTHORIZE_URL,
  NAVER_NEXT_COOKIE,
  NAVER_STATE_COOKIE,
} from '@/lib/auth/naver'
import { serverEnv, siteOrigin, featureFlags } from '@/lib/env'

/**
 * Naver sign-in, step 1 of 2.
 *
 * Supabase Auth has no built-in Naver provider, so RETURN runs the Naver
 * authorization-code flow itself. The client secret is read only here and in
 * the callback — it never reaches the browser.
 *
 * CSRF: a random `state` is stored in an httpOnly cookie and compared on
 * return. A mismatched or missing state aborts the sign-in.
 */
export async function GET(request: NextRequest) {
  const origin = siteOrigin()

  if (!featureFlags.naverLogin) {
    return NextResponse.redirect(`${origin}/login?error=naver_unconfigured`)
  }

  const state = randomBytes(24).toString('base64url')
  const next = request.nextUrl.searchParams.get('next') ?? '/journey'

  const cookieStore = await cookies()
  const secure = origin.startsWith('https://')
  cookieStore.set(NAVER_STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  cookieStore.set(NAVER_NEXT_COOKIE, next.startsWith('/') ? next : '/journey', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  const authorize = new URL(NAVER_AUTHORIZE_URL)
  authorize.searchParams.set('response_type', 'code')
  authorize.searchParams.set('client_id', serverEnv().naverClientId())
  authorize.searchParams.set('redirect_uri', `${origin}/auth/naver/callback`)
  authorize.searchParams.set('state', state)

  return NextResponse.redirect(authorize.toString())
}
