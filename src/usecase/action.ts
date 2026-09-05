/**
 * Action use cases.
 *
 * Source: docs/final/08 SCR-RPT-ACT-001/002.
 *
 * The follow-up step records the user's chosen next move. It never asks why the
 * action did not happen, never classifies a cause, and never creates a repentance
 * record on the user's behalf.
 */

import type { Result } from '../domain/shared/result';
import { err, ok } from '../domain/shared/result';
import type { DomainError } from '../domain/shared/errors';
import { notFound, permissionDenied, validationFailed } from '../domain/shared/errors';
import type { Id } from '../domain/shared/identity';
import { canMutateOwnRecord } from '../domain/shared/actor';
import type { ActionRecord, FollowUpChoice, NewActionInput } from '../domain/action/action';
import {
  isValidActionContent,
  lifecycleForFollowUp,
  markDone,
  offersRepentanceEntry,
} from '../domain/action/action';
import type { UseCaseContext } from './context';
import { today } from './context';

export async function createAction(
  ctx: UseCaseContext,
  input: NewActionInput,
): Promise<Result<ActionRecord, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Only the owner can create an action'));
  }

  if (!isValidActionContent(input.content)) {
    return err(validationFailed('실행 내용을 입력해 주세요.'));
  }

  const now = ctx.clock.now();
  const action: ActionRecord = {
    id: ctx.ids.next(),
    ownerId: ctx.actor.userId,
    content: input.content.trim(),
    day: today(ctx.clock),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'planned',
    ...(input.promiseId ? { promiseId: input.promiseId } : {}),
    ...(input.scheduledFor ? { scheduledFor: input.scheduledFor } : {}),
  };

  await ctx.repos.actions.save(action);
  return ok(action);
}

export async function completeAction(
  ctx: UseCaseContext,
  actionId: Id,
): Promise<Result<ActionRecord, DomainError>> {
  const action = await ctx.repos.actions.findById(actionId);
  if (!action) return err(notFound(`Action ${actionId} not found`));

  if (!canMutateOwnRecord(ctx.actor, action)) {
    return err(permissionDenied('Only the owner can complete an action'));
  }

  const done = markDone(action, ctx.clock.now());
  await ctx.repos.actions.save(done);
  return ok(done);
}

export interface FollowUpOutcome {
  readonly action: ActionRecord;
  /**
   * True only when the user picked "Optional Repent". The caller must then take an
   * explicit further step to open the repentance flow — nothing is auto-created.
   */
  readonly offersRepentanceEntry: boolean;
}

/**
 * Records the user's follow-up choice.
 *
 * Note there is no `reason` parameter, by design: a failure cause taxonomy is
 * forbidden (docs/final/05 §5).
 */
export async function chooseFollowUp(
  ctx: UseCaseContext,
  actionId: Id,
  choice: FollowUpChoice,
  options?: { readonly scheduledFor?: string },
): Promise<Result<FollowUpOutcome, DomainError>> {
  const action = await ctx.repos.actions.findById(actionId);
  if (!action) return err(notFound(`Action ${actionId} not found`));

  if (!canMutateOwnRecord(ctx.actor, action)) {
    return err(permissionDenied('Only the owner can choose a follow-up'));
  }

  if (choice === 'reschedule' && !options?.scheduledFor) {
    return err(validationFailed('새 일정을 선택해 주세요.'));
  }

  const updated: ActionRecord = {
    ...action,
    lifecycle: lifecycleForFollowUp(choice),
    followUp: choice,
    updatedAt: ctx.clock.now(),
    ...(options?.scheduledFor ? { scheduledFor: options.scheduledFor } : {}),
  };

  await ctx.repos.actions.save(updated);

  return ok({ action: updated, offersRepentanceEntry: offersRepentanceEntry(choice) });
}

export async function listActions(
  ctx: UseCaseContext,
): Promise<Result<readonly ActionRecord[], DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Action is a private source'));
  }

  const actions = await ctx.repos.actions.listByOwner(ctx.actor.userId);
  return ok(actions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}
