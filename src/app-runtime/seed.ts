/**
 * Demo seed data for the mock adapter.
 *
 * Only exists so the screens have something to render before real persistence is
 * bound. The content is deliberately plain and carries no product meaning.
 *
 * Note the intentional gap in the days used: it exercises the "Missing Day = No
 * Point" rule, so the journey shows nothing at all for days with no record.
 */

import type { Clock, Id, IdGenerator } from '../domain/shared/identity';
import type { RepentRepositories } from '../repository/repositories';

function dayOffset(clock: Clock, days: number): string {
  const date = clock.now();
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function seedDemoData(
  repos: RepentRepositories,
  ownerId: Id,
  ids: IdGenerator,
  clock: Clock,
): void {
  const now = clock.now();

  void repos.prayers.save({
    id: ids.next(),
    ownerId,
    content: '오늘 마음이 조급했습니다. 조용히 기도합니다.',
    day: dayOffset(clock, 0),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'recorded',
    extensions: {},
  });

  void repos.promises.save({
    id: ids.next(),
    ownerId,
    content: '매일 아침 10분 먼저 기도하기',
    day: dayOffset(clock, 2),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'active',
  });

  void repos.actions.save({
    id: ids.next(),
    ownerId,
    content: '아침 10분 기도',
    day: dayOffset(clock, 2),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'planned',
  });

  // 5 days ago — note days 1, 3 and 4 stay empty on purpose (Missing Day = No Point).
  void repos.repentances.save({
    id: ids.next(),
    ownerId,
    day: dayOffset(clock, 5),
    createdAt: now,
    updatedAt: now,
    lifecycle: 'recorded',
    parts: { reflection: '말로 사람을 아프게 했던 일을 돌아봅니다.' },
    finishedAt: now,
  });
}
