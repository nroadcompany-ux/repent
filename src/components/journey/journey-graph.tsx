import Link from 'next/link'

import type { JourneyGraphPoint, JourneyLifeEvent } from '@/data/journey'
import { addDays, daysBetween, todayKst } from '@/lib/date'

/**
 * 나의 여정 graph.
 *
 * Figma 3:38–3:52: white card 350x116 radius 22, three gridlines inset 20 and
 * spaced 26, data points drawn as 6px circles (r 2, stroke #6C43F3 width 2).
 *
 * Two canonical rules shape this chart and override the sample polyline drawn
 * in the Figma frame:
 *   1. AC-02 — a day with no record is Missing. It gets no point and is never
 *      interpolated. Mood points are therefore plotted individually.
 *   2. Owner UX instruction — "선으로 잇는 건 생애 사건 레이어뿐". Only the life
 *      event layer is drawn as a connected line, so a gap in mood can never
 *      read as a decline.
 * Neither layer is a faith measurement (docs/04).
 */

const VIEW_W = 350
const VIEW_H = 116
const INSET_X = 20
const TOP = 14
const BOTTOM = 92

const GRIDLINES = [27, 53, 79]

function xFor(date: string, from: string, days: number): number {
  const index = daysBetween(from, date)
  const span = Math.max(days - 1, 1)
  return INSET_X + (Math.min(Math.max(index, 0), span) / span) * (VIEW_W - INSET_X * 2)
}

/** Mood level 1..5 → y, low at the bottom. */
function yForMood(level: number): number {
  const clamped = Math.min(Math.max(level, 1), 5)
  return BOTTOM - ((clamped - 1) / 4) * (BOTTOM - TOP)
}

/** Life-event significance -5..5 → y. */
function yForEvent(significance: number): number {
  const clamped = Math.min(Math.max(significance, -5), 5)
  return BOTTOM - ((clamped + 5) / 10) * (BOTTOM - TOP)
}

export function JourneyGraph({
  moods,
  lifeEvents,
  days,
  href = '/journey/graph',
}: {
  moods: JourneyGraphPoint[]
  lifeEvents: JourneyLifeEvent[]
  days: number
  href?: string
}) {
  const today = todayKst()
  const from = addDays(today, -(days - 1))

  const eventPoints = lifeEvents.map((event) => ({
    ...event,
    x: xFor(event.date, from, days),
    y: yForEvent(event.significance),
  }))

  const eventPath = eventPoints.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')

  return (
    <Link href={href} className="mx-gutter block rounded-card bg-surface" aria-label="나의 여정 자세히 보기">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-[116px] w-full"
        role="img"
        aria-label={`최근 ${days}일 기록 ${moods.length}개, 삶의 사건 ${lifeEvents.length}개`}
      >
        {GRIDLINES.map((y) => (
          <rect key={y} x={INSET_X * 2} y={y} width={VIEW_W - INSET_X * 4} height={1} fill="#ECECF2" />
        ))}

        {/* Life events — the only layer joined by a line. */}
        {eventPoints.length > 1 ? (
          <polyline points={eventPath} fill="none" stroke="#6C43F3" strokeWidth={2} strokeLinecap="round" />
        ) : null}
        {eventPoints.map((point) => (
          <circle key={point.id} cx={point.x} cy={point.y} r={2} fill="#8A67F7" stroke="#6C43F3" strokeWidth={2} />
        ))}

        {/* Mood — discrete points only. A missing day is simply absent. */}
        {moods.map((mood) => (
          <circle
            key={mood.date}
            cx={xFor(mood.date, from, days)}
            cy={yForMood(mood.level)}
            r={2}
            fill="#FFFFFF"
            stroke="#6C43F3"
            strokeWidth={2}
          />
        ))}
      </svg>
    </Link>
  )
}

/**
 * First-use preview. Sample points are deliberately UI-only: they are never
 * written to a domain table and therefore never enter search, calendar or
 * statistics. Timeline anchors are real profile metadata, not mood values.
 */
export function JourneyGraphEmpty({
  birthDate,
  returnStartedOn,
}: {
  birthDate?: string | null
  returnStartedOn?: string | null
}) {
  return (
    <Link
      href="/journey/graph"
      className="mx-gutter block rounded-card bg-surface px-4 py-3"
      aria-label="예시로 보는 나의 여정"
    >
      <div className="flex items-center justify-between">
        <span className="text-caption rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
          예시
        </span>
        <span className="text-caption text-ink-faint">오늘 남긴 기록이 나의 여정이 됩니다</span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-1 h-[92px] w-full"
        role="img"
        aria-label="예시 여정 그래프"
      >
        {GRIDLINES.map((y) => (
          <rect key={y} x={INSET_X * 2} y={y} width={VIEW_W - INSET_X * 4} height={1} fill="#ECECF2" />
        ))}
        <polyline
          points="42,70 108,54 176,67 242,43 308,58"
          fill="none"
          stroke="#CDBEFC"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="4 5"
        />
        {[['42','70'],['108','54'],['176','67'],['242','43'],['308','58']].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#FFFFFF" stroke="#8A67F7" strokeWidth={2} />
        ))}
      </svg>

      <div className="flex items-center justify-between border-t border-line pt-2">
        <div>
          <p className="text-caption font-medium text-ink">● 태어난 날</p>
          <p className="text-caption text-ink-faint">{birthDate ?? '생년월일을 입력하면 표시됩니다'}</p>
        </div>
        <div className="text-right">
          <p className="text-caption font-medium text-ink">● RETURN을 시작한 날</p>
          <p className="text-caption text-ink-faint">{returnStartedOn ?? '오늘'}</p>
        </div>
      </div>
    </Link>
  )
}
