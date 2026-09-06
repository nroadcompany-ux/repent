import 'server-only'

/**
 * Server-only environment access.
 *
 * Split out of ./env.ts on purpose. `env.ts` is imported by the browser
 * Supabase client, so anything living there ends up in the client bundle —
 * even a `process.env.SECRET_NAME` lookup that Next.js compiles down to
 * `undefined` still leaves the variable NAME in shipped JavaScript, and a
 * feature flag evaluated there would read as false no matter how the server is
 * configured.
 *
 * `import 'server-only'` makes importing this file from a Client Component a
 * build error, so the boundary is enforced by the compiler rather than by
 * convention.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    // Names only. Never the value.
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function serverEnv() {
  return {
    serviceRoleKey: () =>
      required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    naverClientId: () => required('NAVER_CLIENT_ID', process.env.NAVER_CLIENT_ID),
    naverClientSecret: () => required('NAVER_CLIENT_SECRET', process.env.NAVER_CLIENT_SECRET),
    anthropicApiKey: () => required('ANTHROPIC_API_KEY', process.env.ANTHROPIC_API_KEY),
  }
}

/**
 * Whether a provider is configured, so a surface can hide what cannot work yet
 * instead of offering a button that will fail. Reads only presence, never a
 * value, and is evaluated on the server.
 */
export const featureFlags = {
  naverLogin: Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
  aiAssist: Boolean(process.env.ANTHROPIC_API_KEY),
} as const
