/**
 * RETURN Product Lock.
 *
 * Canonical Product Meaning, encoded once so that screens cannot drift from it
 * and so that a regression test can prove the forbidden concepts never appear
 * in shipped source. Sources: docs/00, docs/01, docs/03, docs/04, docs/06,
 * docs/08, docs/09, docs/10 on origin/main (all LOCKED, owner_approval
 * 2026-09-06), plus the Owner execution orders of the same date.
 *
 * Nothing in this file may be relaxed without an Owner decision.
 */

/* -------------------------------------------------------------------------
 * Theological guardrail (docs/00, docs/05, docs/06)
 * ---------------------------------------------------------------------- */

/** Spiritual-state enums that must never exist as a user state anywhere. */
export const FORBIDDEN_STATES = [
  'ANSWERED',
  'FORGIVEN',
  'SAVED',
  'REPENTED',
  'FAITHFUL',
  'SPIRITUALLY_FAILED',
] as const

/**
 * Measurements the product must never produce. The system does not judge sin,
 * repentance sufficiency, forgiveness, salvation, answered prayer, or God's
 * will, and it does not rank members against each other.
 */
export const FORBIDDEN_METRICS = [
  '영적 점수',
  '신앙 점수',
  '신앙 등급',
  '순종 점수',
  '회개 완료율',
  '하나님과의 거리',
] as const

/** Community shapes banned by docs/04 and docs/08. */
export const FORBIDDEN_COMMUNITY_SHAPES = ['인기순', '영적 랭킹'] as const

/* -------------------------------------------------------------------------
 * Navigation (docs/00 Owner Lock, docs/01, AC-01)
 * ---------------------------------------------------------------------- */

export const MAIN_NAV = ['여정', '기도', '회개', '약속', '고백'] as const

/**
 * Action is not a bottom tab. It is an execution record inside Promise.
 * Search is not a tab either — it lives inside Journey.
 */
export const ACTION_IS_BOTTOM_TAB = false
export const SEARCH_LIVES_IN_JOURNEY = true

/* -------------------------------------------------------------------------
 * Repentance (Owner UX simplification 2026-09-06)
 * ---------------------------------------------------------------------- */

/** New records use three plain-language writing steps. Legacy DB fields remain. */
export const REPENTANCE_STEPS = ['있었던 일', '깨달은 것', '돌아가기'] as const

/** Exact final CTA stays simple and explicit. */
export const REPENTANCE_FINAL_CTA = '회개 기록 마치기'

/** No progress %, no completion rate, no score on the repentance flow. */
export const REPENTANCE_SHOWS_PROGRESS_PERCENT = false

/* -------------------------------------------------------------------------
 * Promise / Action (docs/04, AC-05)
 * ---------------------------------------------------------------------- */

export const PROMISE_DEFAULT_GROUPS = ['나의 삶', '사람과 관계', '신앙생활'] as const

/** User-facing finish label. docs/04: "Promise user-facing finish: `마무리됨`". */
export const PROMISE_CLOSE_LABEL = '마무리됨'
export const PROMISE_ACTIVE_LABEL = '진행 중'

/**
 * Keep-rate is a behavioural measurement of what the user themselves chose to
 * record. It is never a faith measurement, and a missed day is never a sin.
 */
export const PROMISE_KEEP_RATE_IS_BEHAVIOURAL_ONLY = true
export const ACTION_FAILURE_IS_SIN = false

export const ACTION_OUTCOME_LABELS = {
  done: '실행함',
  retry: '다시 시도',
  modified: '약속 수정',
  rescheduled: '일정 변경',
  record_only: '기록만',
} as const

/* -------------------------------------------------------------------------
 * Journey (docs/04, AC-02)
 * ---------------------------------------------------------------------- */

/** 5-step self record. Index 0 is unused so the level matches the DB value. */
export const MOOD_LABELS = ['', '매우 힘듦', '힘듦', '보통', '좋음', '매우 좋음'] as const

