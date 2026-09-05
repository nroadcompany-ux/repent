/**
 * Prayer use cases.
 *
 * Source: docs/final/08 SCR-RPT-PRY-001.
 *
 * Recording a prayer and leaving (Prayer Only Exit) is a complete outcome. No
 * response state is ever written, because none exists.
 */

import type { Result } from '../domain/shared/result';
import { err, ok } from '../domain/shared/result';
import type { DomainError } from '../domain/shared/errors';
import { permissionDenied, validationFailed } from '../domain/shared/errors';
import type { Prayer, NewPrayerInput } from '../domain/prayer/prayer';
import { isValidPrayerContent } from '../domain/prayer/prayer';
import type { UseCaseContext } from './context';
import { today } from './context';

export async function recordPrayer(
  ctx: UseCaseContext,
  input: NewPrayerInput,
): Promise<Result<Prayer, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Only the owner can record a prayer'));
  }

  if (!isValidPrayerContent(input.content)) {
    return err(validationFailed('기도 내용을 입력해 주세요.'));
  }

  const now = ctx.clock.now();
  const prayer: Prayer = {
    id: ctx.ids.next(),
    ownerId: ctx.actor.userId,
    content: input.content.trim(),
    day: today(ctx.clock),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'recorded',
    extensions: input.extensions ?? {},
  };

  await ctx.repos.prayers.save(prayer);
  return ok(prayer);
}

export async function listPrayers(
  ctx: UseCaseContext,
): Promise<Result<readonly Prayer[], DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Prayer is a private source'));
  }

  const prayers = await ctx.repos.prayers.listByOwner(ctx.actor.userId);
  return ok(prayers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}
