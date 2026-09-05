/**
 * Repentance domain.
 *
 * Source: docs/final/05-ia-menu-architecture.md §6, docs/final/08 SCR-RPT-RPN-001/002,
 * docs/final/09 §1.
 *
 * Locked rules encoded here:
 * - Optional Progressive Flow: every part is optional and the user may finish at
 *   any time. There is no fixed step count, no step number, no progress percentage.
 * - No repentance/faith score and no judgment of sincerity or sufficiency.
 * - The final CTA is exactly "회개 기록 마치기". "회개 완료" is forbidden wording.
 */

import type { Id } from '../shared/identity';
import type { RecordLifecycle } from '../shared/lifecycle';
import { REPENTANCE_FINAL_CTA } from '../shared/product-lock';

/**
 * The optional parts of a repentance record. Their order in this type is a
 * presentation convenience only — it is not a required sequence, and skipping any
 * of them is normal.
 */
export interface RepentanceParts {
  /** 돌아보기 */
  readonly reflection?: string;
  /** 고백하기 */
  readonly confession?: string;
  /** Optional 말씀 reference */
  readonly scriptureReferenceId?: Id;
  /** Optional 돌이킴 */
  readonly turning?: string;
  readonly promiseId?: Id;
  readonly actionId?: Id;
}

export interface RepentanceRecord {
  readonly id: Id;
  readonly ownerId: Id;
  readonly day: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Internal implementation state — see shared/lifecycle.ts (CANDIDATE naming). */
  readonly lifecycle: RecordLifecycle;
  readonly parts: RepentanceParts;
  /** Set when the user chose "회개 기록 마치기". Records an act, not an evaluation. */
  readonly finishedAt?: Date;
}

/** The only user-facing label for finishing the flow. */
export function repentanceFinalCta(): typeof REPENTANCE_FINAL_CTA {
  return REPENTANCE_FINAL_CTA;
}

/**
 * A repentance record can be finished as long as the user wrote something. There
 * is no completeness threshold, and no part is mandatory on its own.
 */
export function hasAnyContent(parts: RepentanceParts): boolean {
  return Boolean(
    parts.reflection?.trim() ||
      parts.confession?.trim() ||
      parts.turning?.trim() ||
      parts.scriptureReferenceId ||
      parts.promiseId ||
      parts.actionId,
  );
}

export function finishRepentance(
  record: RepentanceRecord,
  at: Date,
): RepentanceRecord {
  return { ...record, lifecycle: 'recorded', finishedAt: at, updatedAt: at };
}
