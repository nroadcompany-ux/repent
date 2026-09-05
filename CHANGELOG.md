# CHANGELOG

## Implementation Sprint 1 — Foundation + Core Domain (2026-09-05)

Final Documentation Lock 및 Owner Visual PASS 이후 첫 실제 코드 구현.
신규 Product 기획 없음. Legacy Prototype을 구현 근거로 사용하지 않음.

### Stack / 기술 선택

- Next.js 15 App Router + TypeScript strict (`noUncheckedIndexedAccess` 포함)
- Vitest (도메인/유스케이스 단위 테스트)
- 외부 Provider/DB 바인딩 없음 — In-memory Mock Adapter만 사용 (Runtime Binding = HOLD 유지)
- 의존성 최소화: Tailwind 등 추가 UI 라이브러리 없이 CSS 변수 기반 토큰

### Architecture

`Domain → Use Case → Repository Interface → Mock Adapter → UI` 단방향 구조.
UI/Adapter가 Domain을 의존하며, Domain은 어떤 외부 계층도 import하지 않는다.

- `src/domain/` — Entity, Value, Product Lock 상수, Actor/Permission, Lifecycle
- `src/usecase/` — Journey / Prayer / Promise / Action / Repentance / Confession / Sharing
- `src/repository/` — Port 인터페이스 (8종)
- `src/adapters/mock/` — In-memory 구현
- `src/app-runtime/` — Composition Root (인증/영속성 교체 지점 단일화)
- `app/` — Next.js Route + Server Action

### Implemented WBS

| WBS | 범위 | 상태 |
|---|---|---|
| WBS-RPT-000 | Foundation — App shell, Main Nav 5, Route, Shared Empty/Error/Loading, Actor/Permission scaffold, 공통 타입, Test 기반 | DONE |
| WBS-RPT-100 | Journey Core — Today/Week/Month/Year/All, Missing Day=No Point, TurningPoint User Confirm, Journey 내부 Search/Filter | DONE |
| WBS-RPT-200 | Prayer Core — Prayer Record, Prayer Only Exit, Optional Reference | DONE |
| WBS-RPT-300 | Promise Core — Create/Read, 1:N Action, Action 0개 허용, `마무리됨` | DONE |
| WBS-RPT-400 | Action Core — Record, Done, Follow-up 5종 | DONE |
| WBS-RPT-500 | Repentance Core — Optional Progressive Flow, `회개 기록 마치기` | DONE |
| WBS-RPT-600 | Confession Core — 4종/Privacy 3옵션/Preview before Publish | DONE |
| WBS-RPT-610 | ShareCopy — Field 선택, Snapshot, Source 독립, 삭제 시 Keep/Delete 선택 | DONE |

### Screen 구현 (docs/final/08 기준)

구현: `SCR-RPT-JNY-001` `SCR-RPT-JNY-002` `SCR-RPT-SEA-001` `SCR-RPT-PRY-001`
`SCR-RPT-PRM-001` `SCR-RPT-ACT-001` `SCR-RPT-ACT-002` `SCR-RPT-RPN-001`
`SCR-RPT-RPN-002` `SCR-RPT-CNF-001` `SCR-RPT-CNF-002` `SCR-RPT-COM-001`(열람 목록)
`SCR-RPT-SHR-001` `SCR-RPT-SHR-002` `SCR-RPT-SHR-003` — 15종.

미구현(이번 Sprint 범위 밖): ONB-001, SCR-001, COM-002, MOD-001, NOT-001,
ACC-001, EXP-001, MEM-001.

Visual은 provisional이다. White / Black / Neutral Gray, 44px Touch Target,
Editorial·Minimal 톤만 유지하고 Pixel-perfect Alignment는 후속 작업으로 남긴다.
신규 Visual Concept 창작 없음.

### Test

- Vitest 72 tests / 10 files — 전부 PASS
- 도메인별 Happy Path / Empty / Error / Permission / Product Lock Negative 커버
- `tests/product-lock/product-lock.regression.test.ts` — `src/`·`app/` 전체를
  주석 제거 후 스캔하여 금지 개념 재유입을 차단

