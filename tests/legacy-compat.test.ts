import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { tallyReactions, isLiveVote } from '../src/domain/confession-reactions'
import { isScheduled, keepRate, recurrenceLabel } from '../src/domain/promise'
import { CONFESSION_VOTES, LEGACY_REACTION_TYPES } from '../src/domain/product-lock'
import { REPENTANCE_FLOW, repentanceStep, repentanceStepIndex } from '../src/domain/repentance'

/**
 * Legacy data compatibility.
 *
 * Migrations 0008–0010 add columns and enum values to a database that already
 * holds real member records. Nothing written before them may change meaning,
 * disappear, or start rendering as something else. These tests exercise the
 * rules against rows shaped the way the OLD schema produced them — a promise
 * with no repeat_* fields at all, a repentance carrying 돌이킴 약속, a reaction
 * row holding a superseded type.
 *
 * They are deliberately independent of a live database: the point is that the
 * code degrades correctly on old shapes, which is exactly what cannot be
 * observed by querying a database that has already been migrated.
 */

const ROOT = join(__dirname, '..')

function migration(name: string): string {
  return readFileSync(join(ROOT, 'supabase/migrations', name), 'utf8')
}

describe('migration blast radius (0008–0010)', () => {
  const NEW_MIGRATIONS = [
    '0008_journey_birth_date.sql',
    '0009_promise_recurrence.sql',
    '0010_confession_like_dislike.sql',
  ]

  it('applies in exactly this order with no gap or renumber', () => {
    const onDisk = readdirSync(join(ROOT, 'supabase/migrations'))
      .filter((file) => file.endsWith('.sql'))
      .sort()

    // Historical migrations are never rewritten or squashed: 0001–0010 all
    // still exist, numbered consecutively, and the three new ones are last.
    expect(onDisk.slice(0, 10).map((file) => file.slice(0, 4))).toEqual([
      '0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008', '0009', '0010',
    ])
    expect(onDisk.slice(7, 10)).toEqual(NEW_MIGRATIONS)
    for (const name of NEW_MIGRATIONS) expect(onDisk).toContain(name)
  })

  it('touches only profiles, promises and the reaction enum', () => {
    const TOUCHABLE = /\b(public\.profiles|public\.promises|public\.reaction_type)\b/
    for (const name of NEW_MIGRATIONS) {
      for (const statement of migration(name).split(';')) {
        const body = statement.replace(/^\s*--.*$/gm, '').trim()
        if (!body) continue
        expect(body, `${name}: ${body.slice(0, 60)}`).toMatch(TOUCHABLE)
      }
    }
  })

  /**
   * Prayer, repentance, action and confession content tables are untouched, so
   * records in them cannot be altered by this deploy. Asserted as an absence,
   * because a future edit that starts touching them must fail here first.
   */
  it('never reads, rewrites or drops an existing record table', () => {
    const UNTOUCHED = [
      'prayer_topics',
      'prayer_records',
      'prayer_folders',
      'repentances',
      'actions',
      'promise_checks',
      'confession_posts',
      'confession_reactions',
      'confession_comments',
    ]
    for (const name of NEW_MIGRATIONS) {
      const sql = migration(name).replace(/^\s*--.*$/gm, '')
      for (const table of UNTOUCHED) {
        // Schema-qualified and word-bounded: "reaction_type" is not "actions".
        const reference = new RegExp(`\\bpublic\\.${table}\\b`)
        expect(reference.test(sql), `${name} must not touch public.${table}`).toBe(false)
      }
      expect(sql, name).not.toMatch(/\bdrop\s+(table|column|type)\b/i)
      expect(sql, name).not.toMatch(/\bdelete\s+from\b/i)
      expect(sql, name).not.toMatch(/\btruncate\b/i)
    }
  })

  it('adds every new column as nullable or defaulted so existing rows stay valid', () => {
    // 0008: nullable, no default — an existing profile simply has no birth date.
    expect(migration('0008_journey_birth_date.sql')).toContain('add column if not exists birth_date date')
    expect(migration('0008_journey_birth_date.sql')).not.toMatch(/birth_date\s+date\s+not null/)
    // The check tolerates null explicitly, so a profile without one passes.
    expect(migration('0008_journey_birth_date.sql')).toContain('birth_date is null or')

    // 0009: not null but defaulted, and the default is the pre-0009 behaviour.
    const promises = migration('0009_promise_recurrence.sql')
    expect(promises).toContain("repeat_type text not null default 'none'")
    expect(promises).toContain("repeat_weekdays smallint[] not null default '{}'")
  })
})

