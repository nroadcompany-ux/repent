/**
 * Internal implementation lifecycle states.
 *
 * IMPORTANT — Exact Lifecycle Enum Naming is CANDIDATE / OPEN in the Final
 * Documentation (docs/final/09-data-state-permission.md §5, §6). These lowercase
 * values are INTERNAL implementation state only. They are deliberately not the
 * canonical product enum and must not be promoted to Product Meaning, surfaced as
 * user-facing copy, or persisted as a public contract until the Owner decides.
 *
 * User-facing wording comes from the UI layer using the locked labels
 * (e.g. Promise close = "마무리됨", Repentance final CTA = "회개 기록 마치기").
 */

/** Prayer / RepentanceRecord: 작성 중 / 기록됨 / 보관됨. */
export type RecordLifecycle = 'draft' | 'recorded' | 'archived';

/** Promise: 진행 중 / 사용자 마무리 / 보관. */
export type PromiseLifecycle = 'active' | 'closed' | 'archived';

/** Action: 계획 / 실행됨 / 후속 선택 결과. */
export type ActionLifecycle =
  | 'planned'
  | 'done'
  | 'retry'
  | 'modified'
  | 'rescheduled'
  | 'recorded_only';

/** Confession / ShareCopy: 작성 / 게시 / 숨김 / 제거. */
export type PublicationLifecycle = 'draft' | 'published' | 'hidden' | 'removed';
