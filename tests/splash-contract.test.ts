import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

const component = read('src/components/splash/app-start-splash.tsx')
const styles = read('src/components/splash/app-start-splash.module.css')
const splashMark = read('src/components/splash/splash-loop-mark.tsx')
const brandMark = read('src/components/brand/loop-mark.tsx')
const appLayout = read('app/(app)/layout.tsx')
const rootPage = read('app/page.tsx')

describe('Issue #18 — Owner-approved Splash C', () => {
  /**
   * Owner Final Correction 2026-09-06 superseded 다시 하나님께 with 다시 하나님께로.
   * The old string must not survive anywhere in the splash package.
   */
  it('locks the only visible copy to RETURN and 다시 하나님께로', () => {
    expect(component).toContain('>RETURN</div>')
    expect(component).toContain('>다시 하나님께로</div>')
    expect(component).not.toMatch(/로딩|질문|설명문구|spinner/i)
  })

  it('no longer renders the superseded tagline', () => {
    // `다시 하나님께로` contains `다시 하나님께`, so match the rendered element.
    expect(component).not.toContain('>다시 하나님께<')
  })

  it('implements the approved motion timing without an extra hold', () => {
    expect(component).toContain('const SEQUENCE_END_MS = 420')
    expect(component).toContain('const FADE_OUT_MS = 140')
    expect(styles).toContain('240ms ease-out 180ms')
    expect(styles).toContain('translateY(6px)')
    expect(styles).toContain('transition: opacity 140ms ease-out')
  })

  it('respects reduced motion', () => {
    expect(component).toContain("matchMedia('(prefers-reduced-motion: reduce)')")
    expect(component).toContain("requestAnimationFrame(() => setPhase('done'))")
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('uses the Figma-approved responsive sizes and center axis', () => {
    expect(styles).toContain('font-size: 36px')
    expect(styles).toContain('@media (min-width: 390px)')
    expect(styles).toContain('font-size: 38px')
    expect(styles).toContain('font-size: 16px')
    expect(styles).toContain('@media (min-width: 412px)')
    expect(styles).toContain('font-size: 40px')
    expect(styles).toContain('safe-area-inset-top')
    expect(styles).toContain('safe-area-inset-bottom')
  })

  /**
   * Owner Final Correction: the mark must stay exact to Figma node 9:2, whose
   * splash export is the two paths below. The project's brand LoopMark is a
   * different artwork (3:9 + 3:10 — a true circle plus a rotated leaf), so it
   * must NOT be substituted here.
   */
  it('renders the Loop Mark exactly as exported from Figma source 9:2', () => {
    expect(component).toContain('<SplashLoopMark')
    // Exported viewBox and stroke spec, verbatim.
    expect(splashMark).toContain('viewBox="0 0 69.12 91.3344"')
    expect(splashMark).toContain('stroke="#A78BFA"')
    expect(splashMark).toContain('strokeOpacity="0.75"')
    expect(splashMark).toContain('stroke="#6C4CFF"')
    expect(splashMark).toContain('strokeOpacity="0.45"')
    expect((splashMark.match(/strokeWidth="6\.89013"/g) ?? []).length).toBe(2)
    // Both exported path commands, unaltered.
    expect(splashMark).toContain('M29.8705 4.25511C35.6656 2.37215 42.2577 3.81129')
    expect(splashMark).toContain('M40.899 29.2282C45.8511 30.463 49.9573 34.5019')
    // Inlined, not linked: Figma asset URLs expire.
    expect(splashMark).not.toContain('figma.com')
  })

  it('does not redraw or substitute the brand Loop Mark', () => {
    // The Journey/PWA mark keeps its own 3:9 + 3:10 geometry, untouched.
    for (const attribute of ['cx="39.84"', 'cy="35"', 'r="31"', 'stroke="#8A67F7"']) {
      expect(brandMark, attribute).toContain(attribute)
    }
    expect(brandMark).toContain('translate(34.43 55.5) rotate(24) translate(-23 -33)')
    // The splash does not pull in that different artwork.
    expect(component).not.toContain("from '@/components/brand/loop-mark'")
    expect(component).not.toContain('<LoopMark')
  })

  it('sizes the mark per Figma frame at each target viewport', () => {
    // 360 / 390 / 412 mark boxes from frames 59:2, 59:10, 59:18.
    expect(styles).toContain('width: 67.2px')
    expect(styles).toContain('width: 69.12px')
    expect(styles).toContain('width: 72px')
    // Placed above the wordmark, never overlapping it.
    expect(styles).toMatch(/\.mark\s*\{[^}]*margin:\s*0 auto/)
    expect(component.indexOf('SplashLoopMark className')).toBeLessThan(
      component.indexOf('styles.wordmark'),
    )
  })

  it('reuses RETURN design tokens instead of screen-local color values', () => {
    expect(styles).toContain('var(--color-canvas)')
    expect(styles).toContain('var(--color-accent)')
    expect(styles).toContain('var(--color-ink-muted)')
    expect(styles).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('mounts once in the persistent signed-in layout, not in the root redirect', () => {
    expect((appLayout.match(/<AppStartSplash \/>/g) ?? []).length).toBe(1)
    expect(rootPage).not.toContain('AppStartSplash')
    expect(rootPage).toContain("redirect('/journey')")
  })

  it('preserves the existing auth, onboarding, and bottom-nav gates', () => {
    expect(appLayout).toContain('requireUser()')
    expect(appLayout).toContain(".select('onboarding_completed_at')")
    expect(appLayout).toContain("redirect('/onboarding')")
    expect(appLayout).toContain('<BottomNav />')
  })
})