### Product Lock Regression (코드 레벨 고정)

- Journey Social / 함께 = 없음
- Prayer Response Tracking(answered/pending/response rate) = 없음
- Action Failure Cause Taxonomy = 없음 (follow-up에 reason 파라미터 자체가 없음)
- Auto Repent = 없음 (Optional Repent는 진입만 제공)
- Repentance Fixed Step / Progress / Score = 없음, `회개 완료` 문자열 = 없음
- Faith / Repentance / Prayer Response / Spiritual Maturity Score = 없음
- Forbidden State(`ANSWERED` `FORGIVEN` `SAVED` `REPENTED` `FAITHFUL`
  `SPIRITUALLY_FAILED`) = 없음
- Anonymous Confession = 없음
- 인기순 / 랭킹 / Reaction 기반 정렬 = 없음
- Promise Streak = 없음
- Moderator/AI/Viewer의 Private Source 접근 = 차단 (Permission 테스트로 고정)
- AI/System은 Record Owner가 될 수 없음

### OPEN / HOLD 준수

Exact Lifecycle Enum Naming은 확정하지 않았다. 내부 구현 상태는
`src/domain/shared/lifecycle.ts`에 소문자 internal state로만 두고,
Canonical Product Meaning으로 승격하지 않는다는 주석을 명시했다.

CANDIDATE(Moderation Workflow/Action Detail), OPEN(Export 상세, CRUD 컬럼,
Recovery 상세), HOLD(Minor Public Sharing, Longitudinal Consent, Scripture Full
Text·Retrieval, OpenAI Runtime Binding, Official Model Run, RS-AR05-D3,
RS-G10-D1)는 어떤 형태로도 구현하지 않았다.

## Owner Visual PASS / Visual Lock / Implementation Gate GO (2026-09-05)

- Owner가 현재 REPENT White / Black / Neutral Gray Visual을 명시적으로 PASS.
- Figma Visual v1.0을 **VISUAL LOCKED** 상태로 승격.
- Locked Visual Language:
  - Pure White Background
  - Black / Near Black Primary Text & CTA
  - Neutral Gray Secondary Text
  - Light Gray Border / Divider
  - Warm Ivory / Navy Accent 미사용
  - Editorial / Minimal / Quiet / Serious
- Figma Coverage 유지: Base 23 / State Variant 49 / Total 72.
- Screen Spec ↔ Figma Audit 유지: Missing 0 / Extra 0 / Duplicate 0.
- Layout/Accessibility QA: Overflow 0 / Small Touch Target 0 / Dark-on-Dark Center 0.
- Product Lock Violation = 0.
- Implementation Gate = **GO — CURRENT NON-HOLD SCOPE**.
- GO WBS:
  - WBS-RPT-000 Foundation
  - WBS-RPT-100 Journey Core
  - WBS-RPT-200 Prayer Core
  - WBS-RPT-300 Promise Core
  - WBS-RPT-400 Action Core
  - WBS-RPT-500 Repentance Core
  - WBS-RPT-600 Confession Core
  - WBS-RPT-610 ShareCopy
- Dependency-safe 병렬 개발 허용.
- 개발 우선순위: Foundation → Domain Logic/State/Permission/Test → Functional UI Binding → Pixel-perfect Visual Alignment.
- Figma는 Visual 구현 기준으로 사용 가능하지만 Product Meaning Source는 `docs/final/01~10`이 우선.
- Moderation Detail / Exact Lifecycle Enum / Export 상세 등 CANDIDATE/OPEN은 임의 구현 금지.
- Minor Public Sharing / Longitudinal Consent / Scripture Full Text·Retrieval / OpenAI Runtime Binding / Official Model Run / RS-AR05-D3 / RS-G10-D1 HOLD 유지.
- main merge 수행하지 않음.
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## Visual Concept Restore — White / Black / Neutral Gray (2026-09-05)

