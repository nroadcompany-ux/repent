import { describe, expect, it } from 'vitest';
import { createPromise, finishPromise, getPromiseWithActions, listPromises } from './promise';
import { createAction } from './action';
import { PROMISE_CLOSE_LABEL } from '../domain/shared/product-lock';
import { asId } from '../domain/shared/identity';
import { unwrap } from '../domain/shared/result';
import { createHarness, asViewer, OTHER_USER_ID } from '../test-support/context';

describe('promise use cases', () => {
  it('creates a promise (happy path)', async () => {
    const { ctx } = createHarness();

    const promise = unwrap(await createPromise(ctx, { content: '아침에 먼저 기도하기' }));

    expect(promise.lifecycle).toBe('active');
    expect(unwrap(await listPromises(ctx))).toHaveLength(1);
  });

  it('allows a promise with zero actions (empty state is valid)', async () => {
    const { ctx } = createHarness();
    const promise = unwrap(await createPromise(ctx, { content: '약속' }));

    const detail = unwrap(await getPromiseWithActions(ctx, promise.id));

    expect(detail.actions).toEqual([]);
  });

  it('supports 1:N actions', async () => {
    const { ctx } = createHarness();
    const promise = unwrap(await createPromise(ctx, { content: '약속' }));

    await createAction(ctx, { content: '실행 1', promiseId: promise.id });
    await createAction(ctx, { content: '실행 2', promiseId: promise.id });

    const detail = unwrap(await getPromiseWithActions(ctx, promise.id));
    expect(detail.actions).toHaveLength(2);
  });

  it('rejects empty content and unknown ids (error states)', async () => {
    const { ctx } = createHarness();

    const invalid = await createPromise(ctx, { content: '' });
    expect(invalid.ok).toBe(false);

    const missing = await finishPromise(ctx, asId('nope'));
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.code).toBe('NOT_FOUND');
  });

  it('denies another user from finishing the promise (permission)', async () => {
    const harness = createHarness();
    const promise = unwrap(await createPromise(harness.ctx, { content: '약속' }));

    const result = await finishPromise(harness.as(asViewer(OTHER_USER_ID)), promise.id);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
  });

  it('product lock: closing is the user\'s "마무리됨" and carries no streak or score', async () => {
    const { ctx } = createHarness();
    const promise = unwrap(await createPromise(ctx, { content: '약속' }));

    const closed = unwrap(await finishPromise(ctx, promise.id));

    expect(PROMISE_CLOSE_LABEL).toBe('마무리됨');
    expect(closed.lifecycle).toBe('closed');

    const keys = Object.keys(closed).map((key) => key.toLowerCase());
    expect(keys.some((key) => key.includes('streak'))).toBe(false);
    expect(keys.some((key) => key.includes('score'))).toBe(false);
    expect(keys.some((key) => key.includes('sin'))).toBe(false);
  });
});
