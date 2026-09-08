/**
 * Full menu (Issue #21 §E).
 *
 * Every entry is a route that actually exists — the map was validated against
 * the route tree in the Issue #20 reply and is checked again by a test that
 * resolves each href to a page file. Nothing here may be added because a
 * design shows it; if the route does not exist, the item does not exist.
 *
 * Deliberately absent:
 *   · /mypage — no such route. 내 정보 is /settings.
 *   · 데이터 내보내기 / 계정 탈퇴 / 알림 — no backend (Issue #20 §D backlog).
 *   · 이용약관 / 개인정보 — no standalone route; consent lives in onboarding.
 * Showing any of those, even disabled, would promise something that does not
 * exist yet.
 */

export type MenuItem = { label: string; href: string; caption?: string }
export type MenuSection = { title: string; caption: string; items: readonly MenuItem[] }

export const MENU_SECTIONS: readonly MenuSection[] = [
  {
    title: '여정',
    caption: '기록을 모아 보고 다시 찾아가기',
    items: [
      { label: '그래프', href: '/journey/graph', caption: '흐름과 삶의 사건' },
      { label: '시대별 기록', href: '/journey/graph#history', caption: '나이대별로 모아 보기' },
      { label: '삶의 여정', href: '/journey/timeline', caption: '모든 기록을 시간순으로' },
      { label: '달력', href: '/journey/calendar', caption: '날짜별 기록' },
      { label: '검색', href: '/journey/search', caption: '말씀·기도·회개·약속 찾기' },
      { label: '나의 말씀', href: '/journey/scripture', caption: '간직한 구절' },
      { label: '성경읽기', href: '/journey/bible', caption: '읽은 장 기록' },
    ],
  },
  {
    title: '기도',
    caption: '기도제목과 기도문',
    items: [
      { label: '기도 홈', href: '/prayer' },
      { label: '기도함', href: '/prayer/folders', caption: '주제별로 모아두기' },
      { label: '기도제목 쓰기', href: '/prayer/topic/new' },
      { label: '기도문 쓰기', href: '/prayer/text/new' },
    ],
  },
  {
    title: '회개',
    caption: '돌아보고 기록하기',
    items: [
      { label: '회개 홈', href: '/repentance' },
      { label: '회개하기', href: '/repentance/write', caption: '있었던 일부터 적어보기' },
    ],
  },
  {
    title: '약속',
    caption: '지키기로 한 것들',
    items: [
      { label: '약속 홈', href: '/promise' },
      { label: '새 약속', href: '/promise/new' },
      { label: '약속 그룹 이름', href: '/promise/groups', caption: '내가 쓰는 말로 바꾸기' },
    ],
  },
  {
    title: '고백',
    caption: '원할 때만 나누기',
    items: [
      { label: '고백 홈', href: '/confession' },
      { label: '나누기', href: '/confession/write' },
    ],
  },
  {
    title: '내 정보',
    caption: '프로필과 공개 범위',
    items: [
      { label: '프로필 · 설정', href: '/settings', caption: '이름·생년월일·교회·공개범위' },
      { label: '프로필 사진', href: '/settings/profile-media', caption: '대표 사진과 갤러리' },
      { label: '차단 관리', href: '/settings/blocked' },
    ],
  },
] as const

/** POST-only, so it is a form button rather than a link. */
export const SIGN_OUT_ACTION = '/auth/signout'
