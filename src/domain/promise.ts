/**
 * Promise recurrence and keep-rate.
 *
 * Extracted verbatim from the Promise detail screen so the rules can be tested
 * directly. Migration 0009 added promises.repeat_type / repeat_weekdays; a row
 * written before it simply has neither field, and every default here is chosen
 * so such a row keeps behaving exactly as it did — a single day on started_on.
 *
 * Keep-rate is behavioural only (docs/04, PROMISE_KEEP_RATE_IS_BEHAVIOURAL_ONLY):
 * it measures days the member themselves ticked, never faith, and a missed day
 * is never a failure state.
 */

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

/** The fields recurrence needs. `repeat_*` is optional: a pre-0009 row lacks it. */
export type PromiseWithRepeat = {
  started_on: string
  due_date: string | null
  repeat_type?: RepeatType
  repeat_weekdays?: number[]
}

/** Day of week for a KST calendar date, 0 = Sunday. */
export function jsDay(date: string): number {
  return new Date(`${date}T12:00:00+09:00`).getDay()
}

/** Weekdays a weekly promise falls on. Empty selection follows its start day. */
export function weeklyWeekdays(promise: PromiseWithRepeat): number[] {
  return promise.repeat_weekdays?.length ? promise.repeat_weekdays : [jsDay(promise.started_on)]
}

export function isScheduled(date: string, promise: PromiseWithRepeat): boolean {
  if (date < promise.started_on) return false
  if (promise.due_date && date > promise.due_date) return false
  const type = promise.repeat_type ?? 'none'
  if (type === 'none') return date === promise.started_on
  if (type === 'daily') return true
  if (type === 'weekly') return weeklyWeekdays(promise).includes(jsDay(date))
  if (type === 'monthly') return date.slice(8, 10) === promise.started_on.slice(8, 10)
  return date.slice(5, 10) === promise.started_on.slice(5, 10)
}

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const

export function recurrenceLabel(promise: PromiseWithRepeat): string {
  const type = promise.repeat_type ?? 'none'
  if (type === 'none') return '한 번'
  if (type === 'daily') return '매일'
  if (type === 'monthly') return `매월 ${Number(promise.started_on.slice(8, 10))}일`
  if (type === 'yearly')
    return `매년 ${Number(promise.started_on.slice(5, 7))}월 ${Number(promise.started_on.slice(8, 10))}일`
  const days = weeklyWeekdays(promise)
    .map((day) => WEEKDAY_NAMES[day])
    .join('·')
  return `매주 ${days}`
}

/**
 * Share of scheduled days the member ticked, 0–100. No scheduled day yet is 0,
 * not an error and not an empty state to apologise for.
 */
export function keepRate(done: number, target: number): number {
  return target > 0 ? Math.round((done / target) * 100) : 0
}
