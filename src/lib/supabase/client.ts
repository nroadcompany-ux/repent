'use client'

import { createBrowserClient } from '@supabase/ssr'

import { requirePublicEnv } from '../env'
import type { Database } from './database.types'

/**
 * Browser Supabase client. Uses the anon key only, so every request it makes is
 * still enforced by Row Level Security. No service-role key or AI key is ever
 * reachable from here.
 */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = requirePublicEnv()
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
