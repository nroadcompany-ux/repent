/**
 * TurningPoint — a coordinate on the Journey that the user marks as a turning point.
 *
 * Source: docs/final/05-ia-menu-architecture.md §2, 09 §2 Relation Rules,
 * docs/final/08 SCR-RPT-JNY-002.
 *
 * Locked rule: AI may only propose a candidate. Only the user can confirm, and an
 * unconfirmed candidate is never a final TurningPoint.
 */

import type { Id } from '../shared/identity';
import type { Actor } from '../shared/actor';
import { isRecordOwner } from '../shared/actor';

export type TurningPointOrigin = 'user' | 'ai_candidate';

export interface TurningPoint {
  readonly id: Id;
  readonly ownerId: Id;
  readonly day: string;
  readonly label: string;
  readonly origin: TurningPointOrigin;
  /** Final state requires an explicit user confirmation. */
  readonly confirmedByUser: boolean;
  readonly confirmedAt?: Date;
  readonly relatedRecordId?: Id;
}

/** A TurningPoint counts as final only after the user confirms it. */
export function isFinalTurningPoint(point: TurningPoint): boolean {
  return point.confirmedByUser;
}

/** Only the owner may confirm; AI/System confirmation is not representable. */
export function canConfirmTurningPoint(actor: Actor, point: TurningPoint): boolean {
  return isRecordOwner(actor, point);
}

export function confirmTurningPoint(point: TurningPoint, at: Date): TurningPoint {
  return { ...point, confirmedByUser: true, confirmedAt: at };
}
