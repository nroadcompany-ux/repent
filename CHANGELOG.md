# CHANGELOG

## Figma Visual v1.0 Reconstruction — Legacy Purge + 23 Screens (2026-09-05)

- Owner 지시로 REPENT Figma 기존 페이지/화면 전부 삭제.
- 기존 `REPENT v0.5 — 5-Tab IA` 삭제 완료.
- 새 단일 페이지 생성: `REPENT Final Lock — Visual v1.0` / Page Node `44:2`.
- Final Documentation의 `docs/final/08-screen-specification.md`만 기준으로 23개 Screen ID 전체 시각화.
- 생성 화면군: Journey/Turning Point/Search, Onboarding/Prayer, Promise/Action/Action Follow-up, Repentance/Finish, Confession/Privacy Preview, ShareCopy 3종, Scripture Reference, Community/Report/Moderation Candidate, Reminder, Account Delete, Export, AI Memory.
- 기존 Figma/Prototype을 Product Planning Source로 사용하지 않음.
- 다음 Product Lock을 Visual에 반영:
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
- Figma Visual v1.0 상태 = **BUILT 23/23 / VISUAL REVIEW NEXT**.
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## Final Documentation Lock — 01~10 (2026-09-05)

- `docs/final/01~10` Final Development Documentation 전 10종 작성 및 Remote 존재 검증 완료.
- Final Documentation 구성:
  1. Requirement Definition / 요구사항 정의서
  2. Service Architecture / 서비스 설계서
  3. Feature Definition / 기능 정의서
  4. User Story / Task / Acceptance Criteria / 사용자 스토리·태스크·인수기준
  5. IA / Menu Architecture / 정보구조·메뉴구조
  6. Policy / Business Rules / 정책·비즈니스 규칙
  7. Service Flow / Process / 사용자·서비스 흐름
  8. Screen Specification / 화면 명세
  9. Data / State / Permission / 데이터·상태·권한
  10. WBS / Development Priority / Handoff / 개발 우선순위·실행 인계
- Screen Specification은 Product Documentation 01~07만 근거로 작성. Figma/Legacy Prototype 역설계 없음.
- Final Cross Trace Audit:
  `Requirement → Service → Feature → Story → Task → AC → IA → Policy → Flow → Screen → Data → State → Permission → WBS → Handoff`
- CURRENT Scope Trace Break = 0.
- Product Meaning Conflict = 0.
- Current non-HOLD Blocking = 0.
- Owner Decision Required for Current Scope = 0.
- Exact Lifecycle Enum Naming은 기존 Owner Decision대로 CANDIDATE/OPEN 유지, 임의 확정하지 않음.
- Moderation Workflow Detail / Moderator Action Detail은 CANDIDATE 유지.
- Minor Public Sharing / Longitudinal Consent / Scripture Full Text License·Retrieval / OpenAI Runtime Binding / Official Model Run / RS-AR05-D3 / RS-G10-D1은 HOLD 유지.
- Figma = Final Documentation Lock 이후 NEXT PHASE.
- Prototype = LEGACY / NON-CANONICAL.
- `main` merge 수행하지 않음. Working Branch = `claude/new-session-gwiqkv`.
- `docs/REPENT-MASTER-HANDOFF.md`를 Final Documentation Lock 상태의 Current Entry Point로 갱신.
- Final Lock 직전 전체 Handoff/CHANGELOG 원문은 아래 History Snapshot에 byte-identical Blob으로 보존:
  - `docs/history/REPENT-MASTER-HANDOFF-pre-final-lock-2026-09-05.md`
  - `docs/history/CHANGELOG-pre-final-lock-2026-09-05.md`
- New Product Meaning Created = 0
- New Theology Rule Created = 0

## History / 이전 전체 변경 이력

Final Documentation Lock 이전의 전체 CHANGELOG는 다음 파일에 원문 그대로 보존한다:

`docs/history/CHANGELOG-pre-final-lock-2026-09-05.md`

Git commit history 역시 기존 모든 이력을 유지한다.
