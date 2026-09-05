/**
 * Product Lock — machine-checkable guard rails.
 *
 * Source of truth: docs/REPENT-MASTER-HANDOFF.md §4 Product Lock, §5 AI/Theology Lock,
 * docs/final/06-policy-business-rules.md, docs/final/09-data-state-permission.md §5.
 *
 * This module creates NO new product meaning. It only encodes, as code, the
 * prohibitions already locked in the Final Documentation so that violations fail
 * a test instead of shipping.
 */

/**
 * States that must never exist as an entity state, enum member, derived field or
 * constant. Source: docs/final/09-data-state-permission.md §5 "Forbidden State".
 */
export const FORBIDDEN_STATES = [
  'ANSWERED',
  'FORGIVEN',
  'SAVED',
  'REPENTED',
  'FAITHFUL',
  'SPIRITUALLY_FAILED',
] as const;

export type ForbiddenState = (typeof FORBIDDEN_STATES)[number];

/**
 * Scores/metrics that must never be produced as a state value, derived field or
 * indicator. Source: docs/final/09-data-state-permission.md §5, MASTER-HANDOFF §5.
 */
export const FORBIDDEN_METRICS = [
  'faithScore',
  'repentanceScore',
  'prayerResponseRate',
  'spiritualMaturityScore',
] as const;

/**
 * Prayer response tracking is REMOVED from the product entirely — there is no
 * answered/pending state and no response-rate concept.
 * Source: MASTER-HANDOFF §4, docs/final/05-ia-menu-architecture.md §3.
 */
export const PRAYER_RESPONSE_TRACKING_REMOVED = true;

/**
 * Action failure is not sin, and a failure-cause taxonomy is forbidden: the user
 * is never asked "why did you fail". Only the 5 follow-up choices exist.
 * Source: MASTER-HANDOFF §4, docs/final/05-ia-menu-architecture.md §5.
 */
export const ACTION_FAILURE_CAUSE_TAXONOMY_FORBIDDEN = true;

/**
 * Repentance has no fixed step count, no progress percentage and no score, and
 * the wording "회개 완료" is forbidden. The only final CTA is "회개 기록 마치기".
 * Source: MASTER-HANDOFF §4, docs/final/05-ia-menu-architecture.md §6.
 */
export const REPENTANCE_FINAL_CTA = '회개 기록 마치기' as const;
export const REPENTANCE_FORBIDDEN_WORDING = ['회개 완료'] as const;

/**
 * Promise user-facing close wording. Source: MASTER-HANDOFF §4.
 */
export const PROMISE_CLOSE_LABEL = '마무리됨' as const;

/**
 * Confession must never be anonymous — the 3 privacy options are the whole set.
 * Source: docs/final/05-ia-menu-architecture.md §7, 09 §3.
 */
export const CONFESSION_ANONYMOUS_FORBIDDEN = true;

/**
 * Social surface prohibitions: no popularity ordering, ranking, spiritual
 * comparison or reaction-derived faith signal.
 * Source: docs/final/05-ia-menu-architecture.md §7.
 */
export const SOCIAL_RANKING_FORBIDDEN = true;
