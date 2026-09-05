/**
 * Prayer domain.
 *
 * Source: docs/final/05-ia-menu-architecture.md §3, docs/final/08 SCR-RPT-PRY-001,
 * docs/final/09 §1.
 *
 * Locked rules encoded here:
 * - Prayer Only Exit: a prayer can be recorded and left at that. Every extension
 *   (reflection, scripture, surrender, promise, action) is optional.
 * - Prayer Response Tracking is REMOVED: there is no answered/pending state, no
 *   response rate, no prayer success/failure anywhere in this type.
 */

import type { Id } from '../shared/identity';
import type { RecordLifecycle } from '../shared/lifecycle';

/** Optional extensions a prayer may reference. All are opt-in. */
export interface PrayerExtensions {
  readonly reflection?: string;
  readonly scriptureReferenceId?: Id;
  readonly surrender?: string;
  readonly promiseId?: Id;
  readonly actionId?: Id;
}

export interface Prayer {
  readonly id: Id;
  readonly ownerId: Id;
  readonly content: string;
  readonly day: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Internal implementation state — see shared/lifecycle.ts (CANDIDATE naming). */
  readonly lifecycle: RecordLifecycle;
  readonly extensions: PrayerExtensions;
}

export interface NewPrayerInput {
  readonly content: string;
  readonly extensions?: PrayerExtensions;
}

/** Content is the only required field; extensions may be entirely absent. */
export function isValidPrayerContent(content: string): boolean {
  return content.trim().length > 0;
}

/**
 * Prayer Only Exit — true when the user recorded a prayer and added nothing else.
 * This is a legitimate, complete outcome, not an incomplete record.
 */
export function isPrayerOnly(prayer: Prayer): boolean {
  const ext = prayer.extensions;
  return (
    ext.reflection === undefined &&
    ext.scriptureReferenceId === undefined &&
    ext.surrender === undefined &&
    ext.promiseId === undefined &&
    ext.actionId === undefined
  );
}
