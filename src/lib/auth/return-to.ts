import { cookies } from 'next/headers'

import { DEFAULT_RETURN_PATH, safeReturnPath } from './safe-path'

/**
 * Where to send a member once authentication finishes.
 *
 * Carried in an httpOnly cookie rather than a query string on the provider
 * redirect URL, so every callback RETURN registers with Supabase is a bare
 * path. That keeps the Redirect URL allowlist to exact routes:
 *
 *   https://repent-app.vercel.app/auth/callback
 *   https://repent-app.vercel.app/auth/confirm
 *
 * with no wildcard. The open-redirect guard lives in ./safe-path.ts.
 */

export const AUTH_NEXT_COOKIE = 'return_auth_next'

/** Only same-site paths are stored; anything else is silently dropped. */
export async function rememberReturnTo(next: string | null, secure: boolean) {
  const safe = safeReturnPath(next)
  if (!safe) return

  const cookieStore = await cookies()
  cookieStore.set(AUTH_NEXT_COOKIE, safe, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
}

/**
 * Reads and clears the cookie. The stored value is validated again on the way
 * out, so a cookie written by an older build - or tampered with - still cannot
 * produce an off-site redirect.
 */
export async function takeReturnTo(fallback: string = DEFAULT_RETURN_PATH): Promise<string> {
  const cookieStore = await cookies()
  const value = cookieStore.get(AUTH_NEXT_COOKIE)?.value
  if (value) cookieStore.delete(AUTH_NEXT_COOKIE)

  return safeReturnPath(value) ?? fallback
}
