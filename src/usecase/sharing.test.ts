import { describe, expect, it } from 'vitest';
import {
  deleteSourceWithChoice,
  listShareableFields,
  planSourceDeletion,
  previewShareCopy,
  publishShareCopy,
} from './sharing';
import { recordPrayer } from './prayer';
import { asId } from '../domain/shared/identity';
import { unwrap } from '../domain/shared/result';
import { createHarness, asViewer, OTHER_USER_ID } from '../test-support/context';

describe('sharing (ShareCopy) use cases', () => {
  it('shares only the selected fields (happy path)', async () => {
    const { ctx } = createHarness();
    const prayer = unwrap(
      await recordPrayer(ctx, {
        content: '기도 본문',
        extensions: { reflection: '돌아보기 내용' },
      }),
    );

    const available = unwrap(await listShareableFields(ctx, prayer.id, 'prayer'));
    expect(available.map((field) => field.key)).toEqual(['content', 'reflection']);

    const selection = {
      sourceId: prayer.id,
      sourceType: 'prayer' as const,
      fields: available.filter((field) => field.key === 'content'),
      privacy: 'masked' as const,
    };

    const copy = unwrap(await publishShareCopy(ctx, selection));

    expect(copy.fields).toHaveLength(1);
    expect(copy.fields[0]?.key).toBe('content');
    // The unselected reflection never left the private source.
    expect(copy.fields.some((field) => field.key === 'reflection')).toBe(false);
  });

  it('requires at least one selected field (error state)', async () => {
    const { ctx } = createHarness();
    const prayer = unwrap(await recordPrayer(ctx, { content: '기도' }));

    const empty = previewShareCopy({
      sourceId: prayer.id,
      sourceType: 'prayer',
      fields: [],
      privacy: 'masked',
    });

    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe('VALIDATION_FAILED');
  });

  it('reports a missing source as not found (error state)', async () => {
    const { ctx } = createHarness();

    const result = await listShareableFields(ctx, asId('nope'), 'prayer');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('denies another user from sharing the owner\'s source (permission)', async () => {
    const harness = createHarness();
    const prayer = unwrap(await recordPrayer(harness.ctx, { content: '기도' }));

    const result = await listShareableFields(
      harness.as(asViewer(OTHER_USER_ID)),
      prayer.id,
      'prayer',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
  });

  it('product lock: the snapshot does not follow later source edits', async () => {
    const { ctx } = createHarness();
    const prayer = unwrap(await recordPrayer(ctx, { content: '원래 내용' }));
    const fields = unwrap(await listShareableFields(ctx, prayer.id, 'prayer'));

    const copy = unwrap(
      await publishShareCopy(ctx, {
        sourceId: prayer.id,
        sourceType: 'prayer',
        fields,
        privacy: 'masked',
      }),
    );

    await ctx.repos.prayers.save({ ...prayer, content: '수정된 내용' });

    const stored = await ctx.repos.shareCopies.findById(copy.id);
    expect(stored?.fields[0]?.value).toBe('원래 내용');
  });

  it('product lock: deleting the source never cascades on its own', async () => {
    const { ctx } = createHarness();
    const prayer = unwrap(await recordPrayer(ctx, { content: '기도' }));
    const fields = unwrap(await listShareableFields(ctx, prayer.id, 'prayer'));
    await publishShareCopy(ctx, {
      sourceId: prayer.id,
      sourceType: 'prayer',
      fields,
      privacy: 'masked',
    });

    const plan = unwrap(await planSourceDeletion(ctx, prayer.id, 'prayer'));
    expect(plan.choiceRequired).toBe(true);

    const outcome = unwrap(
      await deleteSourceWithChoice(ctx, prayer.id, 'prayer', 'keep_share_copies'),
    );

    expect(outcome.shareCopiesKept).toBe(1);
    expect(outcome.shareCopiesDeleted).toBe(0);
    expect(await ctx.repos.prayers.findById(prayer.id)).toBeUndefined();
    expect(await ctx.repos.shareCopies.listBySource(prayer.id)).toHaveLength(1);
  });

  it('deletes the share copies when the user explicitly chooses to', async () => {
    const { ctx } = createHarness();
    const prayer = unwrap(await recordPrayer(ctx, { content: '기도' }));
    const fields = unwrap(await listShareableFields(ctx, prayer.id, 'prayer'));
    await publishShareCopy(ctx, {
      sourceId: prayer.id,
      sourceType: 'prayer',
      fields,
      privacy: 'masked',
    });

    const outcome = unwrap(
      await deleteSourceWithChoice(ctx, prayer.id, 'prayer', 'delete_share_copies'),
    );

    expect(outcome.shareCopiesDeleted).toBe(1);
    expect(await ctx.repos.shareCopies.listBySource(prayer.id)).toEqual([]);
  });

  it('deletes a source with no share copies without asking (empty state)', async () => {
    const { ctx } = createHarness();
    const prayer = unwrap(await recordPrayer(ctx, { content: '기도' }));

    const plan = unwrap(await planSourceDeletion(ctx, prayer.id, 'prayer'));

    expect(plan.choiceRequired).toBe(false);
    expect(plan.affectedShareCopies).toEqual([]);
  });
});
