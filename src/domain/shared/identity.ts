/**
 * Identifiers and clock abstraction.
 *
 * Ids and timestamps are injected so use cases stay deterministic under test and
 * are not bound to any external provider (runtime binding is HOLD).
 */

export type Id = string & { readonly __brand: 'Id' };

export function asId(raw: string): Id {
  return raw as Id;
}

/** Monotonic id source, injected into use cases. */
export interface IdGenerator {
  next(): Id;
}

/** Time source, injected into use cases. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

export function createIdGenerator(prefix: string): IdGenerator {
  let seq = 0;
  return {
    next: () => {
      seq += 1;
      return asId(`${prefix}-${seq.toString().padStart(6, '0')}`);
    },
  };
}
