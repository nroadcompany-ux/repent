'use client'

import { useEffect } from 'react'

/**
 * Registers the Service Worker.
 *
 * Runs after load so registration never competes with the first paint, and
 * fails silently — a browser without Service Worker support, or a refused
 * registration, must not affect the app.
 *
 * No install prompt UI: the Owner directive asks for the browser's own install
 * affordance, not an in-app banner.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Registration is an enhancement; the app works without it.
      })
    }

    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  return null
}
