import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  ACTION_FAILURE_IS_SIN,
  AI_MEMORY_DEFAULT_ON,
  AUTOMATED_ELIGIBILITY_JUDGMENT,
  CONFESSION_PHOTO_MAX,
  CONFESSION_TYPE_LABELS,
  CONFESSION_USES_AI,
  ENABLED_REACTIONS,
  FORBIDDEN_COMMUNITY_SHAPES,
  FORBIDDEN_METRICS,
  FORBIDDEN_STATES,
  MAIN_NAV,
  MOOD_MISSING_DAY_IS_INTERPOLATED,
  ONE_REACTION_PER_USER_PER_POST,
  PROFILE_GALLERY_MAX,
  PROMISE_CLOSE_LABEL,
  PROMISE_DEFAULT_GROUPS,
  REACTION_LABELS,
  REPENTANCE_FINAL_CTA,
  REPENTANCE_IS_DAILY_DUTY_TILE,
  REPENTANCE_SHOWS_PROGRESS_PERCENT,
  REPENTANCE_STEPS,
  REPORT_REASON_LABELS,
  SHARECOPY_CASCADES_FROM_SOURCE,
  TODAY_SLOTS,
} from '../src/domain/product-lock'
import { REPENTANCE_FLOW } from '../src/domain/repentance'

/**
 * Product Lock regression.
 *
 * Canonical Product Meaning comes from docs/00–10 on origin/main (LOCKED,
 * owner_approval 2026-09-06). These tests fail if shipped code drifts from it.
 *
 * The source scan below strips comments before matching, so the documentation
 * in this repo may name a forbidden concept in order to explain that it is
 * forbidden, while live code may not contain it at all.
 */

const ROOT = join(__dirname, '..')
const SCAN_DIRS = ['app', 'src', 'supabase/migrations']
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.sql', '.css']

function collectFiles(dir: string): string[] {
  const absolute = join(ROOT, dir)
  let entries: string[]
  try {
    entries = readdirSync(absolute)
  } catch {
    return []
  }

  return entries.flatMap((entry) => {
    const full = join(absolute, entry)
    if (statSync(full).isDirectory()) return collectFiles(join(dir, entry))
    return SCAN_EXTENSIONS.some((extension) => entry.endsWith(extension)) ? [full] : []
  })
}

