'use client'

import { useEffect, useState } from 'react'

import styles from './app-start-splash.module.css'

/**
 * Figma-exported asset, stored verbatim at public/brand/splash-loop-mark.svg —
 * the same file Figma produced for "[RT] Splash Loop Mark · Source 9:2 Exact"
 * (frames 59:2 / 59:10 / 59:18), so geometry, colour, opacity and stroke width
 * are the export itself rather than a transcription.
 *
 * This is NOT the brand mark in public/brand/loop-mark.svg, which is exact to
 * nodes 3:9 + 3:10 and drives Journey and the PWA icons. Two different marks
 * exist in Figma; both are kept unmodified.
 */
const LOOP_MARK_SRC = '/brand/splash-loop-mark.svg'
const LOOP_MARK_WIDTH = 69.12
const LOOP_MARK_HEIGHT = 91.3344

/**
 * Splash timing v2 (Issue #19). The Owner asked for roughly double the
 * perceived duration. The extension is entirely animation: the tagline reveal
 * now starts at 360ms and runs 600ms, finishing exactly as the sequence ends,
 * so there is no dead frame and no artificial minimum-exposure hold — the
 * splash still leaves as soon as its own animation is done.
 *
 *   0–360ms    RETURN and the mark are visible; tagline at opacity 0
 *   360–960ms  tagline opacity 0→1, translateY 6→0
 *   960–1100ms fade out
 */
const SEQUENCE_END_MS = 960
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOOP_MARK_SRC}
            alt=""
            aria-hidden="true"
            className={styles.mark}
            width={LOOP_MARK_WIDTH}
            height={LOOP_MARK_HEIGHT}
            fetchPriority="high"
            decoding="sync"
          />
          <div className={styles.wordmark}>RETURN</div>
          <div className={styles.tagline}>다시 하나님께로</div>
        </div>
      </div>
    </div>
  )
}
