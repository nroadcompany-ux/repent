import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * RETURN Visual Migration — prototype/return-visual-v1.
 *
 * Owner decision 2026-09-08 (PRE-IMPLEMENTATION GATE / GO). Every assertion
 * here locks a screen decision the Owner made, so that a later pass cannot
 * quietly restore the superseded shape. Nothing here is a new product rule:
 * where a decision touches canonical copy or data it is recorded as [OPEN]
 * rather than changed.
 */

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

/** Comments name the superseded shapes in order to record their removal. */
function stripComments(source: string): string {
  return source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const repentance = read('app/(app)/repentance/page.tsx')
const journey = read('app/(app)/journey/page.tsx')
const journeyData = read('src/data/journey.ts')
const quickActions = read('src/components/journey/quick-actions.tsx')
const graph = read('src/components/journey/journey-graph.tsx')
const prayer = read('app/(app)/prayer/page.tsx')
const promise = read('app/(app)/promise/page.tsx')
const surface = read('src/components/ui/surface.tsx')
const header = read('src/components/layout/app-header.tsx')

describe('Step 6 — Repentance', () => {
  it('keeps 회개하기 as the one strong action', () => {
    expect(repentance).toContain('<ButtonLink href="/repentance/write">회개하기</ButtonLink>')
    // The CTA comes before anything about drafts.
    expect(repentance.indexOf('회개하기')).toBeLessThan(repentance.indexOf('작성 중인 기록'))
  })

  it('collapses drafts into one row that expands in place', () => {
    expect(repentance).toContain('작성 중인 기록 {drafts.length}개')
    expect(repentance).toContain('<details')
    expect(repentance).toContain('<summary')
    // In place: no new route, and no client component for the disclosure.
    expect(repentance).not.toContain("'use client'")
    expect(repentance).not.toContain('/repentance/drafts')
  })

  it('renders nothing at all when there is no draft', () => {
    expect(repentance).toContain('{drafts.length > 0 ? (')
    // The three 예시 placeholder rows are gone with it.
    expect(stripComments(repentance)).not.toContain('ExamplePill')
    expect(stripComments(repentance)).not.toContain('예시')
  })

  it('names the history 나의 회개 기록 and leads each row with the title', () => {
    expect(repentance).toContain('title="나의 회개 기록"')
    expect(stripComments(repentance)).not.toContain('지난 기록')
    expect(repentance).toMatch(/<RecordRow[\s\S]{0,200}title=\{record\.title/)
  })
})

describe('Step 7 — Journey home', () => {
  it('replaces the 오늘 summary rows with 나의 기록 quick actions', () => {
    expect(journey).toContain('title="나의 기록"')
    expect(journey).toContain('<JourneyQuickActions />')
    const body = stripComments(journey)
    expect(body).not.toContain('title="오늘"')
    expect(body).not.toContain('<InfoRow')
    expect(body).not.toContain('ExamplePill')
  })

  it('offers exactly the four approved entries', () => {
    for (const label of ['말씀노트', '성경통독', '신앙일기', '캘린더']) {
      expect(quickActions, label).toContain(`label: '${label}'`)
    }
    expect((quickActions.match(/label: '/g) ?? []).length).toBe(4)
  })

  it('ships 신앙일기 as a disabled placeholder, not a working feature', () => {
    // Owner SOURCE GAP decision: PROTOTYPE PLACEHOLDER. No route, no action.
    expect(quickActions).toMatch(/label: '신앙일기'[^}]*pending: true/)
    expect(quickActions).not.toMatch(/label: '신앙일기'[^}]*href/)
    expect(quickActions).toContain('aria-disabled="true"')
    expect(quickActions).toContain('준비 중')
    expect(quickActions).not.toContain('/journey/diary')
    expect(quickActions).not.toContain('faith_diary')
  })

  it('points the other three at routes that already exist', () => {
    for (const href of ['/journey/scripture', '/journey/bible', '/journey/calendar']) {
      const route = join(process.cwd(), 'app/(app)', href.replace('/journey/', 'journey/'), 'page.tsx')
      expect(statSync(route).isFile(), href).toBe(true)
    }
  })

  it('offers 월 / 분기 / 연 as real links over the same data', () => {
    for (const label of ['월', '분기', '연']) {
      expect(journeyData).toContain(`'${label}'`)
    }
    expect(journey).toContain('<SegmentedLinks')
    expect(journey).toContain('journeyPeriod(periodParam)')
    expect(journey).toContain('JOURNEY_PERIOD_DAYS[period]')
    // A period is a read window: it is never written anywhere.
    expect(stripComments(journeyData)).not.toMatch(/\.(insert|update|upsert)\(/)
  })

  it('lists 최근 여정 기록 outside the selected window', () => {
    expect(journey).toContain('title="최근 여정 기록"')
    expect(journey).toContain('home.recentEvents')
    // Two life_events reads: the windowed one for the graph, and the recent
    // one. The second carries no date bound, so a one-month graph window
    // cannot empty the list.
    const reads = stripComments(journeyData).split("from('life_events')")
    expect(reads.length).toBe(3)
    expect(reads[1]).toContain('gte(')
    expect(reads[2]).not.toContain('gte(')
    expect(reads[2]).toContain('.limit(RECENT_EVENT_LIMIT)')
  })

  it('reads life_events.body rather than inventing a column', () => {
    expect(journeyData).toContain("'id, occurred_on, title, body, significance'")
    const schema = read('supabase/migrations/0002_private_domains.sql')
    const table = schema.slice(schema.indexOf('create table public.life_events'))
    expect(table.slice(0, 600)).toContain('body text')
  })

  it('drops the queries whose rows the screen no longer shows', () => {
    for (const table of [
      'saved_scriptures',
      'bible_reading_progress',
      'prayer_topics',
      'promises',
      'promise_checks',
    ]) {
      expect(journeyData, table).not.toContain(`from('${table}')`)
    }
    expect((journeyData.match(/supabase\s*\n?\s*\.from\(/g) ?? []).length).toBe(4)
  })
})

describe('Step 7 — graph geometry (Figma 121:13)', () => {
  it('widens the plot and names the window', () => {
    expect(graph).toContain('const INSET_X = 8')
    expect(graph).toContain('const VIEW_H = 140')
    expect(graph).toContain('const GRIDLINES = [26, 68, 110]')
    expect(graph).toContain('{formatMonthDay(from)}')
    expect(graph).toContain('>오늘</span>')
  })

  it('does not change what the two layers mean', () => {
    // AC-02 and the Owner rule survive the resize untouched.
    expect(graph).toContain('{eventPoints.length > 1 ? (')
    expect(graph).toContain('<polyline')
    const moodBlock = graph.slice(graph.indexOf('{moods.map('))
    expect(moodBlock.slice(0, 400)).not.toContain('polyline')
  })
})

describe('Steps 6–9 — one record row, not four', () => {
  it('defines the row once', () => {
    expect(surface).toContain('export function RecordRow')
    expect(surface).toContain('export function RecordList')
  })

  it('is what every record list uses', () => {
    for (const [name, source] of [
      ['repentance', repentance],
      ['journey', journey],
      ['prayer', prayer],
    ] as const) {
      expect(source, name).toContain('<RecordRow')
    }
  })

  it('leads with the member’s own words', () => {
    const row = surface.slice(surface.indexOf('export function RecordRow'))
    expect(row.indexOf('{title}')).toBeGreaterThan(row.indexOf('{meta}'))
    expect(row).toContain('font-semibold text-ink')
  })

  it('leaves InfoRow in place for the screens built on fixed slots', () => {
    expect(surface).toContain('export function InfoRow')
    expect(surface).toContain('export function RowStack')
  })
})

describe('Step 9 — Promise', () => {
  it('keeps the keep strip and the derived filters', () => {
    expect(promise).toContain('<KeepStrip')
    expect(promise).toContain('PROMISE_FILTERS.map')
  })

  it('adopts the record-row density without touching the copy', () => {
    expect(promise).toContain('flex flex-col gap-1 px-gutter')
    expect(promise).toContain('text-body-sm mt-[2px] line-clamp-2 font-semibold text-ink')
    expect(promise).toContain('PROMISE_CLOSE_LABEL')
    expect(promise).toContain('기록하지 않은 날은 비어 있을 뿐, 잘못한 날이 아닙니다.')
  })
})

describe('Step 11 — header', () => {
  it('draws the two approved icons and labels them', () => {
    expect(header).toContain('export function HeaderIconAction')
    expect(header).toContain('aria-label={label}')
    expect(header).toContain('<circle cx="11" cy="11" r="7.5" />')
    expect(header).toContain('M3 7h18M3 12h18M3 17h18')
  })

  it('retires the bare ☰ character', () => {
    for (const [name, source] of [
      ['journey', journey],
      ['header', header],
    ] as const) {
      // The comment in app-header names the character in order to record it
      // being retired, so the check is against code only.
      expect(stripComments(source), name).not.toContain('☰')
    }
  })

  it('removes 달력 from the header without stranding the route', () => {
    expect(stripComments(journey)).not.toContain('>달력<')
    // Still reachable: quick action and full menu.
    expect(quickActions).toContain("href: '/journey/calendar'")
    expect(read('src/domain/menu.ts')).toContain("href: '/journey/calendar'")
  })

  it('leaves every sub-page on its existing back contract', () => {
    // Owner instruction: do not force 35 screens onto one header structure.
    const pages: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) walk(full)
        else if (entry === 'page.tsx') pages.push(full)
      }
    }
    walk(join(process.cwd(), 'app'))

    const subPages = pages.filter((path) => readFileSync(path, 'utf8').includes('<PageHeader'))
    expect(subPages.length).toBeGreaterThanOrEqual(30)
    for (const path of subPages) {
      expect(readFileSync(path, 'utf8'), path).toContain('backHref')
    }
  })

  it('keeps AppHeader on the five tab roots only', () => {
    const roots = [
      'app/(app)/journey/page.tsx',
      'app/(app)/prayer/page.tsx',
      'app/(app)/repentance/page.tsx',
      'app/(app)/promise/page.tsx',
      'app/(app)/confession/page.tsx',
    ]
    for (const path of roots) expect(read(path), path).toContain('<AppHeader')
  })
})

describe('Prototype boundary', () => {
  it('adds no migration', () => {
    const files = readdirSync(join(process.cwd(), 'supabase/migrations')).filter((f) =>
      f.endsWith('.sql'),
    )
    expect(files.map((f) => f.slice(0, 4)).sort()).toEqual([
      '0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008', '0009', '0010', '0011',
    ])
  })

  it('reads only columns the schema already has', () => {
    // Every column this migration newly reads, and where it was created.
    const schema = read('supabase/migrations/0002_private_domains.sql')
    expect(schema).toContain('body text')
    expect(journeyData).toContain('body')
  })
})

/**
 * Step 13 — full route regression.
 *
 * Every internal destination the app can navigate to must resolve to a route
 * that exists. This is the net under the whole migration: the visual pass moved
 * links between screens (달력 out of the header, 캘린더 into 나의 기록, drafts
 * behind a disclosure), and a link that now points nowhere is exactly the kind
 * of damage a screenshot does not show.
 */
describe('Step 13 — every internal link resolves', () => {
  const APP = join(process.cwd(), 'app')

  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full, out)
      else if (entry === 'page.tsx' || entry === 'route.ts') out.push(full)
    }
    return out
  }

  /** app/(app)/journey/[id]/page.tsx → ['journey', '*'] */
  const routes = walk(APP).map((file) =>
    file
      .slice(APP.length + 1)
      .split(/[\\/]/)
      .slice(0, -1)
      .filter((segment) => !segment.startsWith('(') && segment !== '')
      .map((segment) => (segment.startsWith('[') ? '*' : segment)),
  )

  function resolves(path: string): boolean {
    const wanted = path.split('/').filter(Boolean)
    return routes.some(
      (route) =>
        route.length === wanted.length &&
        route.every((segment, i) => segment === '*' || segment === wanted[i]),
    )
  }

  it('has a route tree to check against', () => {
    expect(routes.length).toBeGreaterThan(30)
    expect(resolves('/journey')).toBe(true)
    expect(resolves('/repentance/abc')).toBe(true)
    expect(resolves('/nope')).toBe(false)
  })

  it('resolves every href, redirect and action target in the app', () => {
    const sources = [...walk(APP), ...walkAll(join(process.cwd(), 'src'))]
    const broken: string[] = []

    for (const file of sources) {
      const source = stripComments(readFileSync(file, 'utf8'))
      const found = [
        ...source.matchAll(/href=(?:"|\{`)(\/[^"`{?#]*)/g),
        ...source.matchAll(/redirect\(\s*`?'?(\/[^'`)?#]*)/g),
        ...source.matchAll(/action="(\/[^"?#]*)"/g),
      ]

      for (const match of found) {
        // `${promise.id}` and friends stand in for a dynamic segment.
        const path = (match[1] as string).replace(/\$\{[^}]*\}/g, '*').replace(/\*+/g, '*')
        if (path === '/' || path.startsWith('//') || path.includes('$')) continue
        const normalised = path.replace(/\/$/, '') || '/'
        if (normalised === '/') continue
        if (!resolves(normalised)) broken.push(`${file.slice(process.cwd().length + 1)} → ${path}`)
      }
    }

    expect(broken).toEqual([])
  })

  it('still routes the screens this migration touched', () => {
    for (const path of [
      '/journey',
      '/journey/graph',
      '/journey/timeline',
      '/journey/calendar',
      '/journey/scripture',
      '/journey/bible',
      '/journey/search',
      '/journey/menu',
      '/repentance',
      '/repentance/write',
      '/repentance/*',
      '/repentance/*/write',
      '/prayer',
      '/promise',
      '/confession',
      '/settings',
    ]) {
      expect(resolves(path), path).toBe(true)
    }
  })
})

function walkAll(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walkAll(full, out)
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}
