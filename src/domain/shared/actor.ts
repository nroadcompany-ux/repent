/**
 * Actor / Permission boundary.
 *
 * Source: docs/final/09-data-state-permission.md §4 Actor / Permission Boundary.
 *
 * - Owner  : CRUD on own records, share/preview, opt-in settings.
 * - Viewer : read of Confession/ShareCopy permitted by its privacy, reaction, report.
 * - Moderator: shared Confession/ShareCopy only. Private Prayer/RepentanceRecord
 *              source access is forbidden, as is any spiritual judgment.
 * - System : automation/presentation/routing. Never a record owner.
 * - AI     : reflection assist, TurningPoint candidate, Scripture candidate.
 *            Never a record owner, never reads a private source without consent.
 */

import type { Id } from './identity';

export type ActorRole = 'owner' | 'viewer' | 'moderator' | 'system' | 'ai';

export interface Actor {
  readonly userId: Id;
  readonly role: ActorRole;
}

export function owner(userId: Id): Actor {
  return { userId, role: 'owner' };
}

export function viewer(userId: Id): Actor {
  return { userId, role: 'viewer' };
}

export function moderator(userId: Id): Actor {
  return { userId, role: 'moderator' };
}

export function systemActor(userId: Id): Actor {
  return { userId, role: 'system' };
}

export function aiActor(userId: Id): Actor {
  return { userId, role: 'ai' };
}

/** A record that belongs to exactly one human owner. AI/System can never be one. */
export interface OwnedRecord {
  readonly ownerId: Id;
}

/** True only when the actor is the human owner of the record. */
export function isRecordOwner(actor: Actor, record: OwnedRecord): boolean {
  return actor.role === 'owner' && actor.userId === record.ownerId;
}

/**
 * Private sources (Prayer, RepentanceRecord, Promise, Action, Journey records)
 * are readable by their owner only. Moderator/AI/Viewer are all denied here —
 * moderation happens on the shared surface, never on the private source.
 */
export function canReadPrivateSource(actor: Actor, record: OwnedRecord): boolean {
  return isRecordOwner(actor, record);
}

/** Only a human owner may create/modify/delete their own records. */
export function canMutateOwnRecord(actor: Actor, record: OwnedRecord): boolean {
  return isRecordOwner(actor, record);
}

/**
 * Moderation surface = shared Confession / ShareCopy only.
 * Source: 09 §4, §7 and docs/final/06-policy-business-rules.md.
 */
export function canModerateSharedSurface(actor: Actor): boolean {
  return actor.role === 'moderator';
}

/** AI and System can never own a record. Encoded so a regression test can assert it. */
export function canOwnRecord(role: ActorRole): boolean {
  return role === 'owner' || role === 'viewer' || role === 'moderator';
}
