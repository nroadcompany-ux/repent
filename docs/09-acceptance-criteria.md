---
status: LOCKED_WITH_HOLD
version: 1.0.0
updated: 2026-09-06
owner_approval: 2026-09-06
---

# 09 Acceptance Criteria

> Canonical Product/UX Acceptance Criteria. Legal/Production 세부 HOLD는 별도 Gate에서 검증한다.

## AC-01 Main Navigation
- Bottom Nav는 `여정 | 기도 | 회개 | 약속 | 고백`이다.
- Action은 독립 Bottom Tab으로 노출하지 않는다.

## AC-02 Journey
- TODAY에 `나의 말씀 / 이어갈 기도 / 오늘의 약속·실행 / 성경읽기` 4-slot을 제공한다.
- 회개를 Daily 의무 Tile로 고정하지 않는다.
- Journey Graph는 5단계 자기기록이며 신앙 점수로 해석하지 않는다.
- No Input day는 Missing이며 자동 보간하지 않는다.
- Search + Filter는 Journey 내부에 존재한다.
- Calendar에서 Core Record를 날짜 기준으로 재탐색할 수 있다.

## AC-03 Prayer
- `기도 제목 | 기도문` Primary Surface가 존재한다.
- 기도 제목 내부 `나의 기도 | 중보기도` Secondary Segment를 항상 노출한다.
- `기도함 → 기도 제목 → 날짜별 기도 기록` 구조를 유지한다.
- AI는 응답/미응답 또는 하나님의 뜻을 판정하지 않는다.

## AC-04 Repentance
- 한글 Primary Flow: 돌아보기 → 깨닫기 → 돌이킴 약속 → 돌아가기.
- Draft 임시저장 및 이어쓰기가 가능하다.
- Final CTA는 정확히 `회개 기록 마치기`다.
- Progress %, 회개 완료율, 영적 점수를 노출하지 않는다.
- AI는 죄/용서/구원/영적 상태를 판정하지 않는다.

## AC-05 Promise / Action
- 기본 그룹: 나의 삶 / 사람과 관계 / 신앙생활.
- Promise는 1:N Action을 가진다.
- 이행률은 행동 측정치만 의미한다.
- 사용자-facing 완료 상태는 `마무리됨`이다.
- Action 실패를 죄로 자동 연결하지 않는다.
- Retry / Modify / Reschedule / Record Only / Optional Repent를 지원한다.
- Reminder는 Promise/Action 사용자 설정형만 허용한다.

## AC-06 Confession
- Types는 기도 / 고백 / 은혜 / 일상이다.
- MVP에 Photo와 Comment가 포함된다.
- 게시물 Photo는 MVP 최대 1장이다.
- Reaction 3종을 제공한다.
- 1 user : 1 reaction / post이며 변경 가능하다.
- 인기순/TOP/영적 Ranking을 제공하지 않는다.
- Confession에는 AI가 개입하지 않는다.

## AC-07 Profile
- 네이버/구글 Social Login을 지원한다.
- 교회명/교단 입력 Surface가 존재한다.
- 대표 프로필 사진을 지원한다.
- Profile Gallery는 최대 30장이다.
- Profile/Confession Hashtag를 지원한다.
- 교회명/교단은 자동 공개하지 않는다.

## AC-08 ShareCopy / Privacy
- Private Original과 Public ShareCopy는 별도 객체다.
- 공유 전 사용자가 공개할 필드를 선택하고 Preview를 거친다.
- Sensitive field는 Default OFF다.
- Source 수정은 기존 ShareCopy에 자동 반영되지 않는다.
- Source 삭제 시 ShareCopy를 자동 삭제하지 않고 사용자 선택을 제공한다.

## AC-09 Community Safety
- Report / Block / Moderator Hide/Delete 경로가 존재한다.
- 제한 대상 단체 판정은 자동화하지 않고 검토/소명/재검토 Flow를 가진다.
- 영적 판단을 신고 사유로 사용하지 않는다.

## AC-10 AI Memory
- Default OFF다.
- Explicit Opt-in 없이는 과거 Sensitive Record를 AI Context로 사용하지 않는다.
- 사용자는 언제든 중지/해제할 수 있다.