- Owner 확인: 기존 REPENT Visual Concept은 White Background + Black/Near-Black + Neutral Gray 기반 Minimal UI.
- PM이 임의 적용했던 Warm Ivory / Navy Accent 컨셉은 폐기.
- Figma Current Page `REPENT Final Lock — Visual v1.0`의 72개 Frame 전체를 기존 White/Black/Neutral Gray 컨셉으로 일괄 복원.
- Product Structure / Screen ID / State Coverage는 변경하지 않음: Base 23 + State Variant 49 = Total 72.
- Visual Correction 결과:
  - Background = Pure White
  - Primary Text / Primary CTA = Black / Near Black
  - Secondary Text = Neutral Gray
  - Border / Divider = Light Gray
  - Warm Ivory / Navy Accent 제거
  - 과도한 Color Accent 금지
- Accessibility/UX 보정 지속:
  - Interactive Chip/Segment 37개에 최소 44px Invisible Touch Target 적용.
  - 복원 과정의 실제 Dark-on-Dark Label Contrast 6건 수정.
- Final Automated QA:
  - Overflow = 0
  - Small Touch Target = 0
  - Dark-on-Dark Center Contrast = 0
  - Forbidden Product Lock Hit = 0
  - Journey Social `함께` 재유입 = 0
- Screen Spec ↔ Figma Trace 유지: Missing 0 / Extra 0 / Duplicate 0.
- Visual QA = PASS.
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## Figma Visual QA — 23 Base + 49 State Variants (2026-09-05)

- `docs/final/08-screen-specification.md`의 23개 Screen ID를 Figma Current Page와 1:1 대조.
- Base Screen: 23/23.
- State Variant: 49.
- Total Visual Frame: 72.
- Trace Audit: Missing 0 / Extra 0 / Duplicate Base ID 0.
- P0 UX Review/Correction 대상:
  - Journey: Today=Journey 현재 좌표 재명시.
  - Action Follow-up: Failure Cause 질문/분류 금지 재명시, 5 Follow-up 유지.
  - Repentance: Fixed Step/Progress 없이 Optional Scripture/Promise/Action 연결을 분리 표시.
  - Confession Privacy: Preview 확인 후 Publish 구조 강조.
  - ShareCopy: 선택 Field만 공유 + Snapshot/Source 독립성 강조.
- State Coverage를 Screen Spec의 State/Empty/Error/HOLD 열 기준으로 생성.
- Forbidden Legacy Product Meaning Reintroduced = 0.
- Visual QA = PASS.
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## Figma Visual v1.0 Reconstruction — Legacy Purge + 23 Screens (2026-09-05)

- Owner 지시로 REPENT Figma 기존 페이지/화면 전부 삭제.
- 기존 `REPENT v0.5 — 5-Tab IA` 삭제 완료.
- 새 단일 페이지 생성: `REPENT Final Lock — Visual v1.0` / Page Node `44:2`.
- Final Documentation의 `docs/final/08-screen-specification.md`만 기준으로 23개 Screen ID 전체 시각화.
- 기존 Figma/Prototype을 Product Planning Source로 사용하지 않음.
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## Final Documentation Lock — 01~10 (2026-09-05)

- `docs/final/01~10` Final Development Documentation 전 10종 작성 및 Remote 존재 검증 완료.
- Final Cross Trace Audit:
  `Requirement → Service → Feature → Story → Task → AC → IA → Policy → Flow → Screen → Data → State → Permission → WBS → Handoff`
- CURRENT Scope Trace Break = 0.
- Product Meaning Conflict = 0.
- Current non-HOLD Blocking = 0.
- Owner Decision Required for Current Scope = 0.
- CANDIDATE/OPEN/HOLD 상태 유지.
- Prototype = LEGACY / NON-CANONICAL.
- `main` merge 수행하지 않음. Working Branch = `claude/new-session-gwiqkv`.
- Final Lock 직전 Handoff/CHANGELOG 원문은 `docs/history/`에 보존.
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## History / 이전 전체 변경 이력

Final Documentation Lock 이전의 전체 CHANGELOG는 다음 파일에 원문 그대로 보존한다:

`docs/history/CHANGELOG-pre-final-lock-2026-09-05.md`