/** No input day is Missing. It is never interpolated and never drawn as a point. */
export const MOOD_MISSING_DAY_IS_INTERPOLATED = false

/**
 * Only the life-event layer is drawn as a connected line. Mood points are
 * plotted individually so that a gap reads as "not recorded", not as a decline.
 */
export const ONLY_LIFE_EVENTS_ARE_LINE_CONNECTED = true

/** docs/03 TODAY 4-slot. 회개 is deliberately absent — it is not a daily duty tile. */
export const TODAY_SLOTS = ['나의 말씀', '이어갈 기도', '오늘의 약속·실행', '성경읽기'] as const
export const REPENTANCE_IS_DAILY_DUTY_TILE = false

/* -------------------------------------------------------------------------
 * Confession (docs/04, docs/08, AC-06)
 * ---------------------------------------------------------------------- */

export const CONFESSION_TYPE_LABELS = {
  prayer: '기도',
  confession: '고백',
  grace: '은혜',
  daily: '일상',
} as const

/** Canonical 3종 (docs/04, AC-06). */
export const REACTION_LABELS = {
  pray_together: '함께 기도해요',
  received_grace: '은혜받았어요',
  touched: '마음이 닿았어요',
} as const

/**
 * All three canonical reactions are live.
 *
 * The 2026-09-06 execution order briefly read as "공감 1종"; the Owner's PM
 * response of the same date settled it as the canonical three (docs/04, AC-06).
 * Order here is the canonical order and is what the UI renders.
 */
export const ENABLED_REACTIONS = ['pray_together', 'received_grace', 'touched'] as const

/** 1 user : 1 reaction per post, changeable. Enforced by the PK in SQL too. */
export const ONE_REACTION_PER_USER_PER_POST = true

/** docs/04: 게시물 Photo 최대 1장. */
export const CONFESSION_PHOTO_MAX = 1

/**
 * Comment is in the Confession MVP (docs/04, AC-06), confirmed as the Owner's
 * final decision on 2026-09-06.
 *
 * Scope is exactly what docs/08 Comment Safety names — write, read, author
 * delete, report, block, moderator hide/delete. No threading, no reactions on
 * comments, no mentions: none of those appear in a canonical source.
 */
export const CONFESSION_COMMENTS_ENABLED = true

/** docs/08: a member removes their own comment. Soft delete keeps the thread readable. */
export const COMMENT_DELETE_IS_SOFT = true

/** docs/04, docs/08: no AI touches Confession at all. */
export const CONFESSION_USES_AI = false

/* -------------------------------------------------------------------------
 * Safety (docs/08)
 * ---------------------------------------------------------------------- */

/** No spiritual judgment is representable as a report reason. */
export const REPORT_REASON_LABELS = {
  personal_info: '개인정보 노출',
  harassment: '괴롭힘·혐오',
  spam: '스팸·광고',
  safety: '자해·위험·기타 안전 문제',
} as const

/** A single photo, church name, or report can never auto-restrict a member. */
export const AUTOMATED_ELIGIBILITY_JUDGMENT = false

/* -------------------------------------------------------------------------
 * Privacy / AI (docs/06, docs/07, AC-10)
 * ---------------------------------------------------------------------- */

export const AI_MEMORY_DEFAULT_ON = false
export const PRIVATE_DOMAINS = ['prayer', 'repentance', 'promise', 'action', 'journey'] as const

/**
 * ShareCopy: the published copy is a separate object from the private original.
 * Editing the source never rewrites a published copy, and deleting the source
 * never deletes one.
 */
export const SHARECOPY_CASCADES_FROM_SOURCE = false

/** Profile Gallery cap (docs/04, AC-07). Also enforced by a DB trigger. */
export const PROFILE_GALLERY_MAX = 30

/** Voice memo cap agreed with the Owner: under one minute. */
export const VOICE_MEMO_MAX_MS = 60_000
