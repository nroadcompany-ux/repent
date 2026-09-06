import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  ACTION_FAILURE_IS_SIN,
  AI_MEMORY_DEFAULT_ON,
  AUTOMATED_ELIGIBILITY_JUDGMENT,
  COMMENT_DELETE_IS_SOFT,
  CONFESSION_COMMENTS_ENABLED,
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
import {
  FORBIDDEN_COPY,
  JOURNEY_BANNER_LEGACY_COPY,
  PRIMARY_BRAND_COPY,
  SOCIAL_LOGIN_LABELS,
  SOCIAL_LOGIN_PROVIDERS,
} from '../src/domain/copy'
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

  /**
   * Owner final decision 2026-09-06: all three canonical reactions ship.
   * A single-reaction build is a Canonical Delta, so this asserts the full set
   * rather than merely "a subset of the canonical set".
   */
  it('enables all three canonical reactions', () => {
    expect([...ENABLED_REACTIONS]).toEqual(['pray_together', 'received_grace', 'touched'])
    expect([...ENABLED_REACTIONS]).toEqual(Object.keys(REACTION_LABELS))
  })

  it('renders every enabled reaction from the shared bar', () => {
    const bar = stripComments(
      readFileSync(join(ROOT, 'app/(app)/confession/_components/reaction-bar.tsx'), 'utf8'),
    )
    expect(bar).toContain('ENABLED_REACTIONS.map')
    // Counts are rendered, but never sorted or compared across posts.
    expect(bar).not.toMatch(/\.sort\(/)
  })

  it('never orders the feed by reaction or comment volume', () => {
    const feed = stripComments(readFileSync(join(ROOT, 'app/(app)/confession/page.tsx'), 'utf8'))
    const orders = feed.match(/\.order\([^)]*\)/g) ?? []
    expect(orders).toEqual([".order('created_at', { ascending: false })"])
  })

  it('allows one reaction per member per post', () => {
    expect(ONE_REACTION_PER_USER_PER_POST).toBe(true)
    const migration = readFileSync(join(ROOT, 'supabase/migrations/0003_community.sql'), 'utf8')
    expect(migration).toContain('primary key (post_id, user_id)')
  })

  it('caps a post at one photo', () => {
    expect(CONFESSION_PHOTO_MAX).toBe(1)
  })

  /**
   * Comment is in the Confession MVP (docs/04, AC-06), confirmed as the Owner's
   * final decision on 2026-09-06. 0003 had it switched off; 0007 restores it.
   */
  it('includes comments in the MVP', () => {
    expect(CONFESSION_COMMENTS_ENABLED).toBe(true)
    const migration = readFileSync(
      join(ROOT, 'supabase/migrations/0007_confession_comments_mvp.sql'),
      'utf8',
    )
    for (const policy of [
      'confession_comments_insert_own',
      'confession_comments_update_own',
      'confession_comments_delete_own',
      'confession_comments_select_visible',
    ]) {
      expect(migration).toContain(policy)
    }
  })

  it('keeps comments to the capabilities docs/08 names', () => {
    const actions = stripComments(
      readFileSync(join(ROOT, 'app/(app)/confession/actions.ts'), 'utf8'),
    )
    // write / read / author delete / report — and nothing beyond it.
    expect(actions).toContain('createComment')
    expect(actions).toContain('deleteComment')
    expect(actions).toContain('reportComment')
    // No threading, no reactions on comments, no mentions: not in any canonical source.
    expect(actions).not.toMatch(/parent_comment_id|comment_reactions|mentions/)
  })

  it('deletes a comment softly so a moderator can still review it', () => {
    expect(COMMENT_DELETE_IS_SOFT).toBe(true)
    const actions = readFileSync(join(ROOT, 'app/(app)/confession/actions.ts'), 'utf8')
    const block = actions.slice(actions.indexOf('export async function deleteComment'))
    expect(block).toContain('deleted_at')
    expect(block.slice(0, block.indexOf('}'))).not.toContain('.delete()')
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

/**
 * Brand copy — Owner Final Decision 2026-09-06.
 * The Entry hero is a fixed string; screens must not paraphrase it, and the
 * system must never render wording that judges a member's spiritual state.
 */
describe('brand copy', () => {
  const login = readFileSync(join(ROOT, 'app/login/page.tsx'), 'utf8')
  const journey = readFileSync(join(ROOT, 'app/(app)/journey/page.tsx'), 'utf8')

  it('states the primary brand copy exactly', () => {
    expect(PRIMARY_BRAND_COPY.wordmark).toBe('RETURN')
    expect(PRIMARY_BRAND_COPY.headline).toBe('다시 하나님께.')
    expect(PRIMARY_BRAND_COPY.subline).toBe('하나님과 함께한 삶의 순간을 기록합니다.')
  })

  it('renders the Entry hero from the shared constant, not a literal', () => {
    expect(login).toContain('PRIMARY_BRAND_COPY.wordmark')
    expect(login).toContain('PRIMARY_BRAND_COPY.headline')
    expect(login).toContain('PRIMARY_BRAND_COPY.subline')
  })

  it('no longer uses the former hero line on the Entry screen', () => {
    expect(stripComments(login)).not.toContain('오늘의 기록이')
    expect(stripComments(login)).not.toContain('당신의 여정이 됩니다')
  })

  it('keeps the former hero line in the Journey Education Banner', () => {
    expect(JOURNEY_BANNER_LEGACY_COPY).toEqual(['오늘의 기록이', '당신의 여정이 됩니다'])
    expect(journey).toContain('JOURNEY_BANNER_LEGACY_COPY')
  })

  it('offers exactly the two canonical providers on the Entry screen', () => {
    expect([...SOCIAL_LOGIN_PROVIDERS]).toEqual(['google', 'naver'])
    expect(SOCIAL_LOGIN_LABELS.google).toBe('Google로 시작하기')
    expect(SOCIAL_LOGIN_LABELS.naver).toBe('Naver로 시작하기')
    expect(login).toContain('SOCIAL_LOGIN_LABELS.google')
    expect(login).toContain('SOCIAL_LOGIN_LABELS.naver')
  })

  it('builds no email/password sign-up path', () => {
    const offenders = SOURCES.filter(({ code }) =>
      /signUp\(|signInWithPassword\(/.test(code),
    )
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })

  it.each(FORBIDDEN_COPY)('never renders the phrase %s', (phrase) => {
    const offenders = SOURCES.filter(({ code, path }) => {
      if (path === 'src/domain/copy.ts') return false
      return code.includes(phrase)
    })
    expect(offenders.map((offender) => offender.path)).toEqual([])
  })

  /**
   * The Entry privacy note is Safety copy, so it has to be legible.
   * ink-faint (#a2a4ad) on the canvas (#f7f7fa) measures 2.32:1, below WCAG AA;
   * ink-muted (#6f717a) measures 4.55:1 and passes.
   */
  it('renders the Entry safety note in a legible token', () => {
    const noteBlock = login.slice(login.indexOf('ENTRY_SAFETY_NOTE[0]') - 300)
    expect(noteBlock).toContain('text-ink-muted')
    expect(noteBlock.slice(0, noteBlock.indexOf('ENTRY_SAFETY_NOTE[0]'))).not.toContain(
      'text-ink-faint',
    )
  })
})
