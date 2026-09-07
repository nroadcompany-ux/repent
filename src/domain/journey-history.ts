/**
 * Journey History grouping (Issue #21 §D).
 *
 * Eras are display-only. They are arithmetic on two values the database
 * already holds — profiles.birth_date (0008) and life_events.occurred_on —
 * and nothing about them is stored. No era taxonomy is persisted, and
 * life_events.category is deliberately not used because it has no agreed
 * value convention.
 *
 * When a member has no birth date the grouping falls back to the calendar
 * year, so History still works rather than demanding a birth date first.
 *
 * What this module must never do (Owner decisions 6 and 7):
 *   · claim a prayer, repentance or promise is related to an event
 *   · infer an event's emotion from that day's mood record
 * Neither is representable here, and there is no field for either.
 */

export type HistoryEvent = {
  id: string
  occurred_on: string
  title: string
  body: string | null
  significance: number
}

export type HistoryBand = {
  key: string
  label: string
  events: HistoryEvent[]
}

/** Whole years elapsed from birth to the event date. Negative dates clamp to 0. */
export function ageAt(birthDate: string, onDate: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number)
  const [oy, om, od] = onDate.split('-').map(Number)
  if (!by || !bm || !bd || !oy || !om || !od) return 0
  let age = oy - by
  if (om < bm || (om === bm && od < bd)) age -= 1
  return Math.max(age, 0)
}

/** `10대` / `20대` … Below ten there is no decade to name. */
export function ageBandLabel(age: number): string {
  if (age < 10) return '10세 미만'
  return `${Math.floor(age / 10) * 10}대`
}

/**
 * Groups events into ascending eras — the order a life is lived, not the
 * reverse-chronological order a feed uses.
 */
export function groupHistory(
  events: ReadonlyArray<HistoryEvent>,
  birthDate: string | null,
): HistoryBand[] {
  const sorted = [...events].sort((a, b) => a.occurred_on.localeCompare(b.occurred_on))
  const bands = new Map<string, HistoryBand>()

  for (const event of sorted) {
    const { key, label } = birthDate
      ? bandForAge(ageAt(birthDate, event.occurred_on))
      : bandForYear(event.occurred_on)

    const band = bands.get(key) ?? { key, label, events: [] }
    band.events.push(event)
    bands.set(key, band)
  }

  return [...bands.values()].sort((a, b) => a.key.localeCompare(b.key))
}

function bandForAge(age: number): { key: string; label: string } {
  const decade = age < 10 ? 0 : Math.floor(age / 10) * 10
  // Zero-padded so string ordering matches numeric ordering.
  return { key: `age-${String(decade).padStart(3, '0')}`, label: ageBandLabel(age) }
}

function bandForYear(occurredOn: string): { key: string; label: string } {
  const year = occurredOn.slice(0, 4)
  return { key: `year-${year}`, label: `${year}년` }
}

/**
 * First-use example. UI-only: it is never written to life_events, so it cannot
 * enter search, calendar or statistics, and it disappears as soon as the
 * member has one real life event (Owner decision 5).
 *
 * The shape is a member in their late thirties, military service included, as
 * the Owner asked. Titles only — no fabricated dates, so nothing here can be
 * mistaken for a record.
 */
export const HISTORY_EXAMPLE_BANDS: ReadonlyArray<{ label: string; items: readonly string[] }> = [
  { label: '10세 미만', items: ['태어난 날'] },
  { label: '10대', items: ['중학교 입학', '고등학교 졸업'] },
  { label: '20대', items: ['군 입대', '군 전역', '첫 직장 입사'] },
  { label: '30대', items: ['이직', '결혼', '지금'] },
]
