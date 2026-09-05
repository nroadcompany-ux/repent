/**
 * Composition root.
 *
 * Wires the mock adapter, clock and id generator into a UseCaseContext for the
 * current actor. Auth is a scaffold in this sprint — there is no provider binding
 * yet (HOLD), so the session resolves to a single demo owner.
 *
 * Nothing in this file is a product decision; replacing the adapter here is the
 * only change needed when real persistence and auth arrive.
 */

import { asId, createIdGenerator, systemClock } from '../domain/shared/identity';
import type { Actor } from '../domain/shared/actor';
import { owner } from '../domain/shared/actor';
import { createInMemoryRepositories } from '../adapters/mock/in-memory-repositories';
import type { RepentRepositories } from '../repository/repositories';
import type { UseCaseContext } from '../usecase/context';
import { seedDemoData } from './seed';

const DEMO_USER_ID = asId('user-demo');
const DEMO_DISPLAY_NAME = '나';

let repositories: RepentRepositories | undefined;
const ids = createIdGenerator('rec');

function getRepositories(): RepentRepositories {
  if (!repositories) {
    repositories = createInMemoryRepositories();
    seedDemoData(repositories, DEMO_USER_ID, ids, systemClock);
  }
  return repositories;
}

/**
 * Resolves the current actor. Real authentication is not bound in this sprint;
 * this is the single seam where it will be introduced.
 */
export function currentActor(): Actor {
  return owner(DEMO_USER_ID);
}

export function currentDisplayName(): string {
  return DEMO_DISPLAY_NAME;
}

export function createContext(actor: Actor = currentActor()): UseCaseContext {
  return { repos: getRepositories(), clock: systemClock, ids, actor };
}