describe('legacy prayer records', () => {
  /**
   * Prayer is not in the blast radius above, so the guarantee that matters is
   * that no prayer read path started depending on a 0008–0010 column.
   */
  it('reads no column added by 0008–0010', () => {
    const NEW_COLUMNS = ['birth_date', 'repeat_type', 'repeat_weekdays']
    const prayerFiles = [
      'app/(app)/prayer/page.tsx',
      'app/(app)/prayer/folders/page.tsx',
      'app/(app)/prayer/topic/[id]/page.tsx',
      'app/(app)/prayer/text/[id]/page.tsx',
      'app/(app)/prayer/actions.ts',
    ]
    for (const file of prayerFiles) {
      const code = readFileSync(join(ROOT, file), 'utf8')
      for (const column of NEW_COLUMNS) {
        expect(code, `${file} must not depend on ${column}`).not.toContain(column)
      }
    }
  })

  it('still lists a record that has no folder, the pre-folder shape', () => {
    const records = readFileSync(join(ROOT, 'src/data/records.ts'), 'utf8')
    // A folder filter is applied only when one is asked for, so an unfiled
    // record from before folders existed is still returned by the plain list.
    expect(records).not.toMatch(/\.not\('folder_id', 'is', null\)/)
  })
})

describe('legacy promise / action records (pre-0009)', () => {
  /** Exactly what a row written before 0009 deserialises to: no repeat fields. */
  const legacy = { started_on: '2026-09-01', due_date: null }

  it('treats a promise with no repeat_type as the one-off it was', () => {
    expect(recurrenceLabel(legacy)).toBe('한 번')
    expect(isScheduled('2026-09-01', legacy)).toBe(true)
    for (const date of ['2026-08-31', '2026-09-02', '2026-09-08', '2026-10-01']) {
      expect(isScheduled(date, legacy), date).toBe(false)
    }
  })

  it('gives that promise the same keep-rate it had before the migration', () => {
    // One scheduled day, ticked → 100%. Unticked → 0%. Nothing else changes.
    expect(keepRate(1, 1)).toBe(100)
    expect(keepRate(0, 1)).toBe(0)
  })

  it('treats an explicit none exactly like a missing repeat_type', () => {
    const migrated = { ...legacy, repeat_type: 'none' as const, repeat_weekdays: [] }
    for (const date of ['2026-08-31', '2026-09-01', '2026-09-02', '2026-09-08']) {
      expect(isScheduled(date, migrated), date).toBe(isScheduled(date, legacy))
    }
    expect(recurrenceLabel(migrated)).toBe(recurrenceLabel(legacy))
  })

  it('never divides by a zero target', () => {
    expect(keepRate(0, 0)).toBe(0)
    expect(Number.isFinite(keepRate(3, 0))).toBe(true)
  })

  it('keeps the legacy Action sentence readable from a promise', () => {
    // 0009 lets a promise repeat without a duplicate Action; the older records
    // that DO have Action rows must still be listed on the detail screen.
    const detail = readFileSync(join(ROOT, 'app/(app)/promise/[id]/page.tsx'), 'utf8')
    expect(detail).toContain('legacyActions')
    expect(detail).toContain("from('actions')")
  })
})

