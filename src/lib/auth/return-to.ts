import 'server-only'

import { cookies } from 'next/headers'

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
 * with no wildcard, which is what the minimal-scope rule asks for.
 */

export const AUTH_NEXT_COOKIE = 'return_auth_next'

/** Only same-site paths are stored; an absolute URL would be an open redirect. */
export async function rememberReturnTo(next: string | null, secure: boolean) {
  const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : null
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

/** Reads and clears the cookie. Falls back to Journey. */
export async function takeReturnTo(fallback = '/journey'): Promise<string> {
  const cookieStore = await cookies()
  const value = cookieStore.get(AUTH_NEXT_COOKIE)?.value
  if (value) cookieStore.delete(AUTH_NEXT_COOKIE)

  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}
