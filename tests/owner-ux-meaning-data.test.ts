import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { HISTORY_EXAMPLE_BANDS, ageAt, ageBandLabel, groupHistory } from '../src/domain/journey-history'
import { MENU_SECTIONS, SIGN_OUT_ACTION } from '../src/domain/menu'
import { PROMISE_CLOSE_LABEL } from '../src/domain/product-lock'
import { PROVENANCE_LABELS, isUuid, readProvenance, provenanceHref } from '../src/domain/provenance'

/**
 * Issue #21 — Meaning/Data package.
 *
 * Each Owner decision is pinned here, and so is every rule the package must
 * NOT break: legacy rows stay readable, nothing is inferred, and no menu item
 * points at a route that does not exist.
 */

const ROOT = join(__dirname, '..')
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8')

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/^\s*--.*$/gm, '')
}

describe('migration 0011 — promise provenance (§A)', () => {
  const sql = read('supabase/migrations/0011_promise_provenance.sql')
  const body = stripComments(sql)

  it('is additive only', () => {
    expect(body).toContain('add column if not exists source_kind public.share_source_kind')
    expect(body).toContain('add column if not exists source_id   uuid')
    expect(body).not.toMatch(/\bdrop\s+(table|column|type)\b/i)
    expect(body).not.toMatch(/\bdelete\s+from\b|\btruncate\b|\bupdate\s+public\./i)
    // Touches promises and nothing else.
    for (const table of ['repentances', 'confession_posts', 'prayer_topics', 'actions']) {
      expect(new RegExp(`\\bpublic\\.${table}\\b`).test(body), table).toBe(false)
    }
  })

  it('adds both columns as nullable so every existing promise stays valid', () => {
    expect(body).not.toMatch(/source_kind[^;]*not null/i)
    expect(body).not.toMatch(/source_id[^;]*not null/i)
    expect(body).not.toMatch(/default/i)
  })

  it('enforces the pair rule and reuses the existing enum', () => {
    expect(body).toContain('check ((source_kind is null) = (source_id is null))')
    // 0003 already defines share_source_kind; 0011 must not create a type.
    expect(body).not.toMatch(/create\s+type/i)
    expect(read('supabase/migrations/0003_community.sql')).toContain(
      'create type public.share_source_kind as enum',
    )
  })

  it('creates no foreign key, so deleting the source cannot delete the promise', () => {
    expect(body).not.toMatch(/references/i)
    expect(body).not.toMatch(/on delete/i)
  })

  it('performs no backfill', () => {
    expect(body).not.toMatch(/insert\s+into|update\s+public\.promises\s+set/i)
  })

  it('is documented with a rollback path', () => {
    const runbookish = read('supabase/migrations/0011_promise_provenance.sql')
    // The file explains why there is no FK and no backfill, which is what a
    // reviewer needs to judge the rollback.
    expect(runbookish).toContain('FK')
    expect(runbookish).toContain('backfill')
  })
})

