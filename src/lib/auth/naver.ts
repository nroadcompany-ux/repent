/**
 * Shared constants for the Naver OAuth bridge.
 *
 * Supabase Auth has no Naver provider, so RETURN runs the authorization-code
 * flow itself across app/auth/naver/start and app/auth/naver/callback. These
 * live outside both route files because a Next.js route handler may only
 * export HTTP method handlers.
 */

/** httpOnly CSRF state, compared on return from Naver. */
export const NAVER_STATE_COOKIE = 'return_naver_state'

/** Where to send the member once the session is established. */
export const NAVER_NEXT_COOKIE = 'return_naver_next'

export const NAVER_AUTHORIZE_URL = 'https://nid.naver.com/oauth2.0/authorize'
export const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token'
export const NAVER_PROFILE_URL = 'https://openapi.naver.com/v1/nid/me'
