import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { CONFESSION_TYPE_LABELS, PROMISE_CLOSE_LABEL } from '../src/domain/product-lock'
import {
  PROMISE_FILTERS,
  PROMISE_FILTER_LABELS,
  matchesPromiseFilter,
  promiseFilter,
} from '../src/domain/promise'

/**
 * Issue #19 — Owner UX Safe Package.
 *
 * Everything here was cleared as implementable without new Product Meaning and
 * without a migration, so these tests pin exactly that: the behaviour changed,
 * the meaning did not.
 */

const ROOT = join(__dirname, '..')
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8')

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

describe('sticky header (Issue #19 §3)', () => {
  const MAIN_SURFACES = [
    'app/(app)/journey/page.tsx',
    'app/(app)/prayer/page.tsx',
    'app/(app)/repentance/page.tsx',
    'app/(app)/promise/page.tsx',
    'app/(app)/confession/page.tsx',
  ]

  it('keeps the app bar visible on all five main surfaces', () => {
    for (const file of MAIN_SURFACES) {
      const code = stripComments(read(file))
      expect(code, file).toMatch(/<AppHeader\s[\s\S]{0,80}?sticky|<AppHeader\s+sticky/)
    }
  })

  it('never makes a write or detail header sticky', () => {
    // PageHeader is the sub-page header; a sticky one would collide with the
    // on-screen keyboard on the writing surfaces.
    const header = read('src/components/layout/app-header.tsx')
    const pageHeader = header.slice(header.indexOf('export function PageHeader'))
    expect(pageHeader).not.toContain('sticky')
  })

  it('stacks below the splash and above the bottom nav', () => {
    const header = read('src/components/layout/app-header.tsx')
    const nav = read('src/components/layout/bottom-nav.tsx')
    const splash = read('src/components/splash/app-start-splash.module.css')
    expect(header).toContain('z-40')
    expect(nav).toContain('z-30')
    expect(splash).toContain('z-index: 100')
    // The sticky bar must respect the notch.
    expect(header).toContain('env(safe-area-inset-top)')
  })
})

