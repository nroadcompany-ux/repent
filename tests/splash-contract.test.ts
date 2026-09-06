import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

const component = read('src/components/splash/app-start-splash.tsx')
const styles = read('src/components/splash/app-start-splash.module.css')
const appLayout = read('app/(app)/layout.tsx')
const rootPage = read('app/page.tsx')

describe('Issue #18 — Owner-approved Splash C', () => {
  it('locks the only visible copy to RETURN and 다시 하나님께', () => {
    expect(component).toContain('>RETURN</div>')
    expect(component).toContain('>다시 하나님께</div>')
    expect(component).not.toMatch(/로딩|질문|설명문구|spinner/i)
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
    expect(styles).toContain('top: 47%')
    expect(styles).toContain('font-size: 36px')
    expect(styles).toContain('@media (min-width: 390px)')
    expect(styles).toContain('font-size: 38px')
    expect(styles).toContain('font-size: 16px')
    expect(styles).toContain('@media (min-width: 412px)')
    expect(styles).toContain('font-size: 40px')
    expect(styles).toContain('safe-area-inset-top')
    expect(styles).toContain('safe-area-inset-bottom')
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
