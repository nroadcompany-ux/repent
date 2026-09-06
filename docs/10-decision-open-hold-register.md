---
status: LOCKED_WITH_HOLD
version: 1.0.0
updated: 2026-09-06
owner_approval: 2026-09-06
---

# 10 Decision / Open / Hold Register

> Owner 승인으로 Product/UX Planning Lock은 PASS. 아래 HOLD는 Canonical Product Meaning을 변경하지 않는 비차단 항목이다.

## DECIDED / LOCKED

### Navigation
- 여정 | 기도 | 회개 | 약속 | 고백
- Action은 Promise 내부
- Search는 Journey 내부

### Onboarding
- 네이버 / 구글 Social Login
- 교회명 / 교단 입력
- 첫 시작 질문 3개 유지

### Journey
- TODAY 4-slot: 나의 말씀 / 이어갈 기도 / 오늘의 약속·실행 / 성경읽기
- 5단계 자기기록 Graph
- Calendar
- 나의 말씀
- 성경읽기표
- Search + Filter

### Prayer
- 기도 제목 | 기도문
- 나의 기도 | 중보기도 항상 노출

### Repentance
- 한글 Primary + 4R 내부 Framework
- Draft 임시저장 + 이어쓰기
- Final CTA = 회개 기록 마치기

### Promise / Action
- 기본 그룹: 나의 삶 / 사람과 관계 / 신앙생활
- 1:N Action
- 사용자-facing finish = 마무리됨
- Promise/Action 사용자 설정 Reminder만 허용

### Confession
- Types: 기도 / 고백 / 은혜 / 일상
- Photo + Comment MVP
- 게시물 Photo 최대 1장
- Reaction 3종
- 1인 1Reaction, 변경 가능
- No AI

### Profile / Community
- 대표사진
- Profile Gallery 최대 30장
- Profile/Confession Hashtag
- 교회명/교단 자동 공개 금지
- 제한 대상 단체의 조직적 포교 활동은 운영 검토 후 이용 제한 가능

### AI
- AI Memory Default OFF + Explicit Opt-in
- Confession No AI
- God/God's Voice/Prophet/Pastor Substitute/Spiritual Judge 금지

### ShareCopy
- Private Original과 별도 객체
- Source 삭제 시 ShareCopy 자동삭제 금지 + 사용자 선택

## HOLD / NON-BLOCKING

1. Account Delete 최종 보존기간 / Legal wording
2. Export 구현 우선순위 및 파일형식
3. Minor 공개/보호 세부정책
4. Report Taxonomy 최종 운영 문구
5. 내부 Physical State Enum
6. Scripture Full Text License
7. 유명 목회자 설교 / YouTube Content Layer
8. Church Verification 상세 방식
9. Voice Premium 상세 정책
10. Production Architecture 세부 계약

## Promotion Gate

- Planning Lock: PASS
- Canonical docs 00~10 Promotion: PASS
- Trace / Master Handoff Alignment: NEXT
- Claude Handoff: AFTER TRACE / MASTER ALIGNMENT
- Low-fi HTML: AFTER CLAUDE HANDOFF
- Figma / Production: 후속 Gate
