/**
 * Domain-level failure reasons.
 *
 * Empty and Error are technical states only — no spiritual evaluation wording is
 * ever attached to them. Source: docs/final/08-screen-specification.md §3.
 */

export type DomainErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'PRODUCT_LOCK_VIOLATION';

export interface DomainError {
  readonly code: DomainErrorCode;
  /** Developer-facing detail. UI copy comes from the UI layer, not from here. */
  readonly detail: string;
}

export function validationFailed(detail: string): DomainError {
  return { code: 'VALIDATION_FAILED', detail };
}

export function notFound(detail: string): DomainError {
  return { code: 'NOT_FOUND', detail };
}

export function permissionDenied(detail: string): DomainError {
  return { code: 'PERMISSION_DENIED', detail };
}

export function productLockViolation(detail: string): DomainError {
  return { code: 'PRODUCT_LOCK_VIOLATION', detail };
}
