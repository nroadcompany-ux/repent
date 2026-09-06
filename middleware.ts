import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase session cookie on every navigation and enforces the
 * authentication boundary before a page is ever rendered.
 *
 * Route classes:
 *   PUBLIC  — /login, /auth/*, static assets
 *   GATED   — everything else: requires a signed-in user
 * The onboarding gate itself lives in the app layout, because it needs to read
 * the profile row (which middleware deliberately does not do — one auth call
 * per request keeps navigation fast).
 */

const PUBLIC_PREFIXES = ['/login', '/auth', '/legal', '/offline']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Without Supabase configured there is nothing to refresh; let the page
  // render its own configuration notice rather than failing the request.
  if (!supabaseUrl || !supabaseAnonKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    // Preserve where the user was heading so login can return them there.
    if (pathname !== '/') loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/journey'
    homeUrl.search = ''
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  // PWA plumbing is excluded outright: a Service Worker and a manifest must be
  // reachable with no session, and a redirect on /sw.js would break install.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|icons/|brand/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)',
  ],
}
