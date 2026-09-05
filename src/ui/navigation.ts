/**
 * Main navigation definition.
 *
 * Source: docs/final/05-ia-menu-architecture.md §1 Locked Navigation Rules.
 *
 * Exactly 5 items: 여정 / 약속 / 실행 / 회개 / 고백.
 * Today and Search are NOT tabs — Today is a Journey coordinate and Search is a
 * feature inside Journey.
 */

export interface NavItem {
  readonly href: '/journey' | '/promise' | '/action' | '/repentance' | '/confession';
  readonly label: string;
  readonly domain: string;
}

export const MAIN_NAV: readonly NavItem[] = [
  { href: '/journey', label: '여정', domain: 'Journey' },
  { href: '/promise', label: '약속', domain: 'Promise' },
  { href: '/action', label: '실행', domain: 'Action' },
  { href: '/repentance', label: '회개', domain: 'Repentance' },
  { href: '/confession', label: '고백', domain: 'Confession' },
] as const;

export const MAIN_NAV_LABELS = MAIN_NAV.map((item) => item.label);
