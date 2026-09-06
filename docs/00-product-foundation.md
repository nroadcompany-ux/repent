---
status: LOCKED
version: 1.0.0
updated: 2026-09-06
owner_approval: 2026-09-06
---

# 00 Product Foundation

> Owner Approved / Planning Locked. 본 문서는 RETURN의 Canonical Product Foundation이다.

## Product Core

RETURN은 개인의 신앙생활을 `기도 → 회개 → 약속 → 실행 → 여정`으로 이어 기록하고 다시 돌아보게 하는 장기 Faith Product다. 이 흐름은 강제 순서가 아니며 각 Domain으로 직접 진입할 수 있다.

## Main Navigation (Owner Lock)

여정 | 기도 | 회개 | 약속 | 고백

- Action은 독립 Bottom Tab이 아니다.
- Action은 Promise 내부 실행 기록으로 유지한다.
- Search는 Journey 내부에만 둔다.

## Authentication / Onboarding

- Social Login: 네이버 / 구글
- 교회명 입력
- 교단 입력
- 첫 사용 시작 질문 3개:
  1. 오늘 하나님께 듣고 싶은 말씀이 있나요? 또 하고 싶은 말은요?
  2. 하나님께 마음을 드리고 있나요? 어떤 동행을 꿈꾸세요?
  3. 하나님과 약속한 것이 있나요? 그 약속은 잘 지켜지고 있나요?

## Core Domain Meaning

- Journey: 장기 기록의 Aggregation / Navigation 축
- Prayer: 기도 제목·기도문·날짜별 기도 기록
- Repentance: 사용자 주도 성찰과 돌이킴 기록
- Promise: 사용자가 스스로 정한 약속과 실행 관리
- Action: Promise의 구체적 실행 기록
- Confession: 사용자가 선택적으로 공개하는 Community Surface

## Theological Guardrail

AI/시스템은 God, God's Voice, Prophet, Pastor Substitute, Spiritual Judge가 아니다.

다음 상태를 사용자 영적 판정 Enum으로 사용하지 않는다:
`ANSWERED / FORGIVEN / SAVED / REPENTED / FAITHFUL / SPIRITUALLY_FAILED`

- 회개·용서·구원·믿음 상태를 시스템이 판정하지 않는다.
- Action 실패를 죄로 자동 연결하지 않는다.
- Promise 이행률은 행동 측정치이며 신앙 점수가 아니다.
- Community를 영적 경쟁 구조로 만들지 않는다.

## Non-blocking HOLD

- Scripture Full Text License
- 유명 목회자 설교 / YouTube Content Layer
- Church Verification 상세 방식
- Voice Premium 상세 정책
- 일부 Legal/Privacy 세부정책