describe('provenance validation (§A)', () => {
  const id = '11111111-2222-4333-8444-555555555555'

  it('accepts only a complete, well-formed pointer', () => {
    expect(readProvenance('repentance', id)).toEqual({
      source_kind: 'repentance',
      source_id: id,
    })
  })

  it('drops a half-filled or malformed pointer instead of failing the CHECK', () => {
    for (const [kind, value] of [
      ['repentance', ''],
      ['repentance', 'not-a-uuid'],
      ['', id],
      ['nonsense', id],
      [null, null],
      [undefined, undefined],
    ] as Array<[unknown, unknown]>) {
      expect(readProvenance(kind, value)).toBeNull()
    }
  })

  it('recognises uuids strictly', () => {
    expect(isUuid(id)).toBe(true)
    expect(isUuid('11111111-2222-4333-8444-55555555555')).toBe(false)
    expect(isUuid(42)).toBe(false)
  })

  it('labels the source without naming its content', () => {
    expect(PROVENANCE_LABELS.repentance).toBe('이 약속은 회개 기록에서 시작되었습니다')
    for (const label of Object.values(PROVENANCE_LABELS)) {
      expect(label).not.toMatch(/회개 내용|본문/)
    }
    expect(provenanceHref('repentance', id)).toBe(`/repentance/${id}`)
    expect(provenanceHref('action_record', id)).toBeNull()
  })

  it('re-validates on the server rather than trusting the form', () => {
    const actions = read('app/(app)/promise/actions.ts')
    expect(actions).toContain('readProvenance(')
    expect(actions).toContain("source_kind: null")
    expect(actions).toContain("source_id: null")
  })

  it('never puts a private source id in a public payload', () => {
    // ShareCopy composes its own row; it must not carry the promise pointer.
    const confession = read('app/(app)/confession/actions.ts')
    expect(confession).not.toContain('source_kind: promise.source_kind')
    // The community projection is profile-only.
    const hardening = read('supabase/migrations/0005_security_hardening.sql')
    const projection = hardening.slice(
      hardening.indexOf('create table public.community_profiles'),
      hardening.indexOf('alter table public.community_profiles'),
    )
    expect(projection).not.toContain('source_id')
    // And nothing logs it.
    expect(read('app/(app)/promise/actions.ts')).not.toMatch(/console\.(log|error)\([^)]*source_id/)
  })

  it('keeps legacy promises with no provenance fully usable', () => {
    const detail = read('app/(app)/promise/[id]/page.tsx')
    // The notice is conditional on both halves; a legacy row renders without it.
    expect(detail).toContain('promise.source_kind && promise.source_id')
    // Editing and closing do not require provenance.
    const actions = read('app/(app)/promise/actions.ts')
    expect(actions.slice(actions.indexOf('export async function updatePromise'))).not.toContain(
      'source_kind',
    )
    expect(actions.slice(actions.indexOf('export async function closePromise'))).not.toContain(
      'source_kind',
    )
  })
})

describe('repentance delayed creation (§B)', () => {
  const actions = read('app/(app)/repentance/actions.ts')
  const entry = read('app/(app)/repentance/page.tsx')

  it('no longer writes a row when the member opens the screen', () => {
    // The insert-on-click action is gone, and the entry point is a link.
    expect(stripComments(actions)).not.toContain('export async function startRepentance')
    expect(entry).toContain('<ButtonLink href="/repentance/write">')
    expect(stripComments(entry)).not.toContain('startRepentance')
  })

  it('creates the row on the first real save, then updates the same row', () => {
    expect(actions).toContain('let id = submittedId')
    expect(actions).toContain("if (step !== 'looking_back') redirect('/repentance')")
    const insertBlock = actions.slice(actions.indexOf('} else {'))
    expect(insertBlock).toContain("state: 'draft'")
    expect(insertBlock).toContain(".select('id')")
    // The update path still keys on the existing row.
    expect(actions).toContain(".eq('id', id)")
  })

  it('has an id-less first-step screen that submits an empty id', () => {
    const page = read('app/(app)/repentance/write/page.tsx')
    expect(page).toContain('name="id" value=""')
    expect(page).toContain('REPENTANCE_WRITE_FLOW')
    // Only the first step lives here; the rest stay on the existing route.
    expect(page).not.toContain("value=\"finish\"")
  })

  it('leaves existing drafts untouched', () => {
    // No delete or cleanup of historical rows anywhere in the package.
    expect(actions).not.toMatch(/delete\(\)[\s\S]{0,120}state.*draft/)

    // Owner decision 2026-09-08 renamed the section `쓰다 만 기록` to a collapsed
    // `작성 중인 기록 N개` row. The wording changed; the guarantee did not — every
    // draft is still listed and still resumable at the same step.
    const page = read('app/(app)/repentance/page.tsx')
    expect(page).toContain('작성 중인 기록 {drafts.length}개')
    expect(page).toContain('/repentance/${draft.id}/write?step=looking_back')
    expect(page).toContain('drafts.map((draft)')
  })

  it('keeps the legacy write, review and detail routes working', () => {
    for (const file of [
      'app/(app)/repentance/[id]/write/page.tsx',
      'app/(app)/repentance/[id]/review/page.tsx',
      'app/(app)/repentance/[id]/page.tsx',
    ]) {
      expect(existsSync(join(ROOT, file)), file).toBe(true)
    }
    expect(actions).toContain('export async function commitRepentance')
    // Legacy 4-field read contract intact.
    expect(read('app/(app)/repentance/[id]/page.tsx')).toContain('turning_promise')
  })
})

