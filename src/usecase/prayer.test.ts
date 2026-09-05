import { describe, expect, it } from 'vitest';
import { recordPrayer, listPrayers } from './prayer';
import { isPrayerOnly } from '../domain/prayer/prayer';
import { unwrap } from '../domain/shared/result';
import { createHarness, asModerator, asViewer, OTHER_USER_ID } from '../test-support/context';

describe('prayer use cases', () => {
  it('records a prayer (happy path)', async () => {
    const { ctx } = createHarness();

    const prayer = unwrap(await recordPrayer(ctx, { content: '조용히 기도합니다.' }));

    expect(prayer.content).toBe('조용히 기도합니다.');
    expect(prayer.lifecycle).toBe('recorded');
    expect(unwrap(await listPrayers(ctx))).toHaveLength(1);
  });

  it('treats a prayer with no extension as a complete Prayer Only Exit', async () => {
    const { ctx } = createHarness();

    const prayer = unwrap(await recordPrayer(ctx, { content: '기도만 남깁니다.' }));

    expect(isPrayerOnly(prayer)).toBe(true);
  });

  it('returns an empty list when nothing was recorded (empty state)', async () => {
    const { ctx } = createHarness();

    expect(unwrap(await listPrayers(ctx))).toEqual([]);
  });

  it('rejects empty content (error state)', async () => {
    const { ctx } = createHarness();

    const result = await recordPrayer(ctx, { content: '   ' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_FAILED');
  });

  it('denies non-owner actors (permission)', async () => {
    const harness = createHarness();

    for (const actor of [asViewer(OTHER_USER_ID), asModerator(OTHER_USER_ID)]) {
      const result = await listPrayers(harness.as(actor));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
    }
  });

  it('product lock: a prayer carries no response/answered state at all', async () => {
    const { ctx } = createHarness();

    const prayer = unwrap(await recordPrayer(ctx, { content: '기도' }));
    const keys = Object.keys(prayer).map((key) => key.toLowerCase());

    expect(keys).not.toContain('answered');
    expect(keys).not.toContain('pending');
    expect(keys.some((key) => key.includes('response'))).toBe(false);
    expect(keys.some((key) => key.includes('score'))).toBe(false);
  });
});
