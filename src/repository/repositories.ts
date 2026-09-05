/**
 * Repository ports.
 *
 * Source: docs/final/10-wbs-development-handoff.md §1 and the implementation
 * approach in the Implementation Start Directive §5 —
 * Domain → Use Case → Repository Interface → Adapter → UI.
 *
 * No external provider is bound here. Runtime/provider binding is HOLD
 * (docs/final/10 §6), so the only adapter that exists today is an in-memory mock.
 */

import type { Id } from '../domain/shared/identity';
import type { JourneyMarker } from '../domain/journey/journey';
import type { TurningPoint } from '../domain/journey/turning-point';
import type { Prayer } from '../domain/prayer/prayer';
import type { PromiseRecord } from '../domain/promise/promise';
import type { ActionRecord } from '../domain/action/action';
import type { RepentanceRecord } from '../domain/repentance/repentance';
import type { Confession } from '../domain/confession/confession';
import type { ShareCopy } from '../domain/sharing/share-copy';

export interface PrayerRepository {
  listByOwner(ownerId: Id): Promise<Prayer[]>;
  findById(id: Id): Promise<Prayer | undefined>;
  save(prayer: Prayer): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface PromiseRepository {
  listByOwner(ownerId: Id): Promise<PromiseRecord[]>;
  findById(id: Id): Promise<PromiseRecord | undefined>;
  save(promise: PromiseRecord): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface ActionRepository {
  listByOwner(ownerId: Id): Promise<ActionRecord[]>;
  listByPromise(promiseId: Id): Promise<ActionRecord[]>;
  findById(id: Id): Promise<ActionRecord | undefined>;
  save(action: ActionRecord): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface RepentanceRepository {
  listByOwner(ownerId: Id): Promise<RepentanceRecord[]>;
  findById(id: Id): Promise<RepentanceRecord | undefined>;
  save(record: RepentanceRecord): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface ConfessionRepository {
  listByOwner(ownerId: Id): Promise<Confession[]>;
  /** Shared surface feed. Chronological only — no popularity or ranking order. */
  listSharedSurface(): Promise<Confession[]>;
  findById(id: Id): Promise<Confession | undefined>;
  save(confession: Confession): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface ShareCopyRepository {
  listByOwner(ownerId: Id): Promise<ShareCopy[]>;
  listBySource(sourceId: Id): Promise<ShareCopy[]>;
  findById(id: Id): Promise<ShareCopy | undefined>;
  save(copy: ShareCopy): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface TurningPointRepository {
  listByOwner(ownerId: Id): Promise<TurningPoint[]>;
  findById(id: Id): Promise<TurningPoint | undefined>;
  save(point: TurningPoint): Promise<void>;
}

/**
 * Journey does not own records; it reads markers that reference the owner's own
 * records across the other domains.
 */
export interface JourneyReadRepository {
  listMarkers(ownerId: Id): Promise<JourneyMarker[]>;
}

/** Everything a use case may need, assembled once at the composition root. */
export interface RepentRepositories {
  readonly prayers: PrayerRepository;
  readonly promises: PromiseRepository;
  readonly actions: ActionRepository;
  readonly repentances: RepentanceRepository;
  readonly confessions: ConfessionRepository;
  readonly shareCopies: ShareCopyRepository;
  readonly turningPoints: TurningPointRepository;
  readonly journey: JourneyReadRepository;
}
