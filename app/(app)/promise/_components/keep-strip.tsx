import { relativeDayLabel } from '@/lib/date'
import { bumpPromiseCheck } from '../actions'

/**
 * Three-day keep strip — 오늘 / 어제 / 그제.
 *
 * The Owner's constraint was that a member may hold 10 or 100 promises, so the
 * strip has to stay readable at that scale: one compact row per promise, three
 * taps wide, no per-card checkbox grid.
 *
 * A promise with daily_target > 1 shows a count (예: 2/3) and each tap adds
 * one, wrapping to zero at the target so a mistap costs one more tap.
 *
 * An unfilled cell means "not recorded". docs/04: Action Failure != Sin, so the
 * strip never marks a day red, never says missed, and never breaks a streak —
 * there is no streak.
 */
export function KeepStrip({
  promiseId,
  dailyTarget,
  dates,
  counts,
  returnTo,
}: {
  promiseId: string
  dailyTarget: number
  dates: string[]
  counts: Map<string, number>
  returnTo: string
}) {
  return (
    <div className="flex gap-[6px]">
      {dates.map((date) => {
        const done = counts.get(date) ?? 0
        const complete = done >= dailyTarget
        const partial = done > 0 && !complete

        return (
          <form key={date} action={bumpPromiseCheck}>
            <input type="hidden" name="promise_id" value={promiseId} />
            <input type="hidden" name="check_date" value={date} />
            <input type="hidden" name="daily_target" value={dailyTarget} />
            <input type="hidden" name="done_count" value={done} />
            <input type="hidden" name="return_to" value={returnTo} />
            <button
              type="submit"
              aria-label={`${relativeDayLabel(date)} 기록 ${done} / ${dailyTarget}`}
              className={`flex h-[42px] w-[48px] flex-col items-center justify-center rounded-control border transition-colors ${
                complete
                  ? 'border-accent bg-accent text-white'
                  : partial
                    ? 'border-accent bg-accent-tint text-accent'
                    : 'border-line bg-surface text-ink-faint'
              }`}
            >
              <span className="text-caption font-medium leading-[15px]">
                {relativeDayLabel(date)}
              </span>
              <span className="text-caption leading-[15px]">
                {dailyTarget > 1 ? `${done}/${dailyTarget}` : complete ? '✓' : '·'}
              </span>
            </button>
          </form>
        )
      })}
    </div>
  )
}
