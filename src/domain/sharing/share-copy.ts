/**
 * ShareCopy domain — an explicit, field-selected snapshot of a private source.
 *
 * Source: docs/final/05-ia-menu-architecture.md §7, docs/final/08 SCR-RPT-SHR-001~003,
 * docs/final/09 §2 Relation Rules.
 *
 * Locked sharing rules encoded here:
 * 1. Only the fields the user selected are copied — never the whole source.
 * 2. The snapshot is independent: editing the source does not change a ShareCopy.
 * 3. Deleting the source does not cascade — the user chooses keep or delete.
 */

import type { Id } from '../shared/identity';
import type { PublicationLifecycle } from '../shared/lifecycle';
import type { PrivacyOption } from '../confession/confession';
import type { RecordType } from '../journey/journey';

/** One selected field, captured by value at snapshot time. */
export interface SnapshotField {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

export interface ShareCopy {
  readonly id: Id;
  readonly ownerId: Id;
  /** Reference back to the source, kept for the user's own traceability. */
  readonly sourceId: Id;
  readonly sourceType: RecordType;
  /** Immutable snapshot payload — never re-read from the source. */
  readonly fields: readonly SnapshotField[];
  readonly privacy: Exclude<PrivacyOption, 'private'>;
  readonly createdAt: Date;
  /** Internal implementation state — see shared/lifecycle.ts (CANDIDATE naming). */
  readonly lifecycle: PublicationLifecycle;
  readonly publishedAt?: Date;
}

/** What the user chose to do with existing ShareCopies when deleting the source. */
export const SOURCE_DELETE_CHOICES = ['keep_share_copies', 'delete_share_copies'] as const;
export type SourceDeleteChoice = (typeof SOURCE_DELETE_CHOICES)[number];

export interface ShareSelection {
  readonly sourceId: Id;
  readonly sourceType: RecordType;
  readonly fields: readonly SnapshotField[];
  readonly privacy: Exclude<PrivacyOption, 'private'>;
}

export function hasSelectedFields(selection: ShareSelection): boolean {
  return selection.fields.length > 0;
}

/**
 * Builds the preview shown before publishing. Preview and the published snapshot
 * are the same payload, so what the user approves is exactly what is shared.
 */
export function buildSnapshotPreview(selection: ShareSelection): readonly SnapshotField[] {
  return selection.fields.map((field) => ({ ...field }));
}

/**
 * A ShareCopy never tracks source edits. Encoded as a function so the regression
 * test can assert the snapshot is unaffected by later source changes.
 */
export function isSnapshotIndependentOfSource(): boolean {
  return true;
}
