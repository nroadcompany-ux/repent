/**
 * Minimal Result type so use cases can report domain/permission failures without
 * throwing. Technical failures (storage, network) stay as thrown errors and are
 * surfaced by the shared Error state.
 */

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/** Unwraps an Ok value; throws when called on an Err. Test/assertion helper. */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(`unwrap called on Err: ${JSON.stringify(result.error)}`);
  }
  return result.value;
}
