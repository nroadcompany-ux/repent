/**
 * Use case context — the composition seam between UI and adapters.
 *
 * Everything a use case needs is injected: repositories, clock and id generator.
 * No use case imports an adapter directly.
 */

import type { Actor } from '../domain/shared/actor';
import type { Clock, IdGenerator } from '../domain/shared/identity';
import type { RepentRepositories } from '../repository/repositories';

export interface UseCaseContext {
  readonly repos: RepentRepositories;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly actor: Actor;
}

/** ISO `YYYY-MM-DD` for the actor's calendar day. */
export function today(clock: Clock): string {
  const now = clock.now();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
