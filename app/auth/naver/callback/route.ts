import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import {
  NAVER_NEXT_COOKIE,
  NAVER_PROFILE_URL,
  NAVER_STATE_COOKIE,
  NAVER_TOKEN_URL,
} from '@/lib/auth/naver'
import { serverEnv, siteOrigin } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type NaverProfile = {
  resultcode: string
  message: string
  response?: { id: string; email?: string; name?: string; nickname?: string }
}

function fail(reason: string) {
  return NextResponse.redirect(`${siteOrigin()}/login?error=${reason}`)
}

/**
 * Naver sign-in, step 2 of 2.
 *
 * Naver is not a Supabase provider, so this route bridges the two:
 *   1. verify `state` against the httpOnly cookie (CSRF)
 *   2. exchange the code for a Naver access token (server-to-server)
 *   3. read the Naver profile
 *   4. find or create the matching Supabase auth user (service role)
 *   5. mint a one-time link and verify it here, which sets the session cookie
 *
 * The service-role key is used only for step 4 — creating another identity's
 * auth user is impossible under RLS by design. Everything the app does after
 * this point runs under the user's own RLS-bound session.
 */
export async function GET(request: NextRequest) {
  const origin = siteOrigin()
  const params = request.nextUrl.searchParams
  const code = params.get('code')
  const returnedState = params.get('state')

  const cookieStore = await cookies()
  const expectedState = cookieStore.get(NAVER_STATE_COOKIE)?.value
  const next = cookieStore.get(NAVER_NEXT_COOKIE)?.value ?? '/journey'
  cookieStore.delete(NAVER_STATE_COOKIE)
  cookieStore.delete(NAVER_NEXT_COOKIE)

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return fail('naver_state')
  }

  const env = serverEnv()

  // 2. Authorization code -> Naver access token.
  const tokenUrl = new URL(NAVER_TOKEN_URL)
  tokenUrl.searchParams.set('grant_type', 'authorization_code')
  tokenUrl.searchParams.set('client_id', env.naverClientId())
  tokenUrl.searchParams.set('client_secret', env.naverClientSecret())
  tokenUrl.searchParams.set('code', code)
  tokenUrl.searchParams.set('state', returnedState)

  const tokenResponse = await fetch(tokenUrl, { method: 'POST', cache: 'no-store' })
  if (!tokenResponse.ok) return fail('naver_token')

  const token = (await tokenResponse.json()) as { access_token?: string }
  if (!token.access_token) return fail('naver_token')

  // 3. Naver profile.
  const profileResponse = await fetch(NAVER_PROFILE_URL, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: 'no-store',
  })
  if (!profileResponse.ok) return fail('naver_profile')

  const profile = (await profileResponse.json()) as NaverProfile
  const naverUser = profile.response
  if (profile.resultcode !== '00' || !naverUser?.id) return fail('naver_profile')

  // RETURN identifies the Supabase user by email. Naver only returns one when
  // the member consented to share it, so ask them to allow it rather than
  // silently creating a second, unlinkable account.
  const email = naverUser.email?.toLowerCase()
  if (!email) return fail('naver_email_required')

  const admin = createAdminClient()
  const displayName = naverUser.nickname ?? naverUser.name ?? ''

  // 4. Find or create the auth user.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: displayName, provider_hint: 'naver', naver_id: naverUser.id },
  })

  if (createError && !isAlreadyRegistered(createError.message)) {
    console.error('[auth] naver user provisioning failed')
    return fail('naver_provision')
  }
  void created

  // 5. Mint a one-time link and consume it here to establish the session.
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  const tokenHash = link?.properties?.hashed_token
  if (linkError || !tokenHash) {
    console.error('[auth] naver session link failed')
    return fail('naver_session')
  }

  const supabase = await createClient()
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: tokenHash,
  })
  if (verifyError) {
    console.error('[auth] naver session verify failed')
    return fail('naver_session')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('naver_session')

  const { data: row } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!row?.onboarding_completed_at) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }
  return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/journey'}`)
}

/** createUser rejects a duplicate email; that just means this is a return visit. */
function isAlreadyRegistered(message: string) {
  const normalized = message.toLowerCase()
  return normalized.includes('already') || normalized.includes('registered')
}
