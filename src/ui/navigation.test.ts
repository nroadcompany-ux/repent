import { describe, expect, it } from 'vitest';
import { MAIN_NAV, MAIN_NAV_LABELS } from './navigation';

describe('main navigation lock', () => {
  it('is exactly 여정 / 약속 / 실행 / 회개 / 고백', () => {
    expect(MAIN_NAV_LABELS).toEqual(['여정', '약속', '실행', '회개', '고백']);
    expect(MAIN_NAV).toHaveLength(5);
  });

  it('product lock: Today is not a tab — it is a Journey coordinate', () => {
    expect(MAIN_NAV_LABELS).not.toContain('오늘');
    expect(MAIN_NAV.some((item) => item.href.includes('today'))).toBe(false);
  });

  it('product lock: Search is not a tab — it lives inside Journey', () => {
    expect(MAIN_NAV_LABELS).not.toContain('검색');
    expect(MAIN_NAV.some((item) => item.href.includes('search'))).toBe(false);
  });

  it('product lock: there is no Journey social / 함께 tab', () => {
    expect(MAIN_NAV_LABELS).not.toContain('함께');
    expect(MAIN_NAV.some((item) => item.href.includes('social'))).toBe(false);
  });

  it('product lock: Community is not an independent tab', () => {
    expect(MAIN_NAV_LABELS).not.toContain('커뮤니티');
    expect(MAIN_NAV.some((item) => item.href.includes('community'))).toBe(false);
  });
});
