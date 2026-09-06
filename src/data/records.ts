import 'server-only'

import type { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

/**
 * Cross-domain record index.
 *
 * docs/02 Journey Return Flow: "Prayer / Repentance / Promise / Action /
 * Scripture / Life Event 기록은 Journey Calendar / Timeline / Search에서 재탐색
 * 가능해야 한다."
 *
 * Journey does not own or copy any of these rows — this module reads each
 * owning table and returns a common shape for display only (docs/01, docs/05).
 * Every query goes through the RLS-bound client, so it can only ever see the
 * signed-in member's own records.
 */

export const RECORD_KINDS = [
  'prayer',
  'repentance',
  'promise',
  'action',
  'mood',
  'life_event',
  'scripture',
] as const

export type RecordKind = (typeof RECORD_KINDS)[number]

export const RECORD_KIND_LABELS: Record<RecordKind, string> = {
  prayer: '기도',
  repentance: '회개',
  promise: '약속',
  action: '실행',
  mood: '마음',
  life_event: '삶의 사건',
  scripture: '말씀',
}

export type JourneyRecord = {
  kind: RecordKind
  id: string
  date: string
  title: string
  summary: string | null
  href: string
}

export type RecordFilter = {
  from?: string
  to?: string
  /** Free text; matched case-insensitively against titles and bodies. */
  query?: string
  kinds?: readonly RecordKind[]
  limit?: number
}

function wants(filter: RecordFilter, kind: RecordKind): boolean {
  return !filter.kinds || filter.kinds.length === 0 || filter.kinds.includes(kind)
}

function truncate(value: string | null, length = 120): string | null {
  if (!value) return null
  const collapsed = value.replace(/\s+/g, ' ').trim()
  return collapsed.length > length ? `${collapsed.slice(0, length)}…` : collapsed
}

export async function listRecords(
  supabase: Supabase,
  userId: string,
  filter: RecordFilter = {},
): Promise<JourneyRecord[]> {
  const limit = filter.limit ?? 200
  const like = filter.query ? `%${filter.query}%` : null

  const tasks: Array<Promise<JourneyRecord[]>> = []

  if (wants(filter, 'prayer')) {
    tasks.push(
      (async () => {
        let query = supabase
          .from('prayer_records')
          .select('id, topic_id, prayed_on, body')
          .eq('user_id', userId)
          .order('prayed_on', { ascending: false })
          .limit(limit)

        if (filter.from) query = query.gte('prayed_on', filter.from)
        if (filter.to) query = query.lte('prayed_on', filter.to)
        if (like) query = query.ilike('body', like)

        const { data } = await query
        return (data ?? []).map((row) => ({
          kind: 'prayer' as const,
          id: row.id,
          date: row.prayed_on,
          title: '기도 기록',
          summary: truncate(row.body),
          href: `/prayer/topic/${row.topic_id}`,
        }))
      })(),
    )
  }

  if (wants(filter, 'repentance')) {
    tasks.push(
      (async () => {
        let query = supabase
          .from('repentances')
          .select('id, title, looking_back, recorded_at, created_at, state')
          .eq('user_id', userId)
          .eq('state', 'recorded')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (like) query = query.or(`title.ilike.${like},looking_back.ilike.${like}`)

        const { data } = await query
        return (data ?? [])
          .map((row) => ({
            kind: 'repentance' as const,
            id: row.id,
            date: (row.recorded_at ?? row.created_at).slice(0, 10),
            title: row.title || '회개 기록',
            summary: truncate(row.looking_back),
            href: `/repentance/${row.id}`,
          }))
          .filter((row) => inRange(row.date, filter))
      })(),
    )
  }

  if (wants(filter, 'promise')) {
    tasks.push(
      (async () => {
        let query = supabase
          .from('promises')
          .select('id, title, purpose, started_on')
          .eq('user_id', userId)
          .order('started_on', { ascending: false })
          .limit(limit)

        if (filter.from) query = query.gte('started_on', filter.from)
        if (filter.to) query = query.lte('started_on', filter.to)
        if (like) query = query.ilike('title', like)

        const { data } = await query
        return (data ?? []).map((row) => ({
          kind: 'promise' as const,
          id: row.id,
          date: row.started_on,
          title: row.title,
          summary: truncate(row.purpose),
          href: `/promise/${row.id}`,
        }))
      })(),
    )
  }

  if (wants(filter, 'action')) {
    tasks.push(
      (async () => {
        let query = supabase
          .from('action_records')
          .select('id, action_id, outcome, note, recorded_on, actions(promise_id, title)')
          .eq('user_id', userId)
          .order('recorded_on', { ascending: false })
          .limit(limit)

        if (filter.from) query = query.gte('recorded_on', filter.from)
        if (filter.to) query = query.lte('recorded_on', filter.to)
        if (like) query = query.ilike('note', like)

        const { data } = await query
        return (data ?? []).map((row) => {
          const action = row.actions as unknown as { promise_id: string; title: string } | null
          return {
            kind: 'action' as const,
            id: row.id,
            date: row.recorded_on,
            title: action?.title ?? '실행 기록',
            summary: truncate(row.note),
            href: action ? `/promise/${action.promise_id}` : '/promise',
          }
        })
      })(),
    )
  }

  if (wants(filter, 'mood')) {
    tasks.push(
      (async () => {
        let query = supabase
          .from('mood_records')
          .select('recorded_on, level, note')
          .eq('user_id', userId)
          .order('recorded_on', { ascending: false })
          .limit(limit)

        if (filter.from) query = query.gte('recorded_on', filter.from)
        if (filter.to) query = query.lte('recorded_on', filter.to)
        if (like) query = query.ilike('note', like)

        const { data } = await query
        return (data ?? []).map((row) => ({
          kind: 'mood' as const,
          id: row.recorded_on,
          date: row.recorded_on,
          title: '마음 기록',
          summary: truncate(row.note),
          href: `/journey/graph?date=${row.recorded_on}`,
        }))
      })(),
    )
  }

  if (wants(filter, 'life_event')) {
    tasks.push(
      (async () => {
        let query = supabase
          .from('life_events')
          .select('id, occurred_on, title, body')
          .eq('user_id', userId)
          .order('occurred_on', { ascending: false })
          .limit(limit)

        if (filter.from) query = query.gte('occurred_on', filter.from)
        if (filter.to) query = query.lte('occurred_on', filter.to)
        if (like) query = query.or(`title.ilike.${like},body.ilike.${like}`)

        const { data } = await query
        return (data ?? []).map((row) => ({
          kind: 'life_event' as const,
          id: row.id,
          date: row.occurred_on,
          title: row.title,
          summary: truncate(row.body),
          href: '/journey/graph',
        }))
      })(),
    )
  }

  if (wants(filter, 'scripture')) {
    tasks.push(
      (async () => {
        let query = supabase
          .from('saved_scriptures')
          .select('id, reference, memo, saved_on')
          .eq('user_id', userId)
          .order('saved_on', { ascending: false })
          .limit(limit)

        if (filter.from) query = query.gte('saved_on', filter.from)
        if (filter.to) query = query.lte('saved_on', filter.to)
        if (like) query = query.or(`reference.ilike.${like},memo.ilike.${like}`)

        const { data } = await query
        return (data ?? []).map((row) => ({
          kind: 'scripture' as const,
          id: row.id,
          date: row.saved_on,
          title: row.reference,
          summary: truncate(row.memo),
          href: '/journey/scripture',
        }))
      })(),
    )
  }

  const groups = await Promise.all(tasks)
  return groups
    .flat()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit)
}

function inRange(date: string, filter: RecordFilter): boolean {
  if (filter.from && date < filter.from) return false
  if (filter.to && date > filter.to) return false
  return true
}