describe('journey history (§D)', () => {
  const birth = '1988-06-15'

  it('computes age from birth date and event date only', () => {
    expect(ageAt(birth, '2008-06-14')).toBe(19)
    expect(ageAt(birth, '2008-06-15')).toBe(20)
    expect(ageAt(birth, '2026-09-07')).toBe(38)
    // A date before birth clamps rather than going negative.
    expect(ageAt(birth, '1980-01-01')).toBe(0)
  })

  it('labels bands by decade', () => {
    expect(ageBandLabel(3)).toBe('10세 미만')
    expect(ageBandLabel(14)).toBe('10대')
    expect(ageBandLabel(20)).toBe('20대')
    expect(ageBandLabel(38)).toBe('30대')
  })

  it('groups events into ascending eras', () => {
    const events = [
      { id: 'c', occurred_on: '2020-01-01', title: '이직', body: null, significance: 1 },
      { id: 'a', occurred_on: '2008-09-01', title: '군 입대', body: null, significance: 0 },
      { id: 'b', occurred_on: '2010-06-01', title: '군 전역', body: null, significance: 2 },
    ]
    const bands = groupHistory(events, birth)
    expect(bands.map((band) => band.label)).toEqual(['20대', '30대'])
    expect(bands[0]?.events.map((event) => event.id)).toEqual(['a', 'b'])
    expect(bands[1]?.events.map((event) => event.id)).toEqual(['c'])
  })

  it('falls back to calendar years when there is no birth date', () => {
    const events = [
      { id: 'a', occurred_on: '2020-03-01', title: 'x', body: null, significance: 0 },
      { id: 'b', occurred_on: '2021-04-01', title: 'y', body: null, significance: 0 },
    ]
    const bands = groupHistory(events, null)
    expect(bands.map((band) => band.label)).toEqual(['2020년', '2021년'])
  })

  it('derives eras without storing any taxonomy', () => {
    // Comments stripped: the module's doc comment names category and the
    // forbidden inferences in order to record that it does none of them.
    const domain = stripComments(read('src/domain/journey-history.ts'))
    expect(domain).not.toMatch(/supabase|insert|update|category/i)
    // The guarantee that matters: nothing writes an era/band field. The life
    // event payload is unchanged, so no taxonomy is persisted.
    const writes = read('app/(app)/journey/actions.ts')
    const payload = writes.slice(writes.indexOf('const payload = {'))
    expect(payload.slice(0, payload.indexOf('}'))).not.toMatch(/era|age_band|band/i)
    expect(payload.slice(0, payload.indexOf('}'))).toContain('occurred_on')
  })

  it('shows a UI-only example that disappears after the first real event', () => {
    expect(HISTORY_EXAMPLE_BANDS.length).toBeGreaterThan(0)
    const titles = HISTORY_EXAMPLE_BANDS.flatMap((band) => band.items)
    expect(titles).toContain('군 입대')
    expect(titles).toContain('군 전역')
    const page = read('app/(app)/journey/graph/page.tsx')
    // Real bands when there is at least one event, example otherwise.
    expect(page).toContain('bands.length > 0')
    expect(page).toContain('HISTORY_EXAMPLE_BANDS')
    expect(page).toContain('예시는 실제 기록에 포함되지 않아요')
    // The example is a constant, never inserted.
    expect(stripComments(read('src/domain/journey-history.ts'))).not.toContain('life_events')
  })

  it('infers nothing about emotion or related records', () => {
    const domain = read('src/domain/journey-history.ts')
    const page = stripComments(read('app/(app)/journey/graph/page.tsx'))
    for (const code of [domain, page]) {
      expect(code).not.toMatch(/mood_records[\s\S]{0,120}life_events/)
      expect(code).not.toMatch(/relatedPrayer|relatedRepentance|relatedPromise|linkedRecords/)
    }
    // History selects no mood column.
    expect(page).toContain("select('id, occurred_on, title, body, significance')")
  })
})

