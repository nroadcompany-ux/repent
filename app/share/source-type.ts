import type { ShareableSourceType } from '@/usecase/sharing';

/**
 * Kept out of actions.ts on purpose: every export of a `'use server'` module must
 * be an async server action, and this is a plain synchronous parser.
 */
export function parseSourceType(raw: string | undefined): ShareableSourceType | undefined {
  return raw === 'prayer' || raw === 'repentance' ? raw : undefined;
}
