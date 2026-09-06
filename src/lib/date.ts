/**
 * Date helpers.
 *
 * RETURN records days, not instants: "오늘의 기도", "3일치 체크", "이 날의 기록".
 * The database stores those as `date` columns in Asia/Seoul, so every
 * day-boundary calculation here is done in KST regardless of where the server
 * or the reader happens to be.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** Today in KST as `YYYY-MM-DD`. */
export function todayKst(now: Date = new Date()): string {
  return toIsoDate(now)
}

export function toIsoDate(value: Date): string {
  const shifted = new Date(value.getTime() + KST_OFFSET_MS)
  return shifted.toISOString().slice(0, 10)
}

/** `YYYY-MM-DD` shifted by whole days, still in KST. */
export function addDays(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T00:00:00Z`)
  base.setUTCDate(base.getUTCDate() + days)
  return base.toISOString().slice(0, 10)
}

/** Inclusive list of dates from `from` to `to`. */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = []
  let cursor = from
  // Guard against an inverted range producing an unbounded loop.
  for (let i = 0; i < 400 && cursor <= to; i += 1) {
    out.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return out
}

export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`)
  const b = Date.parse(`${to}T00:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

export function weekdayKo(isoDate: string): string {
  const index = new Date(`${isoDate}T00:00:00Z`).getUTCDay()
  return WEEKDAYS[index] ?? ''
}

/** `9월 6일` — the compact form used in list rows. */
export function formatMonthDay(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  if (!month || !day) return isoDate
  return `${Number(month)}월 ${Number(day)}일`
}

/** `2026년 9월 6일 (토)` — the long form used on detail screens. */
export function formatFullDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  return `${year}년 ${Number(month)}월 ${Number(day)}일 (${weekdayKo(isoDate)})`
}

/** `오늘` / `어제` / `그제` / `9월 3일` — used by the 3-day keep strip. */
export function relativeDayLabel(isoDate: string, today: string = todayKst()): string {
  const diff = daysBetween(isoDate, today)
  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  if (diff === 2) return '그제'
  return formatMonthDay(isoDate)
}

/**
 * Days remaining until a due date. Positive = still ahead, 0 = today,
 * negative = past. Presented as D-n / D-DAY, never as a failure.
 */
export function dDay(dueDate: string, today: string = todayKst()): number {
  return daysBetween(today, dueDate)
}

export function dDayLabel(dueDate: string, today: string = todayKst()): string {
  const remaining = dDay(dueDate, today)
  if (remaining === 0) return 'D-DAY'
  if (remaining > 0) return `D-${remaining}`
  return `D+${Math.abs(remaining)}`
}
