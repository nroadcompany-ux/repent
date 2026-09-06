import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { tallyReactions } from '../src/domain/confession-reactions'
import { isScheduled, keepRate, recurrenceLabel, weeklyWeekdays } from '../src/domain/promise'
import {
  ACTION_FAILURE_IS_SIN,
  CONFESSION_SHOWS_COMMENT_COUNT,
  CONFESSION_VOTES,
  CONFESSION_VOTE_ICONS,
  PROMISE_KEEP_RATE_IS_BEHAVIOURAL_ONLY,
} from '../src/domain/product-lock'
import {
  REPENTANCE_FLOW,
  REPENTANCE_WRITE_FLOW,
  repentanceWriteStep,
  repentanceWriteStepIndex,
} from '../src/domain/repentance'

/**
 * Owner UX critical paths (decisions of 2026-09-06, delivered on
 * integration/owner-ux-20260907).
 *
 * These cover the four journeys that migrations 0008–0010 unlock, at the level
 * that can be proven without a database: the rules themselves, and the wiring
 * of the screens that carry them. Anything that needs a real row is called out
 * as such in the migration runbook rather than faked here.
 */

const ROOT = join(__dirname, '..')

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8')
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/^\s*--.*$/gm, '')
}

describe('journey birth anchor (0008)', () => {
  it('reads the anchor and tolerates a profile that has none', () => {
    const journey = read('src/data/journey.ts')
    expect(journey).toContain("select('birth_date, created_at')")
    // Both anchors are nullable all the way out; nothing throws on a null.
    expect(journey).toContain('birthDate: profileResult.data?.birth_date ?? null')
    expect(journey).toContain('returnStartedOn: profileResult.data?.created_at?.slice(0, 10) ?? null')
    expect(journey).toContain('birthDate: string | null')
  })

  it('shows a prompt rather than an empty slot when no birth date is set', () => {
    const graph = read('src/components/journey/journey-graph.tsx')
    expect(graph).toContain("{birthDate ?? '생년월일을 입력하면 표시됩니다'}")
    expect(graph).toContain("{returnStartedOn ?? '오늘'}")
    expect(graph).toContain('태어난 날')
    expect(graph).toContain('RETURN을 시작한 날')
  })

  it('passes both anchors from the page into the graph', () => {
    const page = read('app/(app)/journey/page.tsx')
    expect(page).toContain('birthDate={home.anchors.birthDate}')
    expect(page).toContain('returnStartedOn={home.anchors.returnStartedOn}')
  })

  /**
   * 0008 constrains birth_date to `<= current_date`. The two screens that write
   * one reject a future date first, so the constraint is never the thing the
   * member meets — they get a calm error instead of a failed write.
   */
  it('rejects a future birth date before the database has to', () => {
    expect(migrationSql('0008_journey_birth_date.sql')).toContain(
      'check (birth_date is null or birth_date <= current_date)',
    )
    for (const file of ['app/onboarding/actions.ts', 'app/(app)/settings/actions.ts']) {
      const code = stripComments(read(file))
      expect(code, file).toMatch(/birthDate > today/)
      expect(code, file).toContain('error=birth')
    }
  })

  it('keeps the anchor out of the community projection', () => {
    // docs/07: a birth date is profile data, not something the feed can read.
    const hardening = migrationSql('0005_security_hardening.sql')
    const projection = hardening.slice(
      hardening.indexOf('create table public.community_profiles'),
      hardening.indexOf('alter table public.community_profiles'),
    )
    expect(projection).not.toContain('birth_date')
  })
})

function migrationSql(name: string): string {
  return read(`supabase/migrations/${name}`)
}

