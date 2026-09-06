'use client'

import { useEffect, useState } from 'react'

import styles from './app-start-splash.module.css'

const SEQUENCE_END_MS = 420
const FADE_OUT_MS = 140

type SplashPhase = 'active' | 'exiting' | 'done'

/**
 * Owner-approved app-start Splash C.
 *
 * Mounted in the shared authenticated app layout so it appears once on a
 * full app entry while the layout persists across internal route changes.
 * The server layout has already completed auth/onboarding readiness before
 * this client layer is delivered, so there is no artificial hold after the
 * approved 0–420ms sequence.
 */
export function AppStartSplash() {
  const [phase, setPhase] = useState<SplashPhase>('active')

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      const frame = window.requestAnimationFrame(() => setPhase('done'))
      return () => window.cancelAnimationFrame(frame)
    }

    const exitTimer = window.setTimeout(() => setPhase('exiting'), SEQUENCE_END_MS)
    return () => window.clearTimeout(exitTimer)
  }, [])

  useEffect(() => {
    if (phase !== 'exiting') return

    const removeTimer = window.setTimeout(() => setPhase('done'), FADE_OUT_MS)
    return () => window.clearTimeout(removeTimer)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      aria-hidden="true"
      className={`${styles.splash} ${phase === 'exiting' ? styles.exiting : ''}`}
    >
      <div className={styles.stage}>
        <div className={styles.lockup}>
          <div className={styles.wordmark}>RETURN</div>
          <div className={styles.tagline}>다시 하나님께</div>
        </div>
      </div>
    </div>
  )
}
