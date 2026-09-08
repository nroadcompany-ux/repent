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
 * Splash timing v3 (Owner decision 2026-09-08). Roughly double the v2 duration:
 * about 2.2s, structured as 등장 → 인지 → Fade Out.
 *
 *   0–600ms      Loop Mark and RETURN are visible; tagline at opacity 0
 *   600–1200ms   tagline reveal, opacity 0→1 and translateY 6→0
 *   1200–2000ms  인지 — the finished frame holds
 *   2000–2200ms  fade out
 *
 * The hold is deliberate here. v2 forbade any dwell after the animation; this
 * decision supersedes that, so the tagline animation ends before the sequence
 * does and `fill: both` keeps the final frame on screen for the hold.
 * Still no spinner and no loading copy.
 */
const SEQUENCE_END_MS = 2000
const FADE_OUT_MS = 200

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
          {/* [PRODUCT LOCK — NOT ADMIN] splash.wordmark */}
          <div className={styles.wordmark}>RETURN</div>
          {/*
            [PRODUCT LOCK — NOT ADMIN] splash.tagline
            Owner decision 2026-09-08: Admin Candidate에서 제외하고 Product Lock으로
            유지. Owner Final Correction 2026-09-06으로 확정된 Canonical Copy이며
            splash-contract.test.ts가 잠급니다.
          */}
          <div className={styles.tagline}>다시 하나님께로</div>
        </div>
      </div>
    </div>
  )
}
