import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { requirePublicEnv, serverEnv } from '../env'
import type { Database } from './database.types'

/**
 * Service-role Supabase client. BYPASSES Row Level Security.
 *
 * The `server-only` import above makes importing this file from a Client
 * Component a build error, so the key can never be bundled for the browser.
 *
 * Only two call sites are allowed to use it:
 *   1. app/auth/naver/callback — Supabase Auth has no Naver provider, so the
 *      bridge has to create/link the auth user itself.
 *   2. Moderation actions (docs/08), which by definition act on another
 *      member's row and therefore cannot run under that member's RLS.
 *
 * Anything else must use the RLS-bound client in ./server.ts.
 */
export function createAdminClient() {
  const { supabaseUrl } = requirePublicEnv()
  return createSupabaseClient<Database>(supabaseUrl, serverEnv().serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
