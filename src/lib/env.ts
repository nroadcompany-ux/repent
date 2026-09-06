/**
 * Environment access.
 *
 * Security boundary (Owner execution order):
 *   - SERVICE_ROLE_KEY and ANTHROPIC_API_KEY must never reach the client
 *     bundle. They are read through `serverEnv()`, which throws if it is ever
 *     evaluated in the browser, so an accidental client import fails loudly at
 *     runtime instead of silently shipping a secret.
 *   - Only NEXT_PUBLIC_* values are readable from the browser.
 *   - No secret value is ever logged, echoed, or included in an error message.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    // Names only. Never the value.
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '',
}

export function requirePublicEnv() {
  return {
    supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL', publicEnv.supabaseUrl),
    supabaseAnonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY', publicEnv.supabaseAnonKey),
  }
}

export function serverEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() was called in the browser. Server secrets must stay server-side.')
  }
  return {
    serviceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    naverClientId: () => required('NAVER_CLIENT_ID', process.env.NAVER_CLIENT_ID),
    naverClientSecret: () => required('NAVER_CLIENT_SECRET', process.env.NAVER_CLIENT_SECRET),
    anthropicApiKey: () => required('ANTHROPIC_API_KEY', process.env.ANTHROPIC_API_KEY),
  }
}

/** True when a provider is configured, so the UI can hide what cannot work yet. */
export const featureFlags = {
  naverLogin: Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
  aiAssist: Boolean(process.env.ANTHROPIC_API_KEY),
} as const

/**
 * Absolute site origin, used to build OAuth redirect URLs.
 * Falls back to the Vercel-provided URL so preview deployments work without
 * an extra variable.
 */
export function siteOrigin(): string {
  if (publicEnv.siteUrl) return publicEnv.siteUrl.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
