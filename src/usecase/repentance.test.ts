import { describe, expect, it } from 'vitest';
import {
  finishRepentanceRecord,
  listRepentanceRecords,
  startRepentance,
  updateRepentanceParts,
} from './repentance';
import { repentanceFinalCta } from '../domain/repentance/repentance';
import { REPENTANCE_FORBIDDEN_WORDING } from '../domain/shared/product-lock';
import { asId } from '../domain/shared/identity';
import { unwrap } from '../domain/shared/result';
import { createHarness, asViewer, OTHER_USER_ID } from '../test-support/context';

describe('repentance use cases', () => {
  it('records and finishes a repentance record (happy path)', async () => {
    const { ctx } = createHarness();

    const draft = unwrap(await startRepentance(ctx));
    await updateRepentanceParts(ctx, draft.id, { reflection: '돌아봅니다.' });
    const finished = unwrap(await finishRepentanceRecord(ctx, draft.id));

    expect(finished.lifecycle).toBe('recorded');
    expect(finished.finishedAt).toBeInstanceOf(Date);
  });

  it('accepts any subset of the optional parts (progressive flow)', async () => {
    const { ctx } = createHarness();
    const draft = unwrap(await startRepentance(ctx));

    // Only 고백하기 — 돌아보기 and 돌이킴 stay empty, which is valid.
    const updated = unwrap(await updateRepentanceParts(ctx, draft.id, { confession: '고백합니다.' }));

    expect(updated.parts.reflection).toBeUndefined();
    expect(unwrap(await finishRepentanceRecord(ctx, draft.id)).lifecycle).toBe('recorded');
  });

  it('starts empty and refuses to finish an empty record (empty + error state)', async () => {
    const { ctx } = createHarness();

    expect(unwrap(await listRepentanceRecords(ctx))).toEqual([]);

    const draft = unwrap(await startRepentance(ctx));
    const result = await finishRepentanceRecord(ctx, draft.id);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_FAILED');
  });

  it('reports a missing record as not found (error state)', async () => {
    const { ctx } = createHarness();

    const result = await updateRepentanceParts(ctx, asId('nope'), { reflection: 'x' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('denies another user access to the record (permission)', async () => {
    const harness = createHarness();
    const draft = unwrap(await startRepentance(harness.ctx));

    const result = await updateRepentanceParts(harness.as(asViewer(OTHER_USER_ID)), draft.id, {
      reflection: '침범',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED');
  });

  it('product lock: the final CTA is 회개 기록 마치기 and 회개 완료 is never used', () => {
    expect(repentanceFinalCta()).toBe('회개 기록 마치기');
    expect(REPENTANCE_FORBIDDEN_WORDING).toContain('회개 완료');
    expect(repentanceFinalCta()).not.toContain('완료');
  });

  it('product lock: the record carries no step, progress or score field', async () => {
    const { ctx } = createHarness();
    const draft = unwrap(await startRepentance(ctx));
    await updateRepentanceParts(ctx, draft.id, { reflection: '돌아봅니다.' });
    const finished = unwrap(await finishRepentanceRecord(ctx, draft.id));

    const keys = [...Object.keys(finished), ...Object.keys(finished.parts)].map((key) =>
      key.toLowerCase(),
    );

    expect(keys.some((key) => key.includes('step'))).toBe(false);
    expect(keys.some((key) => key.includes('progress'))).toBe(false);
    expect(keys.some((key) => key.includes('score'))).toBe(false);
    expect(keys.some((key) => key.includes('sincerity'))).toBe(false);
  });
});
