/**
 * Promise domain.
 *
 * Source: docs/final/05-ia-menu-architecture.md §4, docs/final/08 SCR-RPT-PRM-001,
 * docs/final/09 §1–§2.
 *
 * Locked rules encoded here:
 * - Promise 1:N Action, and 0 actions is a valid state.
 * - The user-facing close is "마무리됨" — a user decision, not an evaluation.
 * - No streak, no miss=sin, no completion percentage.
 */

import type { Id } from '../shared/identity';
import type { PromiseLifecycle } from '../shared/lifecycle';
import { PROMISE_CLOSE_LABEL } from '../shared/product-lock';

export interface PromiseRecord {
  readonly id: Id;
  readonly ownerId: Id;
  readonly content: string;
  readonly day: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Internal implementation state — see shared/lifecycle.ts (CANDIDATE naming). */
  readonly lifecycle: PromiseLifecycle;
  /** Optional reference to the record this promise grew out of. */
  readonly sourceRecordId?: Id;
  readonly closedAt?: Date;
}

export interface NewPromiseInput {
  readonly content: string;
  readonly sourceRecordId?: Id;
}

export function isValidPromiseContent(content: string): boolean {
  return content.trim().length > 0;
}

/** The only user-facing wording for a closed promise. */
export function promiseCloseLabel(): typeof PROMISE_CLOSE_LABEL {
  return PROMISE_CLOSE_LABEL;
}

export function closePromise(promise: PromiseRecord, at: Date): PromiseRecord {
  return { ...promise, lifecycle: 'closed', closedAt: at, updatedAt: at };
}

export function isOpen(promise: PromiseRecord): boolean {
  return promise.lifecycle === 'active';
}