describe('repentance three-step direct save', () => {
  it('walks the three steps in order and stops there', () => {
    expect(REPENTANCE_WRITE_FLOW).toHaveLength(3)
    expect(REPENTANCE_WRITE_FLOW.map((step) => step.key)).toEqual([
      'looking_back',
      'realization',
      'returning',
    ])
    expect(repentanceWriteStepIndex('looking_back')).toBe(0)
    expect(repentanceWriteStepIndex('returning')).toBe(2)
    // An unknown or legacy step key lands on the first step, never a blank page.
    expect(repentanceWriteStep('turning_promise').key).toBe('looking_back')
    expect(repentanceWriteStepIndex('turning_promise')).toBe(0)
  })

  it('writes only into columns the record contract already has', () => {
    const recordColumns = REPENTANCE_FLOW.map((step) => step.column)
    for (const step of REPENTANCE_WRITE_FLOW) {
      expect(recordColumns, step.key).toContain(step.column)
    }
    // 돌이킴 약속 is never written by the new flow, only read from old records.
    expect(REPENTANCE_WRITE_FLOW.map((step) => step.column)).not.toContain('turning_promise')
  })

  it('asks only the first step for a date, and never a future one', () => {
    const page = stripComments(read('app/(app)/repentance/[id]/write/page.tsx'))
    expect(page).toMatch(/step\.key === 'looking_back'/)
    expect(page).toContain('name="recorded_on"')
    expect(page).toContain('max={today}')
  })

  it('persists that date as the recorded day, at KST noon', () => {
    const actions = stripComments(read('app/(app)/repentance/actions.ts'))
    expect(actions).toMatch(/\$\{date\}T12:00:00\+09:00/)
    expect(actions).toMatch(/\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\//)
    // Written on the first step's save, alongside that step's own column.
    const payload = actions.slice(actions.indexOf('const payload ='))
    expect(payload.slice(0, payload.indexOf('const { error }'))).toContain('recorded_at')
  })

  it('returns to the list on finish, with the record marked recorded', () => {
    const actions = stripComments(read('app/(app)/repentance/actions.ts'))
    const finish = actions.slice(actions.indexOf("intent === 'finish'"))
    const block = finish.slice(0, finish.indexOf("redirect('/repentance?saved=recorded')"))
    expect(block).toContain("state: 'recorded'")
    // Journey shows repentance counts, so it is revalidated with the list.
    expect(block).toContain("revalidatePath('/repentance')")
    expect(block).toContain("revalidatePath('/journey')")
  })

  it('keeps a save failure recoverable instead of losing what was typed', () => {
    const actions = stripComments(read('app/(app)/repentance/actions.ts'))
    // Failure returns to the same step, not to the start of the flow.
    expect(actions).toMatch(/error=save`\)/)
    expect(actions).toMatch(/write\?step=\$\{step\}&error=save/)
    const page = read('app/(app)/repentance/[id]/write/page.tsx')
    expect(page).toContain('적으신 내용은 화면에 그대로 있습니다')
  })
})

describe('promise recurrence and keep-rate (0009)', () => {
  const weekly = {
    started_on: '2026-09-07', // Monday
    due_date: null,
    repeat_type: 'weekly' as const,
    repeat_weekdays: [1, 3], // Mon, Wed
  }

  it('schedules a daily promise on every day in its window', () => {
    const daily = { started_on: '2026-09-01', due_date: '2026-09-03', repeat_type: 'daily' as const }
    expect(['2026-09-01', '2026-09-02', '2026-09-03'].every((d) => isScheduled(d, daily))).toBe(true)
    expect(isScheduled('2026-08-31', daily)).toBe(false)
    expect(isScheduled('2026-09-04', daily)).toBe(false)
    expect(recurrenceLabel(daily)).toBe('매일')
  })

  it('schedules a weekly promise only on the chosen weekdays', () => {
    expect(isScheduled('2026-09-07', weekly)).toBe(true) // Mon
    expect(isScheduled('2026-09-09', weekly)).toBe(true) // Wed
    expect(isScheduled('2026-09-08', weekly)).toBe(false) // Tue
    expect(isScheduled('2026-09-14', weekly)).toBe(true) // next Mon
    expect(recurrenceLabel(weekly)).toBe('매주 월·수')
  })

  it('falls back to the start weekday when no weekday was selected', () => {
    const noSelection = { ...weekly, repeat_weekdays: [] }
    expect(weeklyWeekdays(noSelection)).toEqual([1])
    expect(isScheduled('2026-09-14', noSelection)).toBe(true)
    expect(isScheduled('2026-09-09', noSelection)).toBe(false)
    expect(recurrenceLabel(noSelection)).toBe('매주 월')
  })

  it('schedules monthly and yearly on the same calendar day', () => {
    const monthly = { started_on: '2026-09-07', due_date: null, repeat_type: 'monthly' as const }
    expect(isScheduled('2026-10-07', monthly)).toBe(true)
    expect(isScheduled('2026-10-08', monthly)).toBe(false)
    expect(recurrenceLabel(monthly)).toBe('매월 7일')

    const yearly = { started_on: '2026-09-07', due_date: null, repeat_type: 'yearly' as const }
    expect(isScheduled('2027-09-07', yearly)).toBe(true)
    expect(isScheduled('2027-09-08', yearly)).toBe(false)
    expect(recurrenceLabel(yearly)).toBe('매년 9월 7일')
  })

  it('never schedules outside start and due', () => {
    const bounded = { ...weekly, due_date: '2026-09-09' }
    expect(isScheduled('2026-09-02', bounded)).toBe(false) // before start
    expect(isScheduled('2026-09-14', bounded)).toBe(false) // after due
    expect(isScheduled('2026-09-09', bounded)).toBe(true) // on due
  })

  it('computes keep-rate as a rounded percentage of scheduled days', () => {
    expect(keepRate(0, 4)).toBe(0)
    expect(keepRate(1, 3)).toBe(33)
    expect(keepRate(2, 3)).toBe(67)
    expect(keepRate(4, 4)).toBe(100)
  })

  it('validates start <= end and a weekly weekday before writing', () => {
    const actions = stripComments(read('app/(app)/promise/actions.ts'))
    // Both create and edit guard both rules.
    expect(actions.match(/dueDate < startedOn/g)?.length).toBe(2)
    expect(actions.match(/recurrence === 'weekly' && weekdays\.length === 0/g)?.length).toBe(2)
    expect(actions).toContain('error=date')
    expect(actions).toContain('error=weekday')
  })

  it('only ever sends a value the 0009 check constraint accepts', () => {
    const sql = migrationSql('0009_promise_recurrence.sql')
    expect(sql).toContain("check (repeat_type in ('none', 'daily', 'weekly', 'monthly', 'yearly'))")
    expect(sql).toContain('repeat_weekdays <@ array[0,1,2,3,4,5,6]::smallint[]')

    const actions = read('app/(app)/promise/actions.ts')
    const parser = actions.slice(actions.indexOf("text(form, 'repeat_type')"))
    expect(parser.slice(0, 400)).toMatch(/none|daily|weekly|monthly|yearly/)
    // Weekday input is clamped to 0–6 so the array constraint cannot be hit.
    expect(actions).toMatch(/(0|1|2|3|4|5|6)/)
  })

  it('offers weekday selection in the form whenever weekly is chosen', () => {
    const fields = read('app/(app)/promise/_components/recurrence-fields.tsx')
    expect(fields).toContain('name="repeat_type"')
    expect(fields).toContain('name="repeat_weekdays"')
  })

  it('presents keep-rate as behaviour, never as a faith measurement', () => {
    expect(PROMISE_KEEP_RATE_IS_BEHAVIOURAL_ONLY).toBe(true)
    expect(ACTION_FAILURE_IS_SIN).toBe(false)

    const detail = stripComments(read('app/(app)/promise/[id]/page.tsx'))
    expect(detail).toContain('keepRate')
    // The screen says what the number is not. That sentence is the guardrail,
    // so it is asserted present rather than banned as a mention of 신앙.
    expect(detail).toContain('신앙을 재는 숫자가 아닙니다')
    expect(detail).toContain('내가 직접 지켰다고 남긴 기록')
    // A day not ticked is simply not ticked — never named as a failure.
    for (const forbidden of ['실패', '미달', '순종도']) {
      expect(detail, forbidden).not.toContain(forbidden)
    }
  })
})

describe('confession like / dislike / comment count (0010)', () => {
  it('offers exactly two votes plus a comment figure', () => {
    expect([...CONFESSION_VOTES]).toEqual(['like', 'dislike'])
    expect(CONFESSION_VOTE_ICONS.like).toBe('👍')
    expect(CONFESSION_VOTE_ICONS.dislike).toBe('👎')
    expect(CONFESSION_SHOWS_COMMENT_COUNT).toBe(true)
  })

  it('counts a real feed the way the screen will render it', () => {
    const { counts, mine } = tallyReactions(
      [
        { post_id: 'p1', user_id: 'me', type: 'like' },
        { post_id: 'p1', user_id: 'b', type: 'like' },
        { post_id: 'p1', user_id: 'c', type: 'dislike' },
      ],
      'me',
    )
    expect(counts.get('p1')?.get('like')).toBe(2)
    expect(counts.get('p1')?.get('dislike')).toBe(1)
    expect(mine.get('p1')).toBe('like')
    // A post nobody reacted to has no entry, which the bar renders as 0.
    expect(counts.get('p2')).toBeUndefined()
  })

  it('records one vote per member per post, and lets it be taken back', () => {
    const vote = stripComments(read('app/(app)/confession/vote-actions.ts'))
    // Same value again → the row is removed (un-vote), not duplicated.
    expect(vote).toMatch(/existing\?\.type[\s\S]{0,40}=== type/)
    expect(vote).toContain('.delete()')
    // A different value → one row is replaced, enforced by the composite key.
    expect(vote).toContain("onConflict: 'post_id,user_id'")
    expect(migrationSql('0003_community.sql')).toContain('primary key (post_id, user_id)')
  })

  it('shows all three figures on both the feed and the detail screen', () => {
    for (const file of ['app/(app)/confession/page.tsx', 'app/(app)/confession/[id]/page.tsx']) {
      const code = stripComments(read(file))
      expect(code, file).toContain('<ReactionBar')
      expect(code, file).toContain('commentCount=')
      expect(code, file).toContain('tallyReactions')
    }
  })

  it('shows a zeroed sample row on an empty feed, marked 예시', () => {
    const feed = read('app/(app)/confession/page.tsx')
    expect(feed.match(/id: 'sample-\d\d'/g)?.length).toBe(10)
    expect(feed).toContain('RETURN 예시')
    const sampleRow = feed.slice(feed.indexOf('function SampleReactionRow'))
    for (const icon of ['👍', '👎', '💬']) expect(sampleRow.slice(0, 600)).toContain(icon)
    // Sample counts are literal zeros — never a fabricated engagement number.
    expect(sampleRow.slice(0, 600)).toMatch(/\['👍', 0,/)
    expect(sampleRow.slice(0, 600)).toMatch(/\['👎', 0,/)
    expect(sampleRow.slice(0, 600)).toMatch(/\['💬', 0,/)
  })

  it('keeps 신고 / 차단 out of the inline feed', () => {
    const feed = stripComments(read('app/(app)/confession/page.tsx'))
    expect(feed).not.toContain('reportConfession')
    expect(feed).not.toContain('blockAuthor')
    expect(feed).not.toContain('reportComment')
  })

  it('revalidates both surfaces so a count is never stale after a vote', () => {
    const vote = read('app/(app)/confession/vote-actions.ts')
    expect(vote).toContain("revalidatePath('/confession')")
    expect(vote).toContain('revalidatePath(`/confession/${postId}`)')
  })
})
