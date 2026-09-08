import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * ADMIN PREP (Owner rule 2026-09-08).
 *
 * Nothing here implements an admin surface — none is being built. These markers
 * exist so that when the admin package IS designed, its first deliverable (the
 * full Admin Candidate list) can be produced mechanically from the source
 * rather than by re-reading every screen and guessing.
 *
 * The rule the Owner set is a governance boundary: 운영 문구 is Admin-managed,
 * 제품 의미 is Owner Decision / Product Lock, and the two must not be mixed.
 * These assertions are what stops them mixing.
 */

const ROOT = process.cwd()

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

const sources = [...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'src'))].map((file) => ({
  file: file.slice(ROOT.length + 1).split(/[\\/]/).join('/'),
  text: readFileSync(file, 'utf8'),
}))

const CANDIDATE = /\[ADMIN CANDIDATE(?: — OWNER CONFLICT)?\]\s+([a-z][a-zA-Z0-9.]*)/g
const LOCKED = /\[PRODUCT LOCK — NOT ADMIN\]\s*(?:([a-z][a-zA-Z0-9.]*))?/g

function collect(pattern: RegExp) {
  const found: { key: string; file: string }[] = []
  for (const { file, text } of sources) {
    for (const match of text.matchAll(new RegExp(pattern.source, 'g'))) {
      if (match[1]) found.push({ key: match[1], file })
    }
  }
  return found
}

const candidates = collect(CANDIDATE)
const locked = collect(LOCKED)

describe('Admin candidates are marked, not implemented', () => {
  it('implements no admin surface yet', () => {
    // The Owner deferred this to a separate package. Nothing may pre-empt it.
    expect(readdirSync(join(ROOT, 'app')).some((entry) => entry === 'admin')).toBe(false)
    for (const { file, text } of sources) {
      expect(text, file).not.toContain('app_content')
      expect(text, file).not.toContain('/admin/content')
    }
    const migrations = readdirSync(join(ROOT, 'supabase/migrations'))
    expect(migrations.filter((f) => f.endsWith('.sql')).length).toBe(11)
  })

  it('marks the operational copy the Owner named', () => {
    const keys = candidates.map((entry) => entry.key)
    for (const key of [
      'home.hero.slides',
      'repentance.hero.slides',
      'prayer.hero.slides',
      'promise.hero.slides',
      'splash.tagline',
    ]) {
      expect(keys, key).toContain(key)
    }
    expect(keys.length).toBeGreaterThanOrEqual(10)
  })

  it('gives every marker a unique dotted key', () => {
    const keys = candidates.map((entry) => entry.key)
    expect(new Set(keys).size, keys.join(' ')).toBe(keys.length)
    for (const key of keys) expect(key, key).toMatch(/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/)
  })
})

describe('Governance: 운영 문구 and 제품 의미 stay apart', () => {
  it('never marks the same thing as both', () => {
    const both = candidates.filter((entry) => locked.some((row) => row.key === entry.key))
    expect(both.map((entry) => entry.key)).toEqual([])
  })

  it('keeps Product Lock out of admin reach', () => {
    const lock = sources.find((entry) => entry.file === 'src/domain/product-lock.ts')
    expect(lock?.text).toContain('[PRODUCT LOCK — NOT ADMIN]')
    expect(lock?.text).not.toContain('[ADMIN CANDIDATE]')
  })

  it('leaves the canonical guardrail sentences locked', () => {
    // Each states a product invariant, not a tone of voice. An operator editing
    // one of these would be changing what RETURN means, not how it reads.
    const guarded: [string, string][] = [
      ['app/(app)/promise/page.tsx', '기록하지 않은 날은 비어 있을 뿐, 잘못한 날이 아닙니다.'],
      ['app/(app)/promise/[id]/page.tsx', '신앙을 재는 숫자가 아닙니다'],
    ]
    for (const [file, sentence] of guarded) {
      const source = sources.find((entry) => entry.file === file)
      expect(source?.text, file).toContain(sentence)
      const at = source!.text.indexOf(sentence)
      expect(source!.text.slice(Math.max(0, at - 400), at), file).toContain(
        '[PRODUCT LOCK — NOT ADMIN]',
      )
    }
  })

  it('records the splash tagline as an unresolved Owner conflict', () => {
    // ADMIN CONTENT §1 lists it as an admin target; §2 excludes Canonical Owner
    // Decisions, and this string is one, locked by splash-contract.test.ts.
    // Reported, not silently decided either way.
    const splash = sources.find((entry) =>
      entry.file.endsWith('components/splash/app-start-splash.tsx'),
    )
    expect(splash?.text).toContain('[ADMIN CANDIDATE — OWNER CONFLICT] splash.tagline')
    expect(splash?.text).toContain('다시 하나님께로')
  })
})
