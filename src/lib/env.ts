/**
 * Public environment access.
 *
 * This module is imported by the browser Supabase client, so it must contain
 * ONLY values that are safe to ship to the browser. Every privileged name —
 * SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, NAVER_CLIENT_SECRET — lives in
 * ./env.server.ts behind `server-only`, so it cannot reach a client bundle even
 * as a bare identifier.
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

/**
 * Absolute site origin, used to build OAuth redirect URLs.
 * Falls back to the Vercel-provided host so a preview deployment works without
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
