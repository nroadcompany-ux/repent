import 'server-only'

import { publicEnv } from '../env'
import { featureFlags } from '../env.server'

/**
 * Which sign-in providers can actually complete a login right now.
 *
 * Supabase publishes its enabled external providers at `/auth/v1/settings`.
 * Without checking it, tapping a provider whose toggle is off sends the member
 * out to Supabase's own domain and shows them raw JSON:
 *
 *   {"code":400,"error_code":"validation_failed",
 *    "msg":"Unsupported provider: provider is not enabled"}
 *
 * That is a dead end with no way back. Reading the settings first lets the app
 * say "준비 중" in its own voice instead.
 *
 * Naver is not a Supabase provider — RETURN runs that flow itself — so its
 * availability comes from whether the credentials are configured.
 */

type AuthSettings = { external?: Record<string, boolean> }

export type ProviderAvailability = {
  google: boolean
  naver: boolean
}

/**
 * Fails OPEN for Google: if the settings call itself errors, the button stays
 * visible rather than locking a member out over a transient blip. The route
 * guard in app/auth/google/start is what makes the raw error page impossible —
 * this only decides how the button looks.
 */
export async function getProviderAvailability(): Promise<ProviderAvailability> {
  return {
    google: await isSupabaseProviderEnabled('google', true),
    naver: featureFlags.naverLogin,
  }
}

export async function isSupabaseProviderEnabled(
  provider: string,
  fallback: boolean,
): Promise<boolean> {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) return false

  try {
    const response = await fetch(`${publicEnv.supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: publicEnv.supabaseAnonKey },
      // Short cache: the Owner flipping the toggle should take effect quickly,
      // but a login tap should not pay for a round trip every time.
      next: { revalidate: 60 },
    })
    if (!response.ok) return fallback

    const settings = (await response.json()) as AuthSettings
    return settings.external?.[provider] === true
  } catch {
    return fallback
  }
}
