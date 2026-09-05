# CHANGELOG

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
- State Coverage를 Screen Spec의 State/Empty/Error/HOLD 열 기준으로 생성:
  - Empty/Error는 기술 상태로만 표현하고 영적 의미 부여 금지.
  - Validation/Success는 기존 Screen Spec 범위에서만 표현.
  - Moderation Workflow/Action Detail = CANDIDATE 유지.
  - Export = OPEN / LOW PRIORITY 유지.
  - Minor Public Sharing / Scripture Full Text·Retrieval / AI Memory Longitudinal Consent = HOLD 유지.
- 금지어 Audit에서 잡힌 `응답됨·응답대기·응답률 상태는 만들지 않습니다`, `진행률은 없습니다`, `실패 원인을 묻거나 분류하지 않습니다` 등은 기능 재도입이 아니라 금지 선언 Copy로 판정.
- Forbidden Legacy Product Meaning Reintroduced = 0.
- Visual QA = PASS.
- Owner Visual Approval = NEXT.
- New Product Meaning Created = 0.
- New Theology Rule Created = 0.

## Figma Visual v1.0 Reconstruction — Legacy Purge + 23 Screens (2026-09-05)

- Owner 지시로 REPENT Figma 기존 페이지/화면 전부 삭제.
- 기존 `REPENT v0.5 — 5-Tab IA` 삭제 완료.
- 새 단일 페이지 생성: `REPENT Final Lock — Visual v1.0` / Page Node `44:2`.
- Final Documentation의 `docs/final/08-screen-specification.md`만 기준으로 23개 Screen ID 전체 시각화.
- 생성 화면군: Journey/Turning Point/Search, Onboarding/Prayer, Promise/Action/Action Follow-up, Repentance/Finish, Confession/Privacy Preview, ShareCopy 3종, Scripture Reference, Community/Report/Moderation Candidate, Reminder, Account Delete, Export, AI Memory.
- 기존 Figma/Prototype을 Product Planning Source로 사용하지 않음.
- Product Lock Visual 반영:
  - Main Nav = 여정/약속/실행/회개/고백
  - Today = Journey 내부 현재 좌표
  - Journey Social/함께 제거
  - Prayer Response Tracking 제거
  - Action Failure Cause Taxonomy 금지 + Retry/Modify/Reschedule/Record Only/Optional Repent
  - Repentance Fixed Step/Progress/Score 제거 + `회개 기록 마치기`
  - Promise 1:N Action + `마무리됨`
  - Confession 4종/Privacy 3옵션/공감 1종/랭킹 금지
  - Search = Journey 내부
  - AI Memory Default OFF
  - Scripture Reference 중심 / Full Text HOLD
- `SCR-RPT-MOD-001`은 CANDIDATE DETAIL로 표시, 상세 Workflow/Action 임의 확정하지 않음.
- `SCR-RPT-EXP-001`은 OPEN / LOW PRIORITY로 표시.
- Minor Public Sharing / Longitudinal Consent / Scripture Full Text·Retrieval 등 HOLD 경계를 유지.
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
- Exact Lifecycle Enum Naming은 기존 Owner Decision대로 CANDIDATE/OPEN 유지, 임의 확정하지 않음.
- Moderation Workflow Detail / Moderator Action Detail은 CANDIDATE 유지.
- Minor Public Sharing / Longitudinal Consent / Scripture Full Text License·Retrieval / OpenAI Runtime Binding / Official Model Run / RS-AR05-D3 / RS-G10-D1은 HOLD 유지.
- Prototype = LEGACY / NON-CANONICAL.
- `main` merge 수행하지 않음. Working Branch = `claude/new-session-gwiqkv`.
- Final Lock 직전 Handoff/CHANGELOG 원문은 `docs/history/`에 보존.
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## History / 이전 전체 변경 이력

Final Documentation Lock 이전의 전체 CHANGELOG는 다음 파일에 원문 그대로 보존한다:

`docs/history/CHANGELOG-pre-final-lock-2026-09-05.md`
