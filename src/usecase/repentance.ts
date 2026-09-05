/**
 * Repentance use cases.
 *
 * Source: docs/final/08 SCR-RPT-RPN-001/002.
 *
 * The flow is optional and progressive: the user may fill in any part, in any
 * order, and finish whenever they choose. Nothing here counts steps, computes
 * progress, or judges whether the repentance was sufficient or sincere.
 */

import type { Result } from '../domain/shared/result';
import { err, ok } from '../domain/shared/result';
import type { DomainError } from '../domain/shared/errors';
import { notFound, permissionDenied, validationFailed } from '../domain/shared/errors';
import type { Id } from '../domain/shared/identity';
import { canMutateOwnRecord } from '../domain/shared/actor';
import type { RepentanceParts, RepentanceRecord } from '../domain/repentance/repentance';
import { finishRepentance, hasAnyContent } from '../domain/repentance/repentance';
import type { UseCaseContext } from './context';
import { today } from './context';

/** Opens a draft. Entry may come from the Repentance tab or an Optional Repent choice. */
export async function startRepentance(
  ctx: UseCaseContext,
): Promise<Result<RepentanceRecord, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Only the owner can start a repentance record'));
  }

  const now = ctx.clock.now();
  const record: RepentanceRecord = {
    id: ctx.ids.next(),
    ownerId: ctx.actor.userId,
    day: today(ctx.clock),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'draft',
    parts: {},
  };

  await ctx.repos.repentances.save(record);
  return ok(record);
}

/** Merges in whichever parts the user filled. Any subset is valid. */
export async function updateRepentanceParts(
  ctx: UseCaseContext,
  recordId: Id,
  parts: RepentanceParts,
): Promise<Result<RepentanceRecord, DomainError>> {
  const record = await ctx.repos.repentances.findById(recordId);
  if (!record) return err(notFound(`RepentanceRecord ${recordId} not found`));

  if (!canMutateOwnRecord(ctx.actor, record)) {
    return err(permissionDenied('Repentance is a private source'));
  }

  const updated: RepentanceRecord = {
    ...record,
    parts: { ...record.parts, ...parts },
    updatedAt: ctx.clock.now(),
  };

  await ctx.repos.repentances.save(updated);
  return ok(updated);
}

/**
 * Finishes the record — the "회개 기록 마치기" action.
 *
 * This marks that the user finished writing. It is not a completion verdict, and
 * the wording "회개 완료" is never used.
 */
export async function finishRepentanceRecord(
  ctx: UseCaseContext,
  recordId: Id,
): Promise<Result<RepentanceRecord, DomainError>> {
  const record = await ctx.repos.repentances.findById(recordId);
  if (!record) return err(notFound(`RepentanceRecord ${recordId} not found`));

  if (!canMutateOwnRecord(ctx.actor, record)) {
    return err(permissionDenied('Only the owner can finish their repentance record'));
  }

  if (!hasAnyContent(record.parts)) {
    return err(validationFailed('기록된 내용이 없습니다.'));
  }

  const finished = finishRepentance(record, ctx.clock.now());
  await ctx.repos.repentances.save(finished);
  return ok(finished);
}

export async function listRepentanceRecords(
  ctx: UseCaseContext,
): Promise<Result<readonly RepentanceRecord[], DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Repentance is a private source'));
  }

  const records = await ctx.repos.repentances.listByOwner(ctx.actor.userId);
  return ok(records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}
