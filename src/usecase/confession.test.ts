import { describe, expect, it } from 'vitest';
import {
  draftConfession,
  listOwnConfessions,
  listSharedSurface,
  previewConfession,
  publishConfession,
  setConfessionPrivacy,
} from './confession';
import { PRIVACY_OPTIONS, CONFESSION_TYPES } from '../domain/confession/confession';
import { asId } from '../domain/shared/identity';
import { unwrap } from '../domain/shared/result';
import { createHarness, asViewer, OTHER_USER_ID } from '../test-support/context';

const displayName = () => '아무개';

describe('confession use cases', () => {
  it('drafts, previews and publishes (happy path)', async () => {
    const { ctx } = createHarness();

    const draft = unwrap(
      await draftConfession(ctx, { type: 'grace', content: '감사한 하루', privacy: 'masked' }),
    );
    expect(draft.lifecycle).toBe('draft');

    const preview = unwrap(await previewConfession(ctx, draft.id, '아무개'));
    expect(preview.willReachSharedSurface).toBe(true);
    expect(preview.displayName).toBe('이름 비공개');

    const published = unwrap(await publishConfession(ctx, draft.id));
    expect(published.lifecycle).toBe('published');
  });

  it('keeps a 나만 보기 confession off the shared surface', async () => {
    const { ctx } = createHarness();

    const draft = unwrap(
      await draftConfession(ctx, { type: 'daily', content: '혼자 남깁니다', privacy: 'private' }),
    );
    await publishConfession(ctx, draft.id);

    expect(unwrap(await listSharedSurface(ctx, displayName))).toEqual([]);
    expect(unwrap(await listOwnConfessions(ctx))).toHaveLength(1);
  });

  it('shows an empty shared surface before anything is shared (empty state)', async () => {
    const { ctx } = createHarness();

    expect(unwrap(await listSharedSurface(ctx, displayName))).toEqual([]);
  });

  it('rejects empty content and unknown ids (error states)', async () => {
    const { ctx } = createHarness();

    const invalid = await draftConfession(ctx, { type: 'prayer', content: ' ', privacy: 'private' });
    expect(invalid.ok).toBe(false);

    const missing = await previewConfession(ctx, asId('nope'), '아무개');
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.code).toBe('NOT_FOUND');
  });

  it('denies another user from changing privacy (permission)', async () => {
    const harness = createHarness();
    const draft = unwrap(
      await draftConfession(harness.ctx, {
        type: 'confession',
        content: '고백',
        privacy: 'private',
      }),
    );

    const result = await setConfessionPrivacy(
      harness.as(asViewer(OTHER_USER_ID)),
      draft.id,
      'named',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
  });

  it('product lock: exactly 4 types and 3 privacy options, with no anonymous option', () => {
    expect([...CONFESSION_TYPES]).toEqual(['prayer', 'confession', 'grace', 'daily']);
    expect([...PRIVACY_OPTIONS]).toEqual(['private', 'masked', 'named']);
    expect(PRIVACY_OPTIONS as readonly string[]).not.toContain('anonymous');
  });

  it('product lock: a masked post is still owned — it is not anonymous', async () => {
    const { ctx } = createHarness();

    const draft = unwrap(
      await draftConfession(ctx, { type: 'prayer', content: '기도 나눔', privacy: 'masked' }),
    );
    const published = unwrap(await publishConfession(ctx, draft.id));

    expect(published.ownerId).toBe(ctx.actor.userId);
  });

  it('product lock: the shared surface is chronological, never ranked', async () => {
    const harness = createHarness();

    const first = unwrap(
      await draftConfession(harness.ctx, { type: 'daily', content: '첫째', privacy: 'named' }),
    );
    await publishConfession(harness.ctx, first.id);

    // Advance the clock so the second post is strictly newer.
    const laterCtx = {
      ...harness.ctx,
      clock: { now: () => new Date('2026-09-06T09:00:00.000Z') },
    };
    const second = unwrap(
      await draftConfession(laterCtx, { type: 'daily', content: '둘째', privacy: 'named' }),
    );
    await publishConfession(laterCtx, second.id);

    const surface = unwrap(await listSharedSurface(harness.ctx, displayName));

    expect(surface.map((item) => item.confession.content)).toEqual(['둘째', '첫째']);
    for (const item of surface) {
      const keys = Object.keys(item.confession).map((key) => key.toLowerCase());
      expect(keys.some((key) => key.includes('rank'))).toBe(false);
      expect(keys.some((key) => key.includes('popular'))).toBe(false);
      expect(keys.some((key) => key.includes('reactioncount'))).toBe(false);
    }
  });
});
