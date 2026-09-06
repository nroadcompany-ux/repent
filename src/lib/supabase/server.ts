import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { requirePublicEnv } from '../env'
import type { Database } from './database.types'

/**
 * Server-side Supabase client bound to the request's cookies.
 *
 * This client uses the anon key, so every query it makes is subject to Row
 * Level Security. Nothing in the app bypasses RLS except the explicitly
 * server-only admin client in ./admin.ts.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabaseAnonKey } = requirePublicEnv()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component: the middleware refreshes the
          // session cookie instead, so this is safe to ignore.
        }
      },
    },
  })
}

/** The signed-in user, or null. Never throws for an anonymous visitor. */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Guard for every authenticated route. Returns the user id and a client, or
 * redirects to the login screen.
 */
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return { supabase, user, userId: user.id }
}
