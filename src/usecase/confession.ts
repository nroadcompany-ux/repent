/**
 * Confession use cases.
 *
 * Source: docs/final/08 SCR-RPT-CNF-001/002, SCR-RPT-COM-001/002.
 *
 * Publishing always goes draft → preview → publish. The shared surface is ordered
 * chronologically; there is no popularity ordering, ranking or spiritual comparison.
 */

import type { Result } from '../domain/shared/result';
import { err, ok } from '../domain/shared/result';
import type { DomainError } from '../domain/shared/errors';
import { notFound, permissionDenied, validationFailed } from '../domain/shared/errors';
import type { Id } from '../domain/shared/identity';
import { canMutateOwnRecord } from '../domain/shared/actor';
import type {
  Confession,
  NewConfessionInput,
  PrivacyOption,
} from '../domain/confession/confession';
import { isValidConfessionContent } from '../domain/confession/confession';
import type { UseCaseContext } from './context';
import { today } from './context';

export async function draftConfession(
  ctx: UseCaseContext,
  input: NewConfessionInput,
): Promise<Result<Confession, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Only the owner can write a confession'));
  }

  if (!isValidConfessionContent(input.content)) {
    return err(validationFailed('내용을 입력해 주세요.'));
  }

  const now = ctx.clock.now();
  const confession: Confession = {
    id: ctx.ids.next(),
    ownerId: ctx.actor.userId,
    type: input.type,
    content: input.content.trim(),
    privacy: input.privacy,
    day: today(ctx.clock),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'draft',
  };

  await ctx.repos.confessions.save(confession);
  return ok(confession);
}

/** Changes the privacy selection while still a draft. */
export async function setConfessionPrivacy(
  ctx: UseCaseContext,
  confessionId: Id,
  privacy: PrivacyOption,
): Promise<Result<Confession, DomainError>> {
  const confession = await ctx.repos.confessions.findById(confessionId);
  if (!confession) return err(notFound(`Confession ${confessionId} not found`));

  if (!canMutateOwnRecord(ctx.actor, confession)) {
    return err(permissionDenied('Only the owner can change privacy'));
  }

  const updated: Confession = { ...confession, privacy, updatedAt: ctx.clock.now() };
  await ctx.repos.confessions.save(updated);
  return ok(updated);
}

export interface ConfessionPreview {
  readonly confession: Confession;
  /** What a viewer would see — used by the preview screen before publishing. */
  readonly displayName: string;
  readonly willReachSharedSurface: boolean;
}

/** Preview is mandatory before publish; the user approves exactly what is shared. */
export async function previewConfession(
  ctx: UseCaseContext,
  confessionId: Id,
  ownerDisplayName: string,
): Promise<Result<ConfessionPreview, DomainError>> {
  const confession = await ctx.repos.confessions.findById(confessionId);
  if (!confession) return err(notFound(`Confession ${confessionId} not found`));

  if (!canMutateOwnRecord(ctx.actor, confession)) {
    return err(permissionDenied('Only the owner can preview their confession'));
  }

  return ok({
    confession,
    displayName: confession.privacy === 'named' ? ownerDisplayName : '이름 비공개',
    willReachSharedSurface: confession.privacy !== 'private',
  });
}

/**
 * Publishes after preview. A "나만 보기" confession is still saved — it simply
 * never reaches the shared surface.
 */
export async function publishConfession(
  ctx: UseCaseContext,
  confessionId: Id,
): Promise<Result<Confession, DomainError>> {
  const confession = await ctx.repos.confessions.findById(confessionId);
  if (!confession) return err(notFound(`Confession ${confessionId} not found`));

  if (!canMutateOwnRecord(ctx.actor, confession)) {
    return err(permissionDenied('Only the owner can publish their confession'));
  }

  const now = ctx.clock.now();
  const published: Confession = {
    ...confession,
    lifecycle: 'published',
    publishedAt: now,
    updatedAt: now,
  };

  await ctx.repos.confessions.save(published);
  return ok(published);
}

export interface SharedSurfaceItem {
  readonly confession: Confession;
  readonly displayName: string;
}

/**
 * Reads the shared surface. Available to any authenticated actor; private
 * confessions are excluded at the repository level.
 */
export async function listSharedSurface(
  ctx: UseCaseContext,
  resolveDisplayName: (ownerId: Id) => string,
): Promise<Result<readonly SharedSurfaceItem[], DomainError>> {
  const shared = await ctx.repos.confessions.listSharedSurface();

  return ok(
    shared.map((confession) => ({
      confession,
      displayName:
        confession.privacy === 'named' ? resolveDisplayName(confession.ownerId) : '이름 비공개',
    })),
  );
}

export async function listOwnConfessions(
  ctx: UseCaseContext,
): Promise<Result<readonly Confession[], DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Own confessions are readable by their owner only'));
  }

  const confessions = await ctx.repos.confessions.listByOwner(ctx.actor.userId);
  return ok(confessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}
