/**
 * Test helpers: a deterministic context over the in-memory adapter.
 */

import { asId, createIdGenerator, type Clock, type Id } from '../domain/shared/identity';
import type { Actor } from '../domain/shared/actor';
import { moderator, owner, viewer } from '../domain/shared/actor';
import { createInMemoryRepositories, createInMemoryStore, type InMemoryStore } from '../adapters/mock/in-memory-repositories';
import type { UseCaseContext } from '../usecase/context';

export const OWNER_ID: Id = asId('user-owner');
export const OTHER_USER_ID: Id = asId('user-other');

export function fixedClock(iso = '2026-09-05T09:00:00.000Z'): Clock {
  return { now: () => new Date(iso) };
}

export interface TestHarness {
  readonly ctx: UseCaseContext;
  readonly store: InMemoryStore;
  /** Same repositories/clock, seen through a different actor. */
  as(actor: Actor): UseCaseContext;
}

export function createHarness(options?: { actor?: Actor; clock?: Clock }): TestHarness {
  const store = createInMemoryStore();
  const repos = createInMemoryRepositories(store);
  const clock = options?.clock ?? fixedClock();
  const ids = createIdGenerator('test');
  const actor = options?.actor ?? owner(OWNER_ID);

  const ctx: UseCaseContext = { repos, clock, ids, actor };

  return {
    ctx,
    store,
    as: (nextActor: Actor) => ({ ...ctx, actor: nextActor }),
  };
}

export const asOwner = owner;
export const asViewer = viewer;
export const asModerator = moderator;
