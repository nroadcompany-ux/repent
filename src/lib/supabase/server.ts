import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { requirePublicEnv } from '../env'
import type { Database } from './database.types'

/**
 * Server-side Supabase client bound to the request's cookies.
 *
 * This client uses the anon key, so every query it makes is subject to Row
 * Level Security. Nothing in the app bypasses RLS except the explicitly
 * server-only admin client in ./admin.ts.
 */
export const createClient = cache(async () => {
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
})

/**
 * The signed-in user, or null. Never throws for an anonymous visitor.
 *
 * Wrapped in React `cache` because `auth.getUser()` is a network round trip to
 * Supabase, and a single page render asks for the user more than once — the
 * (app) layout checks the onboarding gate and the page itself calls
 * requireUser(). Without this the same journey costs two crossings to the
 * Supabase region instead of one.
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Guard for every authenticated route. Returns the user id and a client, or
 * redirects to the login screen.
 */
export async function requireUser() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  return { supabase, user, userId: user.id }
}
