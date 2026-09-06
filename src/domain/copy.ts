/**
 * RETURN Brand Copy — Owner Final Decision, 2026-09-06.
 *
 * Scope is deliberately small: the Entry/Login brand copy plus the wording the
 * product may never use. This is a Brand Copy Correction that states RETURN's
 * purpose more clearly — not new Product Meaning.
 *
 * BRAND LANGUAGE
 *   RETURN is closer to "하나님과 함께한 삶을 기억한다" than to
 *   "신앙생활을 관리한다". Tone stays Quiet · Calm · Warm · Reflective ·
 *   Trustworthy.
 *
 * Screens import from here rather than inlining brand strings, so the hero
 * wording cannot drift as screens are edited.
 */

/** Entry / Login hero. Do not paraphrase. */
export const PRIMARY_BRAND_COPY = {
  wordmark: 'RETURN',
  headline: '다시 하나님께.',
  subline: '하나님과 함께한 삶의 순간을 기록합니다.',
} as const

/** Shown verbatim under the providers on the Entry / Login screen. */
export const ENTRY_SAFETY_NOTE = [
  '기도와 회개 기록은 기본적으로 나만 볼 수 있습니다.',
  '공개는 내가 직접 선택할 때만 이루어집니다.',
] as const

/**
 * The previous hero line. NOT deleted — it stays where its meaning belongs, in
 * the Journey Education Banner (docs/01 Journey IA item 2). It is no longer the
 * Login Primary hero.
 */
export const JOURNEY_BANNER_LEGACY_COPY = ['오늘의 기록이', '당신의 여정이 됩니다'] as const

/**
 * Canonical auth. Owner Decision 2026-09-06 expanded this from
 * Google + Naver to Google + Naver + Email/Password
 * (Canonical Meaning Change: AUTH SCOPE ONLY / OWNER APPROVED).
 */
export const AUTH_PROVIDERS = ['google', 'naver', 'email'] as const
export type AuthProvider = (typeof AUTH_PROVIDERS)[number]

/** The two external providers. Email is handled in-app, not by an OAuth hop. */
export const SOCIAL_LOGIN_PROVIDERS = ['google', 'naver'] as const

export const SOCIAL_LOGIN_LABELS = {
  google: 'Google로 시작하기',
  naver: 'Naver로 시작하기',
  email: '이메일로 시작하기',
} as const

/**
 * A provider that cannot complete a login yet stays VISIBLE and disabled.
 * Hiding it would misrepresent what RETURN supports; letting it link out would
 * drop the member on a provider error page.
 */
export const PROVIDER_PENDING_NOTE = (labels: readonly string[]) =>
  `${labels.join(' · ')} 로그인은 준비 중입니다.`

/**
 * Wording that must never reach a screen: the system does not judge the
 * member's spiritual state, and it never speaks a verdict on sin, forgiveness,
 * or answered prayer. Enumerated as user-facing Korean so the regression test
 * can scan rendered copy, not just enum names.
 */
export const FORBIDDEN_COPY = [
  '오늘도 실패',
  '회개하지 않았습니다',
  '회개가 부족',
  '믿음이 부족',
  '신앙이 부족',
  '기도가 부족',
  '하나님과 멀어졌',
  '하나님이 응답하셨',
  '용서받았습니다',
] as const
