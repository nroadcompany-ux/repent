/**
 * In-memory mock adapter.
 *
 * The only adapter that exists in this sprint. Production persistence and any
 * external provider binding are HOLD (docs/final/10 §6), so nothing here is a
 * product decision — it exists so the domain and use cases can run and be tested.
 */

import type { Id } from '../../domain/shared/identity';
import type { JourneyMarker, RecordType } from '../../domain/journey/journey';
import type { TurningPoint } from '../../domain/journey/turning-point';
import type { Prayer } from '../../domain/prayer/prayer';
import type { PromiseRecord } from '../../domain/promise/promise';
import type { ActionRecord } from '../../domain/action/action';
import type { RepentanceRecord } from '../../domain/repentance/repentance';
import type { Confession } from '../../domain/confession/confession';
import { isSharedToSurface } from '../../domain/confession/confession';
import type { ShareCopy } from '../../domain/sharing/share-copy';
import type {
  ActionRepository,
  ConfessionRepository,
  JourneyReadRepository,
  PrayerRepository,
  PromiseRepository,
  RepentRepositories,
  RepentanceRepository,
  ShareCopyRepository,
  TurningPointRepository,
} from '../../repository/repositories';

interface OwnedEntity {
  readonly id: Id;
  readonly ownerId: Id;
}

/** Shared table behaviour for the owned entities. */
class InMemoryTable<T extends OwnedEntity> {
  private readonly rows = new Map<Id, T>();

  async listByOwner(ownerId: Id): Promise<T[]> {
    return [...this.rows.values()].filter((row) => row.ownerId === ownerId);
  }

  async findById(id: Id): Promise<T | undefined> {
    return this.rows.get(id);
  }

  async save(row: T): Promise<void> {
    this.rows.set(row.id, row);
  }

  async delete(id: Id): Promise<void> {
    this.rows.delete(id);
  }

  all(): T[] {
    return [...this.rows.values()];
  }
}

export interface InMemoryStore {
  readonly prayers: InMemoryTable<Prayer>;
  readonly promises: InMemoryTable<PromiseRecord>;
  readonly actions: InMemoryTable<ActionRecord>;
  readonly repentances: InMemoryTable<RepentanceRecord>;
  readonly confessions: InMemoryTable<Confession>;
  readonly shareCopies: InMemoryTable<ShareCopy>;
  readonly turningPoints: InMemoryTable<TurningPoint>;
}

export function createInMemoryStore(): InMemoryStore {
  return {
    prayers: new InMemoryTable<Prayer>(),
    promises: new InMemoryTable<PromiseRecord>(),
    actions: new InMemoryTable<ActionRecord>(),
    repentances: new InMemoryTable<RepentanceRecord>(),
    confessions: new InMemoryTable<Confession>(),
    shareCopies: new InMemoryTable<ShareCopy>(),
    turningPoints: new InMemoryTable<TurningPoint>(),
  };
}

function markerFrom(
  recordId: Id,
  recordType: RecordType,
  day: string,
  title: string,
): JourneyMarker {
  return { recordId, recordType, day, title };
}

function firstLine(text: string, fallback: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return fallback;
  const [line = fallback] = trimmed.split('\n');
  return line.length > 40 ? `${line.slice(0, 40)}…` : line;
}

export function createInMemoryRepositories(
  store: InMemoryStore = createInMemoryStore(),
): RepentRepositories {
  const prayers: PrayerRepository = store.prayers;
  const promises: PromiseRepository = store.promises;

  const actions: ActionRepository = {
    listByOwner: (ownerId) => store.actions.listByOwner(ownerId),
    listByPromise: async (promiseId) =>
      store.actions.all().filter((action) => action.promiseId === promiseId),
    findById: (id) => store.actions.findById(id),
    save: (action) => store.actions.save(action),
    delete: (id) => store.actions.delete(id),
  };

  const repentances: RepentanceRepository = store.repentances;

  const confessions: ConfessionRepository = {
    listByOwner: (ownerId) => store.confessions.listByOwner(ownerId),
    listSharedSurface: async () =>
      store.confessions
        .all()
        .filter(isSharedToSurface)
        // Chronological, newest first. Never ordered by reaction count or ranking.
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    findById: (id) => store.confessions.findById(id),
    save: (confession) => store.confessions.save(confession),
    delete: (id) => store.confessions.delete(id),
  };

  const shareCopies: ShareCopyRepository = {
    listByOwner: (ownerId) => store.shareCopies.listByOwner(ownerId),
    listBySource: async (sourceId) =>
      store.shareCopies.all().filter((copy) => copy.sourceId === sourceId),
    findById: (id) => store.shareCopies.findById(id),
    save: (copy) => store.shareCopies.save(copy),
    delete: (id) => store.shareCopies.delete(id),
  };

  const turningPoints: TurningPointRepository = {
    listByOwner: (ownerId) => store.turningPoints.listByOwner(ownerId),
    findById: (id) => store.turningPoints.findById(id),
    save: (point) => store.turningPoints.save(point),
  };

  const journey: JourneyReadRepository = {
    listMarkers: async (ownerId) => {
      const [ownPrayers, ownPromises, ownActions, ownRepentances, ownConfessions] =
        await Promise.all([
          store.prayers.listByOwner(ownerId),
          store.promises.listByOwner(ownerId),
          store.actions.listByOwner(ownerId),
          store.repentances.listByOwner(ownerId),
          store.confessions.listByOwner(ownerId),
        ]);

      return [
        ...ownPrayers.map((p) =>
          markerFrom(p.id, 'prayer', p.day, firstLine(p.content, '기도 기록')),
        ),
        ...ownPromises.map((p) =>
          markerFrom(p.id, 'promise', p.day, firstLine(p.content, '약속 기록')),
        ),
        ...ownActions.map((a) =>
          markerFrom(a.id, 'action', a.day, firstLine(a.content, '실행 기록')),
        ),
        ...ownRepentances.map((r) =>
          markerFrom(
            r.id,
            'repentance',
            r.day,
            firstLine(r.parts.reflection ?? r.parts.confession ?? '', '회개 기록'),
          ),
        ),
        ...ownConfessions.map((c) =>
          markerFrom(c.id, 'confession', c.day, firstLine(c.content, '고백 기록')),
        ),
      ];
    },
  };

  return {
    prayers,
    promises,
    actions,
    repentances,
    confessions,
    shareCopies,
    turningPoints,
    journey,
  };
}
