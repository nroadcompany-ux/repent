/**
 * Promise use cases.
 *
 * Source: docs/final/08 SCR-RPT-PRM-001.
 *
 * A promise may have zero actions, and closing it ("마무리됨") is the user's own
 * decision — never an evaluation of whether they kept it.
 */

import type { Result } from '../domain/shared/result';
import { err, ok } from '../domain/shared/result';
import type { DomainError } from '../domain/shared/errors';
import { notFound, permissionDenied, validationFailed } from '../domain/shared/errors';
import type { Id } from '../domain/shared/identity';
import { canMutateOwnRecord } from '../domain/shared/actor';
import type { PromiseRecord, NewPromiseInput } from '../domain/promise/promise';
import { closePromise, isValidPromiseContent } from '../domain/promise/promise';
import type { ActionRecord } from '../domain/action/action';
import type { UseCaseContext } from './context';
import { today } from './context';

export async function createPromise(
  ctx: UseCaseContext,
  input: NewPromiseInput,
): Promise<Result<PromiseRecord, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Only the owner can create a promise'));
  }

  if (!isValidPromiseContent(input.content)) {
    return err(validationFailed('약속 내용을 입력해 주세요.'));
  }

  const now = ctx.clock.now();
  const promise: PromiseRecord = {
    id: ctx.ids.next(),
    ownerId: ctx.actor.userId,
    content: input.content.trim(),
    day: today(ctx.clock),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'active',
    ...(input.sourceRecordId ? { sourceRecordId: input.sourceRecordId } : {}),
  };

  await ctx.repos.promises.save(promise);
  return ok(promise);
}

export interface PromiseWithActions {
  readonly promise: PromiseRecord;
  /** 0 actions is a valid, complete state. */
  readonly actions: readonly ActionRecord[];
}

export async function getPromiseWithActions(
  ctx: UseCaseContext,
  promiseId: Id,
): Promise<Result<PromiseWithActions, DomainError>> {
  const promise = await ctx.repos.promises.findById(promiseId);
  if (!promise) return err(notFound(`Promise ${promiseId} not found`));

  if (!canMutateOwnRecord(ctx.actor, promise)) {
    return err(permissionDenied('Promise is a private source'));
  }

  const actions = await ctx.repos.actions.listByPromise(promiseId);
  return ok({ promise, actions });
}

/** Closes the promise. User-facing wording is "마무리됨". */
export async function finishPromise(
  ctx: UseCaseContext,
  promiseId: Id,
): Promise<Result<PromiseRecord, DomainError>> {
  const promise = await ctx.repos.promises.findById(promiseId);
  if (!promise) return err(notFound(`Promise ${promiseId} not found`));

  if (!canMutateOwnRecord(ctx.actor, promise)) {
    return err(permissionDenied('Only the owner can finish a promise'));
  }

  const closed = closePromise(promise, ctx.clock.now());
  await ctx.repos.promises.save(closed);
  return ok(closed);
}

export async function listPromises(
  ctx: UseCaseContext,
): Promise<Result<readonly PromiseRecord[], DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Promise is a private source'));
  }

  const promises = await ctx.repos.promises.listByOwner(ctx.actor.userId);
  return ok(promises.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}
