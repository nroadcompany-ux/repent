import { describe, expect, it } from 'vitest';
import { chooseFollowUp, completeAction, createAction, listActions } from './action';
import { FOLLOW_UP_CHOICES } from '../domain/action/action';
import { asId } from '../domain/shared/identity';
import { unwrap } from '../domain/shared/result';
import { createHarness, asViewer, OTHER_USER_ID } from '../test-support/context';

describe('action use cases', () => {
  it('creates and completes an action (happy path)', async () => {
    const { ctx } = createHarness();

    const action = unwrap(await createAction(ctx, { content: '아침 10분 기도' }));
    expect(action.lifecycle).toBe('planned');

    const done = unwrap(await completeAction(ctx, action.id));
    expect(done.lifecycle).toBe('done');
  });

  it('returns an empty list before anything is recorded (empty state)', async () => {
    const { ctx } = createHarness();

    expect(unwrap(await listActions(ctx))).toEqual([]);
  });

  it('rejects empty content and unknown ids (error states)', async () => {
    const { ctx } = createHarness();

    expect((await createAction(ctx, { content: '  ' })).ok).toBe(false);

    const missing = await completeAction(ctx, asId('nope'));
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.code).toBe('NOT_FOUND');
  });

  it('requires a date when the user reschedules (validation)', async () => {
    const { ctx } = createHarness();
    const action = unwrap(await createAction(ctx, { content: '실행' }));

    const result = await chooseFollowUp(ctx, action.id, 'reschedule');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_FAILED');
  });

  it('denies another user from choosing a follow-up (permission)', async () => {
    const harness = createHarness();
    const action = unwrap(await createAction(harness.ctx, { content: '실행' }));

    const result = await chooseFollowUp(harness.as(asViewer(OTHER_USER_ID)), action.id, 'retry');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
  });

  it('product lock: exactly 5 follow-up choices, and none of them is a failure reason', () => {
    expect([...FOLLOW_UP_CHOICES]).toEqual([
      'retry',
      'modify',
      'reschedule',
      'record_only',
      'optional_repent',
    ]);

    for (const choice of FOLLOW_UP_CHOICES) {
      expect(choice).not.toMatch(/reason|cause|why|fail/i);
    }
  });

  it('product lock: an action record has no failure-cause field and never equals sin', async () => {
    const { ctx } = createHarness();
    const action = unwrap(await createAction(ctx, { content: '실행' }));

    const updated = unwrap(await chooseFollowUp(ctx, action.id, 'record_only'));
    const keys = Object.keys(updated.action).map((key) => key.toLowerCase());

    expect(keys.some((key) => key.includes('failurereason'))).toBe(false);
    expect(keys.some((key) => key.includes('cause'))).toBe(false);
    expect(keys.some((key) => key.includes('sin'))).toBe(false);
  });

  it('product lock: Optional Repent only offers the entry — no repentance is auto-created', async () => {
    const { ctx } = createHarness();
    const action = unwrap(await createAction(ctx, { content: '실행' }));

    const outcome = unwrap(await chooseFollowUp(ctx, action.id, 'optional_repent'));

    expect(outcome.offersRepentanceEntry).toBe(true);
    // Nothing was written to the repentance store on the user's behalf.
    expect(await ctx.repos.repentances.listByOwner(action.ownerId)).toEqual([]);
  });
});
