/**
 * Confession domain.
 *
 * Source: docs/final/05-ia-menu-architecture.md §7, docs/final/08 SCR-RPT-CNF-001/002,
 * docs/final/09 §1, §3.
 *
 * Locked rules encoded here:
 * - Confession types are exactly 기도 / 고백 / 은혜 / 일상.
 * - Privacy is exactly 3 options. Anonymous publishing does not exist — sharing
 *   with a masked name still belongs to a known owner.
 * - Preview always precedes publish; there is no implicit share.
 */

import type { Id } from '../shared/identity';
import type { PublicationLifecycle } from '../shared/lifecycle';

export const CONFESSION_TYPES = ['prayer', 'confession', 'grace', 'daily'] as const;
export type ConfessionType = (typeof CONFESSION_TYPES)[number];

export const CONFESSION_TYPE_LABELS: Readonly<Record<ConfessionType, string>> = {
  prayer: '기도',
  confession: '고백',
  grace: '은혜',
  daily: '일상',
};

/** The complete set of privacy options. There is no anonymous option. */
export const PRIVACY_OPTIONS = ['private', 'masked', 'named'] as const;
export type PrivacyOption = (typeof PRIVACY_OPTIONS)[number];

export const PRIVACY_LABELS: Readonly<Record<PrivacyOption, string>> = {
  private: '나만 보기',
  masked: '이름 가리고 나누기',
  named: '이름 공개로 나누기',
};

export interface Confession {
  readonly id: Id;
  readonly ownerId: Id;
  readonly type: ConfessionType;
  readonly content: string;
  readonly privacy: PrivacyOption;
  readonly day: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Internal implementation state — see shared/lifecycle.ts (CANDIDATE naming). */
  readonly lifecycle: PublicationLifecycle;
  readonly publishedAt?: Date;
}

export interface NewConfessionInput {
  readonly type: ConfessionType;
  readonly content: string;
  readonly privacy: PrivacyOption;
}

export function isValidConfessionContent(content: string): boolean {
  return content.trim().length > 0;
}

/** Only masked/named confessions reach the shared surface. */
export function isSharedToSurface(confession: Confession): boolean {
  return (
    confession.lifecycle === 'published' &&
    (confession.privacy === 'masked' || confession.privacy === 'named')
  );
}

/**
 * Display name for the shared surface. A masked post hides the name but is still
 * owned — it is not an anonymous post.
 */
export function surfaceDisplayName(
  confession: Confession,
  ownerDisplayName: string,
): string {
  return confession.privacy === 'named' ? ownerDisplayName : '이름 비공개';
}