/** Remove line comments, block comments, and SQL comments before matching. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/^\s*--.*$/gm, '')
}

const SOURCES = SCAN_DIRS.flatMap(collectFiles).map((file) => ({
  path: relative(ROOT, file).replace(/\\/g, '/'),
  code: stripComments(readFileSync(file, 'utf8')),
}))

describe('source scan', () => {
  it('scans a non-trivial number of files', () => {
    // Guards against the scan silently matching nothing.
    expect(SOURCES.length).toBeGreaterThan(30)
  })

  it.each(FORBIDDEN_STATES)('never uses the spiritual state %s', (state) => {
    const offenders = SOURCES.filter(({ code, path }) => {
      if (path === 'src/domain/product-lock.ts') return false
      return new RegExp(`\\b${state}\\b`).test(code)
    })
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })

  it.each(FORBIDDEN_METRICS)('never renders the metric %s', (metric) => {
    const offenders = SOURCES.filter(({ code, path }) => {
      if (path === 'src/domain/product-lock.ts') return false
      return code.includes(metric)
    })
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })

  it.each(FORBIDDEN_COMMUNITY_SHAPES)('never ranks the community by %s', (shape) => {
    const offenders = SOURCES.filter(({ code, path }) => {
      if (path === 'src/domain/product-lock.ts') return false
      return code.includes(shape)
    })
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })

  it('never orders a confession query by reaction count', () => {
    const offenders = SOURCES.filter(({ code }) =>
      /confession[\s\S]{0,400}order\([^)]*reaction/i.test(code),
    )
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })

  it('has no streak concept anywhere', () => {
    const offenders = SOURCES.filter(({ code }) => /\bstreak\b/i.test(code) || code.includes('연속 기록'))
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })
})

describe('navigation (docs/00, AC-01)', () => {
  it('locks the five main tabs in order', () => {
    expect(MAIN_NAV).toEqual(['여정', '기도', '회개', '약속', '고백'])
  })

  it('does not expose Action as a bottom tab', () => {
    const nav = readFileSync(join(ROOT, 'src/components/layout/bottom-nav.tsx'), 'utf8')
    const tabBlock = nav.slice(nav.indexOf('const TABS'), nav.indexOf('] as const'))
    expect(tabBlock).not.toContain('/action')
    expect(MAIN_NAV).not.toContain('실행')
  })

  it('renders exactly the five canonical tabs', () => {
    const nav = stripComments(readFileSync(join(ROOT, 'src/components/layout/bottom-nav.tsx'), 'utf8'))
    for (const label of MAIN_NAV) expect(nav).toContain(label)
    expect(nav.match(/href: '\//g)?.length).toBe(5)
  })
})

describe('repentance (docs/01, AC-04)', () => {
  it('keeps the exact final CTA', () => {
    expect(REPENTANCE_FINAL_CTA).toBe('회개 기록 마치기')
  })

  it('renders that CTA verbatim on the last step', () => {
    const write = readFileSync(join(ROOT, 'app/(app)/repentance/[id]/write/page.tsx'), 'utf8')
    expect(write).toContain('REPENTANCE_FINAL_CTA')
  })

  it('keeps the Korean four-step flow in order', () => {
    expect(REPENTANCE_STEPS).toEqual(['돌아보기', '깨닫기', '돌이킴 약속', '돌아가기'])
    expect(REPENTANCE_FLOW.map((step) => step.label)).toEqual([...REPENTANCE_STEPS])
  })

  it('never shows a progress percentage', () => {
    expect(REPENTANCE_SHOWS_PROGRESS_PERCENT).toBe(false)
    const write = stripComments(
      readFileSync(join(ROOT, 'app/(app)/repentance/[id]/write/page.tsx'), 'utf8'),
    )
    expect(write).not.toMatch(/progress/i)
    expect(write).not.toContain('%')
  })

  it('is not a daily duty tile on Journey', () => {
    expect(REPENTANCE_IS_DAILY_DUTY_TILE).toBe(false)
    expect(TODAY_SLOTS).not.toContain('회개')
  })
})

describe('promise / action (docs/04, AC-05)', () => {
  it('uses the canonical default groups', () => {
    expect(PROMISE_DEFAULT_GROUPS).toEqual(['나의 삶', '사람과 관계', '신앙생활'])
  })

  it('seeds exactly those groups in the migration', () => {
    const migration = readFileSync(
      join(ROOT, 'supabase/migrations/0004_ai_privacy_storage_search.sql'),
      'utf8',
    )
    for (const group of PROMISE_DEFAULT_GROUPS) expect(migration).toContain(group)
  })

  it('labels a finished promise 마무리됨', () => {
    expect(PROMISE_CLOSE_LABEL).toBe('마무리됨')
  })

  it('never equates a missed action with sin', () => {
    expect(ACTION_FAILURE_IS_SIN).toBe(false)
    const outcomes = readFileSync(
      join(ROOT, 'supabase/migrations/0002_private_domains.sql'),
      'utf8',
    )
    expect(outcomes).not.toMatch(/'failed'|'missed'|'sin'/)
  })
})

describe('journey (docs/04, AC-02)', () => {
  it('never interpolates a missing day', () => {
    expect(MOOD_MISSING_DAY_IS_INTERPOLATED).toBe(false)
  })

  it('draws mood as points and only life events as a line', () => {
    const graph = stripComments(
      readFileSync(join(ROOT, 'src/components/journey/journey-graph.tsx'), 'utf8'),
    )
    // Exactly one polyline exists, and it belongs to the life-event layer.
    expect(graph.match(/<polyline/g)?.length).toBe(1)
    const polylineIndex = graph.indexOf('<polyline')
    const moodIndex = graph.indexOf('moods.map')
    expect(polylineIndex).toBeLessThan(moodIndex)
  })

  it('keeps the four canonical TODAY slots', () => {
    expect(TODAY_SLOTS).toEqual(['나의 말씀', '이어갈 기도', '오늘의 약속·실행', '성경읽기'])
  })
})

describe('confession (docs/04, docs/08, AC-06)', () => {
  it('uses the four canonical types', () => {
    expect(Object.values(CONFESSION_TYPE_LABELS)).toEqual(['기도', '고백', '은혜', '일상'])
  })

  it('keeps the three canonical reaction labels defined', () => {
    expect(Object.values(REACTION_LABELS)).toEqual([
      '함께 기도해요',
      '은혜받았어요',
      '마음이 닿았어요',
    ])
  })

  it('enables only reactions that exist in the canonical set', () => {
    for (const reaction of ENABLED_REACTIONS) {
      expect(Object.keys(REACTION_LABELS)).toContain(reaction)
    }
    expect(ENABLED_REACTIONS.length).toBeGreaterThan(0)
  })

  it('allows one reaction per member per post', () => {
    expect(ONE_REACTION_PER_USER_PER_POST).toBe(true)
    const migration = readFileSync(join(ROOT, 'supabase/migrations/0003_community.sql'), 'utf8')
    expect(migration).toContain('primary key (post_id, user_id)')
  })

  it('caps a post at one photo', () => {
    expect(CONFESSION_PHOTO_MAX).toBe(1)
  })

  it('uses no AI', () => {
    expect(CONFESSION_USES_AI).toBe(false)
    const confessionFiles = SOURCES.filter(({ path }) => path.includes('confession'))
    for (const file of confessionFiles) {
      expect(file.code).not.toMatch(/anthropic|openai/i)
    }
  })
})

describe('safety (docs/08)', () => {
  it('offers no spiritual report reason', () => {
    const reasons = Object.values(REPORT_REASON_LABELS)
    expect(reasons).toEqual(['개인정보 노출', '괴롭힘·혐오', '스팸·광고', '자해·위험·기타 안전 문제'])
    for (const reason of reasons) {
      expect(reason).not.toMatch(/신앙|회개|죄/)
    }
  })

  it('never judges community eligibility automatically', () => {
    expect(AUTOMATED_ELIGIBILITY_JUDGMENT).toBe(false)
  })
})

describe('privacy (docs/06, docs/07, AC-08, AC-10)', () => {
  it('keeps AI memory off by default', () => {
    expect(AI_MEMORY_DEFAULT_ON).toBe(false)
    const migration = readFileSync(
      join(ROOT, 'supabase/migrations/0004_ai_privacy_storage_search.sql'),
      'utf8',
    )
    expect(migration).toContain('enabled boolean not null default false')
  })

  it('never cascades a ShareCopy from its private source', () => {
    expect(SHARECOPY_CASCADES_FROM_SOURCE).toBe(false)
    const migration = readFileSync(join(ROOT, 'supabase/migrations/0003_community.sql'), 'utf8')
    // source_id is a plain uuid, deliberately not a foreign key.
    expect(migration).toContain('source_id uuid,')
    expect(migration).not.toMatch(/source_id uuid references/)
  })

  it('caps the profile gallery at 30', () => {
    expect(PROFILE_GALLERY_MAX).toBe(30)
    const migration = readFileSync(
      join(ROOT, 'supabase/migrations/0001_foundation_and_profile.sql'),
      'utf8',
    )
    expect(migration).toContain('media_count >= 30')
  })

  it('never exposes church name or denomination through the community projection', () => {
    const migration = readFileSync(
      join(ROOT, 'supabase/migrations/0005_security_hardening.sql'),
      'utf8',
    )
    const tableBlock = migration.slice(
      migration.indexOf('create table public.community_profiles'),
      migration.indexOf('alter table public.community_profiles'),
    )
    expect(tableBlock).not.toContain('church_name')
    expect(tableBlock).not.toContain('denomination')
  })

  it('never loads scripture full text before the license is approved', () => {
    const migration = readFileSync(
      join(ROOT, 'supabase/migrations/0002_private_domains.sql'),
      'utf8',
    )
    expect(migration).toContain('license_approved boolean not null default false')
    // No INSERT into verse_texts exists anywhere in the repo.
    const inserts = SOURCES.filter(({ code }) => /insert\s+into\s+public\.verse_texts/i.test(code))
    expect(inserts.map((file) => file.path)).toEqual([])
  })
})

describe('secrets', () => {
  it('keeps the service role and AI keys out of anything the browser can import', () => {
    const clientFiles = SOURCES.filter(({ code }) => code.includes("'use client'"))
    for (const file of clientFiles) {
      expect(file.code).not.toContain('SERVICE_ROLE')
      expect(file.code).not.toContain('ANTHROPIC_API_KEY')
      expect(file.code).not.toContain('NAVER_CLIENT_SECRET')
    }
  })

  it('reads privileged keys only through the server-only module', () => {
    const offenders = SOURCES.filter(
      ({ path, code }) =>
        path !== 'src/lib/env.server.ts' &&
        /process\.env\.(SUPABASE_SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|NAVER_CLIENT_ID|NAVER_CLIENT_SECRET)/.test(
          code,
        ),
    )
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })

  /**
   * src/lib/env.ts is imported by the browser Supabase client, so anything it
   * mentions ships to the browser — a `process.env.SECRET` lookup compiles to
   * `undefined` but still leaves the NAME in the bundle. Keep it clean.
   */
  it('keeps privileged names out of the browser-reachable env module', () => {
    // Comments are stripped from the bundle, so only real code is checked here —
    // this module's own doc comment names the variables to say where they live.
    const publicEnvModule = stripComments(readFileSync(join(ROOT, 'src/lib/env.ts'), 'utf8'))
    for (const name of [
      'SERVICE_ROLE',
      'ANTHROPIC',
      'NAVER_CLIENT_ID',
      'NAVER_CLIENT_SECRET',
    ]) {
      expect(publicEnvModule).not.toContain(name)
    }
  })

  it('guards the server-only env module', () => {
    const serverEnvModule = readFileSync(join(ROOT, 'src/lib/env.server.ts'), 'utf8')
    expect(serverEnvModule).toContain("import 'server-only'")
  })

  it('guards the admin client with server-only', () => {
    const admin = readFileSync(join(ROOT, 'src/lib/supabase/admin.ts'), 'utf8')
    expect(admin).toContain("import 'server-only'")
  })

  it('never commits a real env file', () => {
    const gitignore = readFileSync(join(ROOT, '.gitignore'), 'utf8')
    expect(gitignore).toContain('.env.local')
    const example = readFileSync(join(ROOT, '.env.example'), 'utf8')
    // Names only — every line must be `KEY=` with nothing after it.
    for (const line of example.split('\n')) {
      if (!line.includes('=') || line.trimStart().startsWith('#')) continue
      expect(line.trim()).toMatch(/^[A-Z0-9_]+=$/)
    }
  })
})

describe('row level security', () => {
  const migrations = SOURCES.filter(({ path }) => path.startsWith('supabase/migrations'))
  const allSql = migrations.map(({ code }) => code).join('\n')

  it('enables RLS on every table it creates', () => {
    const created = Array.from(allSql.matchAll(/create table public\.(\w+)/g)).map(
      (match) => match[1] as string,
    )
    expect(created.length).toBeGreaterThan(20)

    for (const table of created) {
      const enabledDirectly = allSql.includes(`alter table public.${table} enable row level security`)
      // 0002 enables RLS for a list of tables in a loop.
      const enabledInLoop = /owner_tables text\[\] :=[\s\S]*?\]/.exec(allSql)?.[0]?.includes(`'${table}'`)
      expect(enabledDirectly || enabledInLoop, `RLS missing for ${table}`).toBe(true)
    }
  })

  it('gives moderation_actions no policy at all', () => {
    expect(allSql).not.toMatch(/create policy[^;]*on public\.moderation_actions/)
  })
})
