import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

const component = read('src/components/splash/app-start-splash.tsx')
const styles = read('src/components/splash/app-start-splash.module.css')
const splashMark = read('public/brand/splash-loop-mark.svg')
const brandMark = read('src/components/brand/loop-mark.tsx')
const appLayout = read('app/(app)/layout.tsx')
const rootLayout = read('app/layout.tsx')
const rootPage = read('app/page.tsx')
const globals = read('app/globals.css')
const serviceWorker = read('public/sw.js')

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
  /**
   * PM correction 3: the mark ships as the exported asset FILE, referenced by
   * the component — not re-authored as inline JSX. The geometry below is the
   * Figma export byte-for-byte.
   */
  it('references the Loop Mark as a stored asset rather than re-drawn code', () => {
    expect(component).toContain("'/brand/splash-loop-mark.svg'")
    expect(component).toMatch(/<img[\s\S]{0,240}src=\{LOOP_MARK_SRC\}/)
    // No hand-authored path data anywhere in the splash component.
    expect(component).not.toMatch(/<path\b/)
    expect(component).not.toMatch(/\bd="M[\d.]/)
  })

  it('keeps the asset exact to Figma source 9:2', () => {
    expect(splashMark).toContain('viewBox="0 0 69.12 91.3344"')
    expect(splashMark).toContain('stroke="#A78BFA"')
    expect(splashMark).toContain('stroke-opacity="0.75"')
    expect(splashMark).toContain('stroke="#6C4CFF"')
    expect(splashMark).toContain('stroke-opacity="0.45"')
    expect((splashMark.match(/stroke-width="6\.89013"/g) ?? []).length).toBe(2)
    // Both exported path commands, unaltered.
    expect(splashMark).toContain('M29.8705 4.25511C35.6656 2.37215 42.2577 3.81129')
    expect(splashMark).toContain('M40.899 29.2282C45.8511 30.463 49.9573 34.5019')
    // Stored locally: Figma asset URLs expire after about a week.
    expect(splashMark).not.toContain('figma.com')
  })

  it('serves the mark from a path the service worker may cache', () => {
    // /brand/ is already on the allowlist, so the asset is offline-safe and
    // carries no member data.
    expect(serviceWorker).toContain("'/brand/'")
  })

  it('reserves the mark box so a late asset load cannot shift layout', () => {
    // Intrinsic size on the element plus an explicit CSS box at every size.
    expect(component).toContain('const LOOP_MARK_WIDTH = 69.12')
    expect(component).toContain('const LOOP_MARK_HEIGHT = 91.3344')
    expect(component).toContain('width={LOOP_MARK_WIDTH}')
    expect(component).toContain('height={LOOP_MARK_HEIGHT}')
    expect(styles).toMatch(/\.mark\s*\{[^}]*height:\s*88\.8px/)
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
    expect(component).not.toContain("'/brand/loop-mark.svg'")
  })

  /**
   * PM correction 1: the corrected Figma splash fill is #F5F1FF. The token set
   * already carries that exact value, so the splash uses the token rather than
   * a screen-local hex, and --color-canvas (#F7F7FA) is no longer the fill.
   */
  it('fills the splash with the corrected Figma background', () => {
    expect(globals).toContain('--color-accent-tint: #f5f1ff')
    expect(styles).toMatch(/\.splash\s*\{[\s\S]*?background:\s*var\(--color-accent-tint\)/)
    expect(styles).not.toMatch(/background:\s*var\(--color-canvas\)/)
  })

  /**
   * PM correction 2: Figma 55:2 specifies Inter Bold. Without the real 700
   * face the browser synthesises bold from 600, so 700 is loaded. Nothing
   * else in RETURN requests 700, so no other screen's type changes.
   */
  it('loads the real Inter 700 the wordmark asks for', () => {
    expect(styles).toMatch(/\.wordmark\s*\{[\s\S]*?font-weight:\s*700/)
    expect(rootLayout).toMatch(/weight:\s*\['400',\s*'500',\s*'600',\s*'700'\]/)
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
    expect(styles).toContain('var(--color-accent-tint)')
    expect(styles).toContain('var(--color-accent)')
    expect(styles).toContain('var(--color-ink-muted)')
    // Every colour comes from a token; the module declares no hex of its own.
    // (The #F5F1FF and #F7F7FA named in comments are prose, not declarations.)
    expect(styles.replace(/\/\*[\s\S]*?\*\//g, ' ')).not.toMatch(/#[0-9a-f]{3,8}/i)
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
