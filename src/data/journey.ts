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
  significance: number
}

export type JourneyHome = {
  scripture: { reference: string; memo: string | null } | null
  reading: { book: string; chapter: number; readOn: string; chaptersRead: number } | null
  prayer: { activeTopics: number; next: { id: string; title: string } | null }
  promise: { active: number; doneToday: number; targetToday: number }
  moods: JourneyGraphPoint[]
  lifeEvents: JourneyLifeEvent[]
  anchors: { birthDate: string | null; returnStartedOn: string | null }
  hasAnyRecord: boolean
}

/** One month back, matching the Figma caption "최근 1개월 · 내 마음과 삶의 흐름". */
export const JOURNEY_GRAPH_DAYS = 30

export async function getJourneyHome(supabase: Supabase, userId: string): Promise<JourneyHome> {
  const today = todayKst()
  const from = addDays(today, -(JOURNEY_GRAPH_DAYS - 1))

  const [
    scriptureResult,
    readingResult,
    chaptersReadResult,
    topicsResult,
    promisesResult,
    checksResult,
    moodResult,
    eventResult,
    profileResult,
  ] = await Promise.all([
      supabase
        .from('saved_scriptures')
        .select('reference, memo')
        .eq('user_id', userId)
        .order('saved_on', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('bible_reading_progress')
        .select('book, chapter, read_on')
        .eq('user_id', userId)
        .order('read_on', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('bible_reading_progress')
        .select('book', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('prayer_topics')
        .select('id, title', { count: 'exact' })
        .eq('user_id', userId)
        .is('closed_at', null)
        .order('updated_at', { ascending: false })
        .limit(1),

      supabase
        .from('promises')
        .select('id, daily_target', { count: 'exact' })
        .eq('user_id', userId)
        .eq('state', 'active'),

      supabase
        .from('promise_checks')
        .select('done_count')
        .eq('user_id', userId)
        .eq('check_date', today),

      supabase
        .from('mood_records')
        .select('recorded_on, level')
        .eq('user_id', userId)
        .gte('recorded_on', from)
        .lte('recorded_on', today)
        .order('recorded_on'),

      supabase
        .from('life_events')
        .select('id, occurred_on, title, significance')
        .eq('user_id', userId)
        .gte('occurred_on', from)
        .lte('occurred_on', today)
        .order('occurred_on'),

      supabase
        .from('profiles')
        .select('birth_date, created_at')
        .eq('id', userId)
        .maybeSingle(),
    ])

  const chaptersRead = chaptersReadResult.count

  const nextTopic = topicsResult.data?.[0] ?? null
  const activePromises = promisesResult.data ?? []
  const targetToday = activePromises.reduce((sum, row) => sum + (row.daily_target ?? 1), 0)
  const doneToday = (checksResult.data ?? []).reduce((sum, row) => sum + (row.done_count ?? 0), 0)

  const moods: JourneyGraphPoint[] = (moodResult.data ?? []).map((row) => ({
    date: row.recorded_on,
    level: row.level,
  }))

  const lifeEvents: JourneyLifeEvent[] = (eventResult.data ?? []).map((row) => ({
    id: row.id,
    date: row.occurred_on,
    title: row.title,
    significance: row.significance,
  }))

  return {
    scripture: scriptureResult.data
      ? { reference: scriptureResult.data.reference, memo: scriptureResult.data.memo }
      : null,
    reading: readingResult.data
      ? {
          book: readingResult.data.book,
          chapter: readingResult.data.chapter,
          readOn: readingResult.data.read_on,
          chaptersRead: chaptersRead ?? 0,
        }
      : null,
    prayer: {
      activeTopics: topicsResult.count ?? 0,
      next: nextTopic ? { id: nextTopic.id, title: nextTopic.title } : null,
    },
    promise: { active: promisesResult.count ?? 0, doneToday, targetToday },
    moods,
    lifeEvents,
    anchors: {
      birthDate: profileResult.data?.birth_date ?? null,
      returnStartedOn: profileResult.data?.created_at?.slice(0, 10) ?? null,
    },
    hasAnyRecord:
      Boolean(scriptureResult.data) ||
      Boolean(readingResult.data) ||
      (topicsResult.count ?? 0) > 0 ||
      (promisesResult.count ?? 0) > 0 ||
      moods.length > 0 ||
      lifeEvents.length > 0,
  }
}