describe('full menu (§E)', () => {
  /** Resolve a menu href to the App Router page file that serves it. */
  function pageFileFor(href: string): string {
    const path = (href.split('#')[0] ?? '').split('?')[0] ?? ''
    return join(ROOT, 'app/(app)', path, 'page.tsx')
  }

  it('points every item at a route that exists', () => {
    for (const section of MENU_SECTIONS) {
      for (const item of section.items) {
        expect(existsSync(pageFileFor(item.href)), `${item.label} → ${item.href}`).toBe(true)
      }
    }
  })

  it('covers the route map agreed in Issue #20', () => {
    const hrefs = MENU_SECTIONS.flatMap((section) => section.items.map((item) => item.href))
    for (const href of [
      '/journey/graph',
      '/journey/timeline',
      '/journey/calendar',
      '/journey/search',
      '/journey/scripture',
      '/journey/bible',
      '/prayer',
      '/prayer/folders',
      '/prayer/topic/new',
      '/prayer/text/new',
      '/repentance',
      '/promise',
      '/promise/new',
      '/confession',
      '/confession/write',
      '/settings',
      '/settings/profile-media',
      '/settings/blocked',
    ]) {
      expect(hrefs, href).toContain(href)
    }
  })

  it('invents no /mypage route', () => {
    const hrefs = MENU_SECTIONS.flatMap((section) => section.items.map((item) => item.href))
    expect(hrefs.some((href) => href.startsWith('/mypage'))).toBe(false)
    expect(existsSync(join(ROOT, 'app/(app)/mypage'))).toBe(false)
  })

  it('treats sign out as the POST route it is, not a link', () => {
    expect(SIGN_OUT_ACTION).toBe('/auth/signout')
    const hrefs = MENU_SECTIONS.flatMap((section) => section.items.map((item) => item.href))
    expect(hrefs).not.toContain('/auth/signout')
    const page = read('app/(app)/journey/menu/page.tsx')
    expect(page).toContain('method="POST"')
    expect(read('app/auth/signout/route.ts')).toContain('export async function POST')
  })

  it('uses a native accordion rather than a new drawer architecture', () => {
    const page = read('app/(app)/journey/menu/page.tsx')
    expect(page).toContain('<details')
    expect(page).not.toMatch(/role="dialog"|aria-modal|focus-trap|useState/)
  })
})

describe('my page phase 1 (§F)', () => {
  const menu = MENU_SECTIONS.find((section) => section.title === '내 정보')

  it('exposes only capabilities that already have a backend', () => {
    expect(menu?.items.map((item) => item.href)).toEqual([
      '/settings',
      '/settings/profile-media',
      '/settings/blocked',
    ])
  })

  it('offers no export, deletion, notification or legal item, even disabled', () => {
    const all = MENU_SECTIONS.flatMap((section) => section.items)
    for (const banned of ['내보내기', '탈퇴', '알림', '이용약관', '개인정보처리방침']) {
      expect(all.some((item) => item.label.includes(banned)), banned).toBe(false)
    }
    const menuPage = read('app/(app)/journey/menu/page.tsx')
    expect(menuPage).not.toMatch(/disabled/)
  })

  it('keeps /settings as the My Page surface', () => {
    const settings = read('app/(app)/settings/page.tsx')
    expect(settings).toContain('내 정보')
    expect(settings).toContain('/auth/signout')
  })
})

describe('promise completion label (§G)', () => {
  it('uses 완료 as the Owner decided', () => {
    expect(PROMISE_CLOSE_LABEL).toBe('완료')
  })

  it('changes wording only — the stored state is untouched', () => {
    const migrations = ['0002_private_domains.sql', '0011_promise_provenance.sql']
    for (const file of migrations) {
      const sql = read(`supabase/migrations/${file}`)
      expect(sql, file).not.toContain('완료')
    }
    // promise_state is still active/closed.
    expect(read('supabase/migrations/0002_private_domains.sql')).toContain(
      "state public.promise_state not null default 'active'",
    )
    expect(read('src/lib/supabase/database.types.ts')).toContain(
      "export type PromiseState = 'active' | 'closed'",
    )
  })

  it('records the supersession in the canonical docs', () => {
    expect(read('docs/04-policy-business-rules.md')).toContain('Promise user-facing finish: `완료`')
    expect(read('src/domain/product-lock.ts')).toContain('Issue #21 §G')
  })
})
