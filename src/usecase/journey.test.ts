import { describe, expect, it } from 'vitest';
import { confirmJourneyTurningPoint, searchJourney, viewJourney } from './journey';
import { recordPrayer } from './prayer';
import { buildJourneyPoints } from '../domain/journey/journey';
import { asId } from '../domain/shared/identity';
import { unwrap } from '../domain/shared/result';
import {
  createHarness,
  asModerator,
  asViewer,
  OTHER_USER_ID,
  OWNER_ID,
} from '../test-support/context';

describe('journey use cases', () => {
  it('shows the owner their own records for a range (happy path)', async () => {
    const harness = createHarness();
    await recordPrayer(harness.ctx, { content: '오늘의 기도' });

    const view = unwrap(await viewJourney(harness.ctx, 'today'));

    expect(view.isEmpty).toBe(false);
    expect(view.points).toHaveLength(1);
    expect(view.points[0]?.markers[0]?.recordType).toBe('prayer');
  });

  it('reports an empty journey when nothing is recorded (empty state)', async () => {
    const harness = createHarness();

    const view = unwrap(await viewJourney(harness.ctx, 'today'));

    expect(view.isEmpty).toBe(true);
    expect(view.points).toEqual([]);
  });

  it('product lock: Missing Day = No Point — no interpolation across a gap', () => {
    const points = buildJourneyPoints([
      { recordId: asId('a'), recordType: 'prayer', day: '2026-09-01', title: 'a' },
      { recordId: asId('b'), recordType: 'action', day: '2026-09-04', title: 'b' },
    ]);

    // 09-02 and 09-03 have no record, so they produce no point of any kind.
    expect(points.map((point) => point.day)).toEqual(['2026-09-01', '2026-09-04']);
  });

  it('denies non-owner actors (permission)', async () => {
    const harness = createHarness();

    for (const actor of [asViewer(OTHER_USER_ID), asModerator(OTHER_USER_ID)]) {
      const result = await viewJourney(harness.as(actor), 'all');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
    }
  });

  it('searches inside journey and reports no result as an empty state', async () => {
    const harness = createHarness();
    await recordPrayer(harness.ctx, { content: '감사 기도' });

    const hit = unwrap(await searchJourney(harness.ctx, { range: 'all', keyword: '감사' }));
    expect(hit.isEmpty).toBe(false);

    const miss = unwrap(await searchJourney(harness.ctx, { range: 'all', keyword: '없는말' }));
    expect(miss.isEmpty).toBe(true);
    expect(miss.markers).toEqual([]);
  });

  it('denies journey search to non-owners (permission)', async () => {
    const harness = createHarness();

    const result = await searchJourney(harness.as(asViewer(OTHER_USER_ID)), { range: 'all' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
  });

  it('product lock: an AI candidate turning point is final only after the user confirms', async () => {
    const harness = createHarness();
    const pointId = asId('tp-1');

    await harness.ctx.repos.turningPoints.save({
      id: pointId,
      ownerId: OWNER_ID,
      day: '2026-09-05',
      label: '후보',
      origin: 'ai_candidate',
      confirmedByUser: false,
    });

    const beforeConfirm = unwrap(await viewJourney(harness.ctx, 'today'));
    expect(beforeConfirm.turningPoints[0]?.confirmedByUser).toBe(false);

    // Another user cannot confirm it.
    const denied = await confirmJourneyTurningPoint(harness.as(asViewer(OTHER_USER_ID)), pointId);
    expect(denied.ok).toBe(false);

    const confirmed = unwrap(await confirmJourneyTurningPoint(harness.ctx, pointId));
    expect(confirmed.confirmedByUser).toBe(true);
  });

  it('reports a missing turning point as not found (error state)', async () => {
    const harness = createHarness();

    const result = await confirmJourneyTurningPoint(harness.ctx, asId('missing'));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});
