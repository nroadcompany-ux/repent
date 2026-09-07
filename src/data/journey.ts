import 'server-only'

import { addDays, todayKst } from '@/lib/date'
import type { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

/**
 * Journey is the aggregation and navigation surface. docs/01 and docs/05 are
 * explicit that it does NOT own any other domain's source data, so everything
 * here is a read across the owning tables — nothing is copied into a Journey
 * table.
 */

export type JourneyGraphPoint = {
  date: string
  /** 1..5 self record. A day with no record simply has no point (AC-02). */
  level: number
}

export type JourneyLifeEvent = {
  id: string
  date: string
  title: string
  body: string | null
  significance: number
}

export type JourneyHome = {
  moods: JourneyGraphPoint[]
  lifeEvents: JourneyLifeEvent[]
  /**
   * 최근 여정 기록. Deliberately NOT windowed by the selected period: the list
   * answers "what did I last write", which a one-month graph window must not
   * be able to empty.
   */
  recentEvents: JourneyLifeEvent[]
  anchors: { birthDate: string | null; returnStartedOn: string | null }
}

/** One month back, matching the Figma caption "최근 1개월 · 내 마음과 삶의 흐름". */
export const JOURNEY_GRAPH_DAYS = 30

/**
 * Home graph window (Figma 121:5). A period is a read window and nothing else —
 * it is never stored, so switching it cannot change what any record means.
 */
export const JOURNEY_PERIODS = ['month', 'quarter', 'year'] as const
export type JourneyPeriod = (typeof JOURNEY_PERIODS)[number]

export const JOURNEY_PERIOD_LABELS: Record<JourneyPeriod, string> = {
  month: '월',
  quarter: '분기',
  year: '연',
}

export const JOURNEY_PERIOD_DAYS: Record<JourneyPeriod, number> = {
  month: JOURNEY_GRAPH_DAYS,
  quarter: 91,
  year: 365,
}

export function journeyPeriod(value: string | undefined | null): JourneyPeriod {
  return (JOURNEY_PERIODS as readonly string[]).includes(value ?? '')
    ? (value as JourneyPeriod)
    : 'month'
}

/** How many 최근 여정 기록 rows the home lists before 전체보기. */
const RECENT_EVENT_LIMIT = 3

export async function getJourneyHome(
  supabase: Supabase,
  userId: string,
  days: number = JOURNEY_GRAPH_DAYS,
): Promise<JourneyHome> {
  const today = todayKst()
  const from = addDays(today, -(days - 1))

  const [moodResult, eventResult, recentResult, profileResult] = await Promise.all([
    supabase
      .from('mood_records')
      .select('recorded_on, level')
      .eq('user_id', userId)
      .gte('recorded_on', from)
      .lte('recorded_on', today)
      .order('recorded_on'),

    supabase
      .from('life_events')
      .select('id, occurred_on, title, body, significance')
      .eq('user_id', userId)
      .gte('occurred_on', from)
      .lte('occurred_on', today)
      .order('occurred_on'),

    supabase
      .from('life_events')
      .select('id, occurred_on, title, body, significance')
      .eq('user_id', userId)
      .order('occurred_on', { ascending: false })
      .limit(RECENT_EVENT_LIMIT),

    supabase
      .from('profiles')
      .select('birth_date, created_at')
      .eq('id', userId)
      .maybeSingle(),
  ])

  const moods: JourneyGraphPoint[] = (moodResult.data ?? []).map((row) => ({
    date: row.recorded_on,
    level: row.level,
  }))

  const toEvent = (row: {
    id: string
    occurred_on: string
    title: string
    body: string | null
    significance: number
  }): JourneyLifeEvent => ({
    id: row.id,
    date: row.occurred_on,
    title: row.title,
    body: row.body,
    significance: row.significance,
  })

  return {
    moods,
    lifeEvents: (eventResult.data ?? []).map(toEvent),
    recentEvents: (recentResult.data ?? []).map(toEvent),
    anchors: {
      birthDate: profileResult.data?.birth_date ?? null,
      returnStartedOn: profileResult.data?.created_at?.slice(0, 10) ?? null,
    },
  }
}
