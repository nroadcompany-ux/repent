---
status: FINAL DOCUMENTATION LOCKED
version: 1.1
updated: 2026-09-05
owner: REPENT Final Documentation PM
---

# REPENT — MASTER HANDOFF

> **Current Entry Point / 현재 진입점**. 이 문서는 REPENT의 최신 PM 상태만 요약한다. Final Documentation Lock 이전의 전체 Handoff History는 `docs/history/REPENT-MASTER-HANDOFF-pre-final-lock-2026-09-05.md`에 원문 그대로 보존한다. 상세 변경 이력은 `CHANGELOG.md` 및 `docs/history/CHANGELOG-pre-final-lock-2026-09-05.md`를 참조한다.

## 1. Evidence Priority / 근거 우선순위

1. 실제 GitHub Remote
2. `docs/final/01~10` Final Documentation
3. `docs/00~10` Current Canonical Planning
4. 최신 Owner/PM Decision
5. AI/VGL Current Policy
6. CHANGELOG / History

Figma 및 Legacy Prototype은 Product Planning Source가 아니다.

## 2. Current Status / 현재 상태

| 항목 | 현재 상태 |
|---|---|
| Planning Gate | **B — PM APPROVED** |
| Missing Product Planning | **0** |
| Unresolved Owner Decision | **0** |
| Product Meaning Conflict | **0** |
| Trace Break | **0** |
| Current non-HOLD Blocking | **0** |
| Final 10 Documents | **FINAL DOCUMENTATION LOCKED** |
| Final Documentation Location | `docs/final/01~10` |
| Figma | **NEXT PHASE / NON-CANONICAL FOR PLANNING** |
| Prototype | **LEGACY / NON-CANONICAL** |
| main merge | **NOT PERFORMED / 금지 유지** |

## 3. Final 10 Documents / 최종 개발 문서 10종

| No | Document | Status |
|---|---|---|
| 01 | `docs/final/01-requirement-definition.md` — 요구사항 정의서 / Requirement Definition | LOCKED |
| 02 | `docs/final/02-service-architecture.md` — 서비스 설계서 / Service Architecture | LOCKED |
| 03 | `docs/final/03-feature-definition.md` — 기능 정의서 / Feature Definition | LOCKED |
| 04 | `docs/final/04-story-task-ac.md` — 사용자 스토리·태스크·인수기준 / User Story·Task·AC | LOCKED |
| 05 | `docs/final/05-ia-menu-architecture.md` — 정보구조·메뉴구조 / IA·Menu Architecture | LOCKED |
| 06 | `docs/final/06-policy-business-rules.md` — 정책·비즈니스 규칙 / Policy·Business Rules | LOCKED |
| 07 | `docs/final/07-service-flow-process.md` — 사용자·서비스 흐름 / Service Flow·Process | LOCKED |
| 08 | `docs/final/08-screen-specification.md` — 화면 명세 / Screen Specification | LOCKED |
| 09 | `docs/final/09-data-state-permission.md` — 데이터·상태·권한 / Data·State·Permission | LOCKED |
| 10 | `docs/final/10-wbs-development-handoff.md` — WBS·개발 우선순위·실행 인계 | LOCKED |

## 4. Final Trace Audit / 최종 추적 감사

Audit Chain:

`Requirement → Service → Feature → Story → Task → AC → IA → Policy → Flow → Screen → Data → State → Permission → WBS → Handoff`

CURRENT Scope 결과:

- ORPHAN_REQUIREMENT = 0
- FEATURE_WITHOUT_REQUIREMENT = 0
- STORY_WITHOUT_FEATURE = 0
- TASK_WITHOUT_AC = 0
- AC_WITHOUT_POLICY = 0
- FLOW_WITHOUT_STORY = 0
- SCREEN_WITHOUT_STORY = 0
- DATA_WITHOUT_OWNER = 0
- STATE_WITH_SPIRITUAL_JUDGMENT = 0
- PERMISSION_LEAK = 0
- POLICY_WITHOUT_AC = 0

**Final Verdict = TRACE PASS / BREAK 0**

## 5. Product Lock / 임의 변경 금지

