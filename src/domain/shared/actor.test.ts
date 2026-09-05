import { describe, expect, it } from 'vitest';
import {
  aiActor,
  canModerateSharedSurface,
  canMutateOwnRecord,
  canOwnRecord,
  canReadPrivateSource,
  moderator,
  owner,
  systemActor,
  viewer,
} from './actor';
import { asId } from './identity';

const OWNER_ID = asId('user-owner');
const OTHER_ID = asId('user-other');
const privateRecord = { ownerId: OWNER_ID };

describe('actor / permission boundary', () => {
  it('lets the owner read and mutate their own record (happy path)', () => {
    const actor = owner(OWNER_ID);

    expect(canReadPrivateSource(actor, privateRecord)).toBe(true);
    expect(canMutateOwnRecord(actor, privateRecord)).toBe(true);
  });

  it('denies a different owner access to someone else\'s record', () => {
    expect(canReadPrivateSource(owner(OTHER_ID), privateRecord)).toBe(false);
  });

  it('product lock: a moderator can never reach a private source', () => {
    const mod = moderator(OTHER_ID);

    expect(canReadPrivateSource(mod, privateRecord)).toBe(false);
    expect(canMutateOwnRecord(mod, privateRecord)).toBe(false);
    // Moderation is limited to the shared surface.
    expect(canModerateSharedSurface(mod)).toBe(true);
  });

  it('product lock: a viewer cannot read a private source', () => {
    expect(canReadPrivateSource(viewer(OTHER_ID), privateRecord)).toBe(false);
  });

  it('product lock: AI and System can never own a record', () => {
    expect(canOwnRecord('ai')).toBe(false);
    expect(canOwnRecord('system')).toBe(false);
    expect(canOwnRecord('owner')).toBe(true);

    expect(canReadPrivateSource(aiActor(OWNER_ID), privateRecord)).toBe(false);
    expect(canReadPrivateSource(systemActor(OWNER_ID), privateRecord)).toBe(false);
  });
});
