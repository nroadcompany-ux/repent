/**
 * Action domain.
 *
 * Source: docs/final/05-ia-menu-architecture.md §5, docs/final/08 SCR-RPT-ACT-001/002,
 * docs/final/09 §1.
 *
 * Locked rules encoded here:
 * - Follow-up is exactly 5 user choices. There is no sixth "why did it fail" step.
 * - Failure Cause Taxonomy is forbidden: this module deliberately has no failure
 *   reason type, field or enum.
 * - Action failure is not sin, and repentance is never triggered automatically —
 *   "Optional Repent" only expresses the user's own choice to open that flow.
 */

import type { Id } from '../shared/identity';
import type { ActionLifecycle } from '../shared/lifecycle';

/** The complete, closed set of follow-up choices. */
export const FOLLOW_UP_CHOICES = [
  'retry',
  'modify',
  'reschedule',
  'record_only',
  'optional_repent',
] as const;
export type FollowUpChoice = (typeof FOLLOW_UP_CHOICES)[number];

export interface ActionRecord {
  readonly id: Id;
  readonly ownerId: Id;
  readonly content: string;
  readonly day: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Internal implementation state — see shared/lifecycle.ts (CANDIDATE naming). */
  readonly lifecycle: ActionLifecycle;
  /** An action may belong to a promise context; standalone actions are allowed. */
  readonly promiseId?: Id;
  /** The user's own follow-up choice, if they made one. */
  readonly followUp?: FollowUpChoice;
  readonly scheduledFor?: string;
}

export interface NewActionInput {
  readonly content: string;
  readonly promiseId?: Id;
  readonly scheduledFor?: string;
}

export function isValidActionContent(content: string): boolean {
  return content.trim().length > 0;
}

export function markDone(action: ActionRecord, at: Date): ActionRecord {
  return { ...action, lifecycle: 'done', updatedAt: at };
}

/** Maps a follow-up choice onto the internal lifecycle state. */
export function lifecycleForFollowUp(choice: FollowUpChoice): ActionLifecycle {
  switch (choice) {
    case 'retry':
      return 'retry';
    case 'modify':
      return 'modified';
    case 'reschedule':
      return 'rescheduled';
    case 'record_only':
      return 'recorded_only';
    case 'optional_repent':
      // The action itself is only recorded. Whether a repentance record is created
      // is a separate, explicit user action — never automatic.
      return 'recorded_only';
  }
}

/**
 * True when the choice merely *offers* the repentance flow. The caller must still
 * require an explicit user step; nothing here creates a RepentanceRecord.
 */
export function offersRepentanceEntry(choice: FollowUpChoice): boolean {
  return choice === 'optional_repent';
}