describe('legacy repentance records (4-field)', () => {
  it('still resolves the 돌이킴 약속 step that only old records carry', () => {
    const step = repentanceStep('turning_promise')
    expect(step.key).toBe('turning_promise')
    expect(step.column).toBe('turning_promise')
    expect(step.label).toBe('돌이킴 약속')
    expect(repentanceStepIndex('turning_promise')).toBe(2)
  })

  it('keeps all four record columns in the read contract', () => {
    expect(REPENTANCE_FLOW.map((step) => step.column)).toEqual([
      'looking_back',
      'realization',
      'turning_promise',
      'returning_note',
    ])
  })

  it('renders all four fields on the surfaces that read a stored record', () => {
    for (const file of [
      'app/(app)/repentance/[id]/page.tsx',
      'app/(app)/repentance/[id]/review/page.tsx',
    ]) {
      const code = readFileSync(join(ROOT, file), 'utf8')
      expect(code, file).toContain('turning_promise')
      expect(code, file).toContain('REPENTANCE_FLOW')
    }
    // The list still surfaces a legacy record's turning promise as its caption.
    expect(readFileSync(join(ROOT, 'app/(app)/repentance/page.tsx'), 'utf8')).toContain(
      'turning_promise',
    )
  })

  it('keeps the legacy review route reachable for records created before the 3-step flow', () => {
    const actions = readFileSync(join(ROOT, 'app/(app)/repentance/actions.ts'), 'utf8')
    expect(actions).toContain('export async function commitRepentance')
    expect(actions).toContain('/review')
  })

  it('falls back to the first step rather than throwing on an unknown key', () => {
    expect(repentanceStep('no_such_step').key).toBe('looking_back')
    expect(repentanceStepIndex('no_such_step')).toBe(0)
  })
})

describe('legacy confession reaction rows (pre-0010)', () => {
  const post = 'post-1'
  const me = 'me'

  it('recognises only the live vote values', () => {
    for (const vote of CONFESSION_VOTES) expect(isLiveVote(vote)).toBe(true)
    for (const legacy of LEGACY_REACTION_TYPES) expect(isLiveVote(legacy)).toBe(false)
    for (const junk of [null, undefined, 0, '', 'LIKE', {}]) expect(isLiveVote(junk)).toBe(false)
  })

  it('ignores a superseded row instead of counting or coercing it', () => {
    const rows = LEGACY_REACTION_TYPES.map((type, index) => ({
      post_id: post,
      user_id: `other-${index}`,
      type,
    }))
    const { counts, mine } = tallyReactions(rows, me)
    expect(counts.get(post)).toBeUndefined()
    expect(mine.get(post)).toBeUndefined()
  })

  it('shows a member no vote of their own when their only row is a legacy one', () => {
    const { counts, mine } = tallyReactions(
      [{ post_id: post, user_id: me, type: 'pray_together' }],
      me,
    )
    // Not pre-selected as 좋아요, and not counted against the post either.
    expect(mine.get(post)).toBeUndefined()
    expect(counts.get(post)).toBeUndefined()
  })

  it('counts live votes correctly while legacy rows sit alongside them', () => {
    const { counts, mine } = tallyReactions(
      [
        { post_id: post, user_id: 'a', type: 'pray_together' },
        { post_id: post, user_id: 'b', type: 'like' },
        { post_id: post, user_id: 'c', type: 'like' },
        { post_id: post, user_id: 'd', type: 'touched' },
        { post_id: post, user_id: me, type: 'dislike' },
      ],
      me,
    )
    expect(counts.get(post)?.get('like')).toBe(2)
    expect(counts.get(post)?.get('dislike')).toBe(1)
    expect(mine.get(post)).toBe('dislike')
  })

  it('keeps the tally for each post separate', () => {
    const { counts } = tallyReactions(
      [
        { post_id: 'p1', user_id: 'a', type: 'like' },
        { post_id: 'p2', user_id: 'a', type: 'dislike' },
        { post_id: 'p2', user_id: 'b', type: 'received_grace' },
      ],
      me,
    )
    expect(counts.get('p1')?.get('like')).toBe(1)
    expect(counts.get('p1')?.get('dislike')).toBeUndefined()
    expect(counts.get('p2')?.get('dislike')).toBe(1)
  })

  it('never writes a superseded value back', () => {
    const vote = readFileSync(join(ROOT, 'app/(app)/confession/vote-actions.ts'), 'utf8')
    // The action rejects anything that is not a live vote before touching the row.
    expect(vote).toMatch(/type !== 'like' && type !== 'dislike'/)
    for (const legacy of LEGACY_REACTION_TYPES) expect(vote).not.toContain(legacy)
  })
})
