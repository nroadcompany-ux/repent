/**
 * Sharing (ShareCopy) use cases.
 *
 * Source: docs/final/08 SCR-RPT-SHR-001/002/003, docs/final/09 §2.
 *
 * The three locked sharing rules are enforced here:
 * 1. Only user-selected fields are copied.
 * 2. The snapshot is independent — later source edits never change a ShareCopy.
 * 3. Deleting the source never cascades — the user chooses keep or delete.
 */

import type { Result } from '../domain/shared/result';
import { err, ok } from '../domain/shared/result';
import type { DomainError } from '../domain/shared/errors';
import { notFound, permissionDenied, validationFailed } from '../domain/shared/errors';
import type { Id } from '../domain/shared/identity';
import { canMutateOwnRecord } from '../domain/shared/actor';
import type { RecordType } from '../domain/journey/journey';
import type {
  ShareCopy,
  ShareSelection,
  SnapshotField,
  SourceDeleteChoice,
} from '../domain/sharing/share-copy';
import { buildSnapshotPreview, hasSelectedFields } from '../domain/sharing/share-copy';
import type { UseCaseContext } from './context';

/** Source kinds a ShareCopy can be made from in this sprint. */
export type ShareableSourceType = Extract<RecordType, 'prayer' | 'repentance'>;

async function loadShareableFields(
  ctx: UseCaseContext,
  sourceId: Id,
  sourceType: ShareableSourceType,
): Promise<Result<{ ownerId: Id; fields: SnapshotField[] }, DomainError>> {
  if (sourceType === 'prayer') {
    const prayer = await ctx.repos.prayers.findById(sourceId);
    if (!prayer) return err(notFound(`Prayer ${sourceId} not found`));
    if (!canMutateOwnRecord(ctx.actor, prayer)) {
      return err(permissionDenied('Only the owner can share their own record'));
    }

    const fields: SnapshotField[] = [{ key: 'content', label: '기도 내용', value: prayer.content }];
    if (prayer.extensions.reflection) {
      fields.push({ key: 'reflection', label: '돌아보기', value: prayer.extensions.reflection });
    }
    if (prayer.extensions.surrender) {
      fields.push({ key: 'surrender', label: '내어드림', value: prayer.extensions.surrender });
    }
    return ok({ ownerId: prayer.ownerId, fields });
  }

  const record = await ctx.repos.repentances.findById(sourceId);
  if (!record) return err(notFound(`RepentanceRecord ${sourceId} not found`));
  if (!canMutateOwnRecord(ctx.actor, record)) {
    return err(permissionDenied('Only the owner can share their own record'));
  }

  const fields: SnapshotField[] = [];
  if (record.parts.reflection) {
    fields.push({ key: 'reflection', label: '돌아보기', value: record.parts.reflection });
  }
  if (record.parts.confession) {
    fields.push({ key: 'confession', label: '고백하기', value: record.parts.confession });
  }
  if (record.parts.turning) {
    fields.push({ key: 'turning', label: '돌이킴', value: record.parts.turning });
  }
  return ok({ ownerId: record.ownerId, fields });
}

/** SCR-RPT-SHR-001 — lists the fields the owner may choose to share. */
export async function listShareableFields(
  ctx: UseCaseContext,
  sourceId: Id,
  sourceType: ShareableSourceType,
): Promise<Result<readonly SnapshotField[], DomainError>> {
  const loaded = await loadShareableFields(ctx, sourceId, sourceType);
  if (!loaded.ok) return loaded;
  return ok(loaded.value.fields);
}

/** SCR-RPT-SHR-002 — the preview the owner approves before publishing. */
export function previewShareCopy(
  selection: ShareSelection,
): Result<readonly SnapshotField[], DomainError> {
  if (!hasSelectedFields(selection)) {
    return err(validationFailed('공유할 항목을 선택해 주세요.'));
  }
  return ok(buildSnapshotPreview(selection));
}

/**
 * Publishes the snapshot. Values are copied by value at this moment; the ShareCopy
 * is never re-read from the source afterwards.
 */
export async function publishShareCopy(
  ctx: UseCaseContext,
  selection: ShareSelection,
): Promise<Result<ShareCopy, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Only the owner can publish a share copy'));
  }

  if (!hasSelectedFields(selection)) {
    return err(validationFailed('공유할 항목을 선택해 주세요.'));
  }

  const now = ctx.clock.now();
  const copy: ShareCopy = {
    id: ctx.ids.next(),
    ownerId: ctx.actor.userId,
    sourceId: selection.sourceId,
    sourceType: selection.sourceType,
    fields: buildSnapshotPreview(selection),
    privacy: selection.privacy,
    createdAt: now,
    lifecycle: 'published',
    publishedAt: now,
  };

  await ctx.repos.shareCopies.save(copy);
  return ok(copy);
}

export interface SourceDeletePlan {
  readonly sourceId: Id;
  readonly sourceType: ShareableSourceType;
  /** ShareCopies that exist for this source; empty means the source deletes alone. */
  readonly affectedShareCopies: readonly ShareCopy[];
  /** The user must make this choice — there is no default cascade. */
  readonly choiceRequired: boolean;
}

/** SCR-RPT-SHR-003 — what the user is asked before deleting a source. */
export async function planSourceDeletion(
  ctx: UseCaseContext,
  sourceId: Id,
  sourceType: ShareableSourceType,
): Promise<Result<SourceDeletePlan, DomainError>> {
  const loaded = await loadShareableFields(ctx, sourceId, sourceType);
  if (!loaded.ok) return loaded;

  const affectedShareCopies = await ctx.repos.shareCopies.listBySource(sourceId);

  return ok({
    sourceId,
    sourceType,
    affectedShareCopies,
    choiceRequired: affectedShareCopies.length > 0,
  });
}

export interface SourceDeleteOutcome {
  readonly sourceDeleted: true;
  readonly shareCopiesKept: number;
  readonly shareCopiesDeleted: number;
}

/**
 * Deletes the source and applies the user's explicit choice to its ShareCopies.
 * Nothing cascades implicitly — with `keep_share_copies` the snapshots survive.
 */
export async function deleteSourceWithChoice(
  ctx: UseCaseContext,
  sourceId: Id,
  sourceType: ShareableSourceType,
  choice: SourceDeleteChoice,
): Promise<Result<SourceDeleteOutcome, DomainError>> {
  const loaded = await loadShareableFields(ctx, sourceId, sourceType);
  if (!loaded.ok) return loaded;

  const shareCopies = await ctx.repos.shareCopies.listBySource(sourceId);

  if (sourceType === 'prayer') {
    await ctx.repos.prayers.delete(sourceId);
  } else {
    await ctx.repos.repentances.delete(sourceId);
  }

  if (choice === 'delete_share_copies') {
    await Promise.all(shareCopies.map((copy) => ctx.repos.shareCopies.delete(copy.id)));
    return ok({
      sourceDeleted: true,
      shareCopiesKept: 0,
      shareCopiesDeleted: shareCopies.length,
    });
  }

  return ok({
    sourceDeleted: true,
    shareCopiesKept: shareCopies.length,
    shareCopiesDeleted: 0,
  });
}