- Main Nav: 여정 / 약속 / 실행 / 회개 / 고백
- Today: 독립 탭 아님, Journey의 현재 좌표
- Journey: 개인 시간축, Social/함께 없음
- Prayer Response Tracking: 제거
- Action Failure: 죄 아님, Failure Cause Taxonomy 금지
- Follow-up: Retry / Modify / Reschedule / Record Only / Optional Repent
- Repentance: Fixed Step/Progress/Score 금지, Final CTA=`회개 기록 마치기`
- Promise: 1:N Action, 사용자-facing 종료=`마무리됨`
- Confession: Privacy 3옵션, 공감 1종, 인기순/랭킹/영적 비교 금지
- Search: Journey 내부
- Notification: Promise/Action 사용자 설정 Reminder만
- AI Memory: Default OFF / Explicit Opt-in
- Scripture: Book/Chapter/Verse Reference 중심, Full Text License HOLD
- Minor Public Sharing: HOLD / Default Private

## 6. AI / Theology Lock / AI·신학 잠금

AI는 God / God's Voice / Prophet / Pastor Substitute / Spiritual Judge / Final Interpreter of Sin / Final Interpreter of Scripture가 아니다.

금지:
- AI Revelation / Prophecy
- Faith Score
- Repentance Score
- Prayer Response Rate
- Spiritual Maturity Score
- 구원/용서 상태 판정
- 회개 진정성/충분성 판정

Canonical 65는 수정하지 않는다.

## 7. OPEN / CANDIDATE / HOLD

### Non-blocking OPEN / CANDIDATE
- Moderation Workflow Detail
- Moderator Action Detail
- Exact Lifecycle Enum Naming
- Export 구현 상세
- CRUD 세부 컬럼
- Recovery 상세
- Scripture dedicated Flow 필요 여부

### HOLD
- Minor Public Sharing
- Longitudinal Consent 상세
- Scripture Full Text License
- Scripture Retrieval
- OpenAI Runtime Binding
- Official Model Run
- RS-AR05-D3
- RS-G10-D1

위 OPEN/HOLD는 Missing Product Planning 또는 Final Documentation Trace Break로 계산하지 않는다.

## 8. Screen / Visual Rule / 화면·시각화 규칙

순서:

`Product Documentation LOCK → Screen Specification LOCK → Visual Design / Figma`

따라서 이제 Figma는 `docs/final/08-screen-specification.md`를 기준으로 재설계할 수 있다. 기존 Figma/Prototype을 보며 Product Meaning을 역설계하지 않는다.

## 9. Development Start Rule / 개발 착수 규칙

개발팀은 `docs/final/10-wbs-development-handoff.md`의 WBS와 Gate를 따른다.

- Current non-HOLD 범위: Development Documentation 기준 **READY**
- Moderation Detail: CANDIDATE 범위 임의 구현 금지
- Minor Public Sharing / Consent / Scripture Full Text / Runtime Binding: HOLD 침범 금지
- Production Release: 별도 Gate이며 Final Documentation Lock과 동일하지 않음

## 10. Branch / Reality

| 항목 | 값 |
|---|---|
| Repository | `nroadcompany-ux/repent` |
| Working Branch | `claude/new-session-gwiqkv` |
| Final Docs 직전 Remote SHA | `d3b62f47eee7f9cadacf98f6ce47258b0da08d1e` |
| main merge | 수행하지 않음 |
| History Snapshot | `docs/history/REPENT-MASTER-HANDOFF-pre-final-lock-2026-09-05.md` |

## 11. Next Action / 다음 작업

**NEXT = Visual Design / Figma Reconstruction**

1. `docs/final/08-screen-specification.md` 기준으로 Figma 신규/재설계
2. 23개 Screen Inventory 중 CURRENT 화면 우선 시각화
3. CANDIDATE/HOLD 화면은 상태를 명시하고 임의 완성 금지
4. Visual Review 후 Implementation Gate 판단
5. 개발 착수 시 `docs/final/10-wbs-development-handoff.md` 기준 Sprint 구성

## 12. Final Lock Declaration / 최종 잠금 선언

**REPENT Final Documentation 01~10 = LOCKED**

- Final 10 Documents 존재 검증: PASS
- Cross Trace: PASS
- Product Meaning Conflict: 0
- Current Scope Blocking: 0
- Owner Decision Required for Current Scope: 0
- Figma Reverse Planning: 0
- New Product Meaning Created: 0
- New Theology Rule Created: 0

이후 Product Meaning 변경이 필요할 경우 기존 문서를 조용히 수정하지 말고 Owner/PM Decision → Trace Impact Audit → 문서 버전 갱신 절차를 거친다.
