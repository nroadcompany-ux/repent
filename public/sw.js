/*
 * RETURN Service Worker — deliberately minimal.
 *
 * PRIVACY BOUNDARY (Owner directive, PWA MVP §6 / §13)
 * This worker must never place a member's records or their session anywhere a
 * later visitor to the same device could read them. It therefore caches ONLY
 * build-immutable static assets, and it does so by an allowlist rather than by
 * excluding known-bad paths — anything not explicitly listed goes to the
 * network and is never stored.
 *
 * Never cached, by construction:
 *   · every HTML document (all pages are user-specific and force-dynamic)
 *   · /auth/*  — sign-in, callbacks, sign-out
 *   · /api/*   — any private response
 *   · Supabase requests — a different origin, so not same-origin cacheable
 *   · Prayer / Repentance / Promise / Confession / Profile data
 *
 * No offline write, no background sync, no push. Those are HOLD.
 */

const VERSION = 'return-v1'
const STATIC_CACHE = `${VERSION}-static`
const OFFLINE_URL = '/offline'

/** Only these prefixes may ever enter the cache. All are content-hashed or brand assets. */
const CACHEABLE_PREFIXES = ['/_next/static/', '/icons/', '/brand/']

function isCacheableAsset(url) {
  return (
    url.origin === self.location.origin &&
    CACHEABLE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only ever touch GET. A POST carries a record or a credential.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Navigations: always the network, so a member never sees another member's
  // page or a stale one of their own. On failure, show the offline notice.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE)
        return (await cache.match(OFFLINE_URL)) ?? Response.error()
      }),
    )
    return
  }

  // Static assets: cache-first. These are content-hashed, so a hit is always
  // the right bytes and there is nothing personal in them.
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            if (response.ok && response.type === 'basic') {
              const copy = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
    return
  }

  // Everything else — auth routes, API calls, Supabase, RSC payloads — falls
  // through to the network untouched and is never stored.
})