describe('return path hardening (Issue #19 §1)', () => {
  const DOMAIN_ACTIONS = [
    'app/(app)/confession/vote-actions.ts',
    'app/(app)/journey/actions.ts',
    'app/(app)/promise/actions.ts',
  ]

  it('sends every form-supplied return path through the existing guard', () => {
    for (const file of DOMAIN_ACTIONS) {
      const code = read(file)
      expect(code, file).toContain("from '@/lib/auth/safe-path'")
      // No raw `text(form, 'return_to')` may reach a fallback un-guarded.
      expect(code, file).not.toMatch(/=\s*text\(form,\s*'return_to'\)\s*\|\|/)
    }
  })

  it('guards every return path in the repo, not just some of them', () => {
    for (const file of DOMAIN_ACTIONS) {
      const code = read(file)
      const uses = code.match(/text\(form,\s*'return_to'\)/g)?.length ?? 0
      const guarded = code.match(/safeReturnPath\(text\(form,\s*'return_to'\)\)/g)?.length ?? 0
      expect(guarded, file).toBe(uses)
    }
  })

  it('does not broaden what the guard accepts', () => {
    const guard = read('src/lib/auth/safe-path.ts')
    expect(guard).toContain("if (!cleaned.startsWith('/')) return null")
    // The doc comment names `https://evil.example` to say it is rejected, so
    // only real code is checked here.
    expect(stripComments(guard)).not.toMatch(/allowedOrigins|https?:\/\//)
  })
})

describe('segmented links accessibility (Issue #19 §2)', () => {
  const control = read('src/components/ui/segmented-links.tsx')

  it('uses navigation semantics instead of an unimplemented tab widget', () => {
    expect(control).toContain("aria-current={selected ? 'page' : undefined}")
    // Comments stripped: the doc comment names the old roles to record why
    // they were removed, which is not the same as rendering them.
    const rendered = stripComments(control)
    expect(rendered).not.toContain('role="tablist"')
    expect(rendered).not.toContain('role="tab"')
    expect(rendered).not.toContain('aria-selected')
  })

  it('can name the group of links for assistive tech', () => {
    expect(control).toContain('aria-label={label}')
    // Both filter surfaces name their control.
    expect(stripComments(read('app/(app)/confession/page.tsx'))).toContain('label="고백 유형 필터"')
    expect(stripComments(read('app/(app)/promise/page.tsx'))).toContain('label="약속 상태 필터"')
  })
})

describe('promise four-state filter (Issue #19 §6)', () => {
  const today = '2026-09-07'

  it('offers exactly the four approved states', () => {
    expect([...PROMISE_FILTERS]).toEqual(['active', 'upcoming', 'closed', 'all'])
    expect(PROMISE_FILTER_LABELS.active).toBe('진행 중')
    expect(PROMISE_FILTER_LABELS.upcoming).toBe('예정')
    expect(PROMISE_FILTER_LABELS.all).toBe('전체')
    // docs/04 fixes the finished wording; the filter does not rename it.
    expect(PROMISE_FILTER_LABELS.closed).toBe(PROMISE_CLOSE_LABEL)
  })

  it('derives 진행 중 / 예정 from state and started_on alone', () => {
    const started = { state: 'active' as const, started_on: '2026-09-01' }
    const future = { state: 'active' as const, started_on: '2026-09-20' }
    const done = { state: 'closed' as const, started_on: '2026-08-01' }

    expect(matchesPromiseFilter(started, 'active', today)).toBe(true)
    expect(matchesPromiseFilter(future, 'active', today)).toBe(false)
    expect(matchesPromiseFilter(future, 'upcoming', today)).toBe(true)
    expect(matchesPromiseFilter(started, 'upcoming', today)).toBe(false)
    expect(matchesPromiseFilter(done, 'closed', today)).toBe(true)
    expect(matchesPromiseFilter(done, 'active', today)).toBe(false)
    for (const row of [started, future, done]) {
      expect(matchesPromiseFilter(row, 'all', today)).toBe(true)
    }
  })

  it('treats a promise starting today as 진행 중, not 예정', () => {
    const startsToday = { state: 'active' as const, started_on: today }
    expect(matchesPromiseFilter(startsToday, 'active', today)).toBe(true)
    expect(matchesPromiseFilter(startsToday, 'upcoming', today)).toBe(false)
  })

  it('never reads a closed promise as upcoming', () => {
    const closedFuture = { state: 'closed' as const, started_on: '2026-12-01' }
    expect(matchesPromiseFilter(closedFuture, 'upcoming', today)).toBe(false)
  })

  it('falls back to 진행 중 on a missing or unknown filter', () => {
    for (const value of [undefined, null, '', 'nonsense', 'ACTIVE']) {
      expect(promiseFilter(value)).toBe('active')
    }
    for (const value of PROMISE_FILTERS) expect(promiseFilter(value)).toBe(value)
  })

  it('adds no column and no migration for the new state', () => {
    const domain = read('src/domain/promise.ts')
    expect(domain).not.toMatch(/upcoming.*column|add column/i)
    const page = read('app/(app)/promise/page.tsx')
    // The query composes the state from what the row already stores.
    expect(page).toContain("query.eq('state', 'active').gt('started_on', today)")
    expect(page).toContain("query.eq('state', 'active').lte('started_on', today)")
  })

  it('keeps group labels as the member own rows, never renamed', () => {
    const page = read('app/(app)/promise/page.tsx')
    expect(page).toContain("supabase.from('promise_groups')")
    expect(page).toContain('label: group.name')
    // No hardcoded group taxonomy on the screen.
    for (const invented of ['관계', '신앙']) {
      expect(stripComments(page)).not.toContain(`label: '${invented}'`)
    }
  })

  it('presents state and group as one panel with the combined result', () => {
    const page = stripComments(read('app/(app)/promise/page.tsx'))
    expect(page).toContain('aria-label="약속 필터"')
    expect(page).toContain('PROMISE_FILTER_LABELS[filter]')
    expect(page).toContain('개`}')
  })
})

describe('confession feed (Issue #19 §5)', () => {
  const feed = read('app/(app)/confession/page.tsx')

  it('keeps the taxonomy identical to the database enum, defaulting to 전체', () => {
    expect(feed).toContain('CONFESSION_TYPE_LABELS')
    expect(Object.values(CONFESSION_TYPE_LABELS)).toEqual(['기도', '고백', '은혜', '일상'])
    expect(feed).toContain("{ value: '', label: '전체' }")
    // Empty type is the default, so the feed opens on 전체.
    expect(feed).toMatch(/typeParam\s*\?\?\s*''/)
  })

  it('puts the filter at the upper right with the selection as the pill', () => {
    expect(feed).toContain('align="end"')
    expect(feed).toContain('active={activeType}')
  })

  it('keeps every seed example UI-only and unpersisted', () => {
    expect(feed.match(/id: 'sample-\d\d'/g)?.length).toBe(10)
    expect(feed).toContain('RETURN 예시')
    // Samples are a module constant, never inserted or selected.
    const sampleBlock = feed.slice(feed.indexOf('const SAMPLE_POSTS'), feed.indexOf('function SampleReactionRow'))
    expect(sampleBlock).not.toMatch(/supabase|insert|from\(/)
  })

  it('gives every seed three to seven lines', () => {
    const bodies = [...feed.matchAll(/body:\s*'([^']*)'/g)].map((match) => match[1] as string)
    expect(bodies.length).toBe(10)
    for (const body of bodies) {
      const lines = body.split('\\n').length
      expect(lines, body.slice(0, 24)).toBeGreaterThanOrEqual(3)
      expect(lines, body.slice(0, 24)).toBeLessThanOrEqual(7)
    }
  })

  it('shows zeroed counts on the example row', () => {
    const sampleRow = feed.slice(feed.indexOf('function SampleReactionRow'))
    for (const icon of ['👍', '👎', '💬']) {
      expect(sampleRow.slice(0, 800)).toMatch(new RegExp(`\\['${icon}', 0,`))
    }
  })

  it('renders the reaction row achromatically without changing the glyphs', () => {
    const bar = read('app/(app)/confession/_components/reaction-bar.tsx')
    // Canonical glyphs untouched; colour removed in CSS.
    expect(bar).toContain('CONFESSION_VOTE_ICONS')
    expect(bar.match(/grayscale/g)?.length).toBe(2)
    expect(feed).toContain('grayscale')
    // Selected state is ink, not accent — no reaction is highlighted.
    expect(bar).toContain("selected ? 'bg-line text-ink' : 'text-ink-muted'")
    expect(bar).not.toContain('bg-accent-tint')
  })

  it('still ignores superseded reaction rows', () => {
    const tally = read('src/domain/confession-reactions.ts')
    expect(tally).toContain('if (!isLiveVote(row.type)) continue')
  })
})

describe('scope discipline (Issue #19 Forbidden)', () => {
  it('adds no migration', () => {
    const { readdirSync } = require('node:fs') as typeof import('node:fs')
    const migrations = readdirSync(join(ROOT, 'supabase/migrations')).filter((f) =>
      f.endsWith('.sql'),
    )
    expect(migrations.length).toBe(10)
    expect(migrations.some((f) => f.startsWith('0011'))).toBe(false)
  })

  it('does not implement Journey automatic related-record linking', () => {
    const journey = read('src/data/journey.ts')
    const graph = read('app/(app)/journey/graph/page.tsx')
    for (const code of [journey, graph]) {
      expect(code).not.toMatch(/related(Prayer|Repentance|Promise)|linkedRecords/)
    }
  })

  it('adds no My Page item that has no backend', () => {
    const settings = read('app/(app)/settings/page.tsx')
    for (const missing of ['내보내기', '탈퇴', '알림 설정']) {
      expect(settings, missing).not.toContain(missing)
    }
  })
})
