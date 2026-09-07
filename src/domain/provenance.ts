/**
 * Promise provenance (migration 0011).
 *
 * A promise may record which private record it came from — in practice the
 * 돌이킴 약속 of a repentance. The pointer is a soft one: a kind plus an id,
 * with no foreign key, exactly as ShareCopy does in 0003. Deleting the source
 * repentance must never delete the promise, because the promise is the
 * member's own commitment rather than a view of the record it started from.
 *
 * These helpers are pure so the validation the screen and the server action
 * both rely on can be tested directly, and so a half-filled pointer can never
 * reach the database (0011 enforces the same rule as a CHECK).
 */

import type { ShareSourceKind } from '@/lib/supabase/database.types'

/** The enum values 0003 created. No new kind is introduced by 0011. */
export const SHARE_SOURCE_KINDS = [
  'repentance',
  'prayer_record',
  'prayer_topic',
  'promise',
  'action_record',
] as const

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isShareSourceKind(value: unknown): value is ShareSourceKind {
  return typeof value === 'string' && (SHARE_SOURCE_KINDS as readonly string[]).includes(value)
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value)
}

export type Provenance = { source_kind: ShareSourceKind; source_id: string }

/**
 * Both halves or neither. A partial pointer is dropped rather than stored,
 * which is what keeps the 0011 pair CHECK from ever being the thing a member
 * meets.
 */
export function readProvenance(kind: unknown, id: unknown): Provenance | null {
  return isShareSourceKind(kind) && isUuid(id) ? { source_kind: kind, source_id: id } : null
}

/** Label shown on a promise that started somewhere else. Never the body. */
export const PROVENANCE_LABELS: Record<ShareSourceKind, string> = {
  repentance: '이 약속은 회개 기록에서 시작되었습니다',
  prayer_record: '이 약속은 기도문에서 시작되었습니다',
  prayer_topic: '이 약속은 기도제목에서 시작되었습니다',
  promise: '이 약속은 다른 약속에서 시작되었습니다',
  action_record: '이 약속은 실행 기록에서 시작되었습니다',
}

/** Where the source lives, when the member is allowed to open it. */
export function provenanceHref(kind: ShareSourceKind, id: string): string | null {
  if (kind === 'repentance') return `/repentance/${id}`
  if (kind === 'prayer_topic') return `/prayer/topic/${id}`
  if (kind === 'prayer_record') return `/prayer/text/${id}`
  if (kind === 'promise') return `/promise/${id}`
  return null
}
