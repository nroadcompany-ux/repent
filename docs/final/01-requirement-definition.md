---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 01 요구사항 정의서 / Requirement Definition

> 목적: 승인된 REPENT Canonical Planning을 개발 가능한 Requirement 단위로 정규화한다. 신규 Product Meaning을 만들지 않는다.
>
> Canonical Source: `docs/00-product-foundation.md`, `01-ia.md`, `02-user-flow.md`, `04-policy-business-rules.md`, `05-data-model.md`, `06-ai-vgl-guardrail.md`, `07-privacy-security.md`, `08-social-safety.md`, `09-acceptance-criteria.md`, `10-decision-open-hold-register.md`.

## 1. Product Lock / 제품 잠금

- Main Nav: **여정 / 약속 / 실행 / 회개 / 고백**
- Today: 독립 Tab이 아니라 Journey의 현재 좌표
- Journey: 개인 시간축. Social/함께 Journey 금지
- Prayer Response Tracking: 제거
- Action Failure: 죄 판정 금지, Failure Cause Taxonomy 금지
- Repentance: Fixed Step/Progress/Score 금지, Final CTA = **회개 기록 마치기**
- Promise: 1:N Action, 사용자-facing 종료 = **마무리됨**
- Confession: 선택적 공유 Surface, 공감 1종, 인기순/랭킹/영적 비교 금지
- Search: Journey 내부
- Notification: Promise/Action 사용자 설정 Reminder만
- AI Memory: Default OFF / Explicit Opt-in
- Scripture: Book/Chapter/Verse Reference 중심, Full Text License HOLD
- Minor Public Sharing: HOLD / Default Private

## 2. Requirement Matrix / 요구사항 매트릭스

| Trace ID | Domain | Requirement / 요구사항 | Expected Result / 기대결과 | Non-goal / 금지 | Status | Canonical Source |
|---|---|---|---|---|---|---|
| FD-REQ-JNY-001 | Journey | 사용자는 Today/Week/Month/Year/All 범위에서 개인 기록을 시간축으로 조회할 수 있어야 한다. | 삶/신앙 기록의 시간 순 조회 | Faith Score, 영적 단계화 | CURRENT | `00`, `02`, `04`, `09:US-RPT-JNY-001` |
| FD-REQ-JNY-002 | Journey | Turning Point는 User Confirm으로만 확정된다. AI는 후보만 제안할 수 있다. | 사용자가 중요한 시점을 직접 확정 | AI 자동 확정 | CURRENT | `04`, `05`, `09:US-RPT-JNY-002` |
| FD-REQ-PRY-001 | Prayer | 사용자는 Prayer를 기록하고 Prayer Only로 종료할 수 있다. | 다른 단계 강제 없이 기도 기록 저장 | Answered/Pending/Response Rate | CURRENT | `00`, `02`, `04`, `09:US-RPT-PRY-001/002` |
| FD-REQ-PRM-001 | Promise | 사용자는 Promise를 기록하고 하나의 Promise에 여러 Action을 연결할 수 있다. | 1:N Action 연결, 사용자 종료 `마무리됨` | Streak, Miss=Sin | CURRENT | `00`, `04`, `05`, `09:US-RPT-PRM-001` |
| FD-REQ-ACT-001 | Action | Action이 계획과 달랐을 때 Follow-up Choice 5종 중 하나를 선택할 수 있다. | Retry/Modify/Reschedule/Record Only/Optional Repent | Failure Cause Taxonomy, Auto Repent, Failure=Sin | CURRENT | `00`, `02`, `04`, `09:US-RPT-ACT-001/002` |
| FD-REQ-RPN-001 | Repentance | 회개 기록은 Optional Progressive Flow로 진행되며 사용자가 `회개 기록 마치기`로 종료한다. | 하나님 앞에서 돌아보고 고백한 기록 저장 | 고정 10-Step, 진행률, 점수, 충분성/진정성 판정 | CURRENT | `00`, `02`, `04`, `09:US-RPT-RPN-001/002` |
| FD-REQ-CNF-001 | Confession | Direct Confession 또는 Private Source의 ShareCopy를 Preview 후 선택적으로 공유할 수 있다. | Privacy 3옵션으로 게시 | Anonymous 게시, 자동 공유 | CURRENT | `02`, `05`, `07`, `09:US-RPT-CNF-001/SHR-001` |
| FD-REQ-COM-001 | Community Surface | 공유 콘텐츠에는 공감 1종과 신고 사유 4종을 제공한다. | 최소 Social Interaction/Report | 인기순, 랭킹, Faith Signal, Spiritual Judgment 신고사유 | CURRENT | `01`, `08`, `09:US-RPT-MOD-002/003` |
| FD-REQ-COM-002 | Moderation | Moderation 결과는 콘텐츠/행동 기준으로만 표현한다. | 운영 조치와 영적 판정 분리 | 회개/죄/용서/구원 상태 판정 | CURRENT POLICY / DETAIL CANDIDATE | `06`, `08`, `09:AC-G07-01~05` |
| FD-REQ-SCR-001 | Scripture | Book/Chapter/Verse Reference 중심의 Reflection Reference로 제공한다. | 참고용 말씀 후보 확인 | 확정 계시/예언, License 전 Full Text | CURRENT / FULL TEXT HOLD | `00`, `06`, `09:US-RPT-SCR-001/002` |
| FD-REQ-AI-001 | AI/VGL | AI는 Reflection Assist만 수행하며 Spiritual Authority를 행사하지 않는다. | 사용자의 판단을 돕는 안전한 응답 | God's Voice, Prophet, Pastor Substitute, Spiritual Judge, Final Interpreter | CURRENT | `00`, `06`, `09` |
| FD-REQ-ONB-001 | Onboarding | 가입 후 3개 진입 질문을 선택적으로 제공하고 첫 기록으로 연결한다. | 부담 없는 첫 기록 진입 | 5개 메뉴 전체 Tutorial 강제 | CURRENT | `00`, `02`, `04`, `09:US-RPT-ONB-001` |
| FD-REQ-SEA-001 | Search | Search/Filter는 Journey 내부에서 제공한다. | 기간/종류/키워드/LifeEvent/Season/StoryArc 검색 | 독립 Bottom Tab | CURRENT | `00`, `01`, `09:US-RPT-SEA-001` |
| FD-REQ-NOT-001 | Notification | Promise/Action 사용자 설정 Reminder만 제공한다. | 사용자가 설정한 실행 알림 | Prayer/Repentance Nudge, 죄책감/영적 압박 문구 | CURRENT | `00`, `04`, `09:US-RPT-NOT-001` |
| FD-REQ-ACC-001 | Account | 탈퇴 시 Private Source 삭제 절차와 ShareCopy 유지/삭제 선택을 제공한다. | 사용자 의사에 따른 정리 | ShareCopy 자동 일괄 삭제/유지 | CURRENT | `05`, `07`, `09:US-RPT-ACC-001` |
| FD-REQ-EXP-001 | Export | 사용자는 자신의 기록을 Export할 수 있어야 한다. | 기록 이동 가능 | MVP 우선 구현 보장 | CURRENT / LOW PRIORITY | `00`, `09:US-RPT-ACC-002` |
| FD-REQ-MEM-001 | AI Memory | AI Memory는 Default OFF이며 Explicit Opt-in 후에만 사용한다. | 사용자 통제 하 기억 사용/중지/삭제 | 무동의 자동 Recall | CURRENT / LONGITUDINAL DETAIL HOLD | `00`, `07`, `09:US-RPT-MEM-001` |
| FD-REQ-DEL-001 | Sharing Delete | Source 삭제 시 기존 ShareCopy 목록을 제시하고 함께 삭제할지 사용자가 선택한다. | Source/ShareCopy 독립성 유지 | 자동 cascade delete/keep | CURRENT | `05`, `09:US-RPT-SHR-002` |

## 3. Cross-cutting Non-functional Requirements / 공통 비기능 요구사항

| Trace ID | Requirement | Status | Source |
|---|---|---|---|
| FD-NFR-TH-001 | Faith/Repentance/Prayer/Spiritual Maturity Score를 생성·표시하지 않는다. | CURRENT | `04`, `06`, `08` |
| FD-NFR-TH-002 | 구원/용서/죄의 최종 상태를 AI/System/Moderator가 판정하지 않는다. | CURRENT | `06`, `08`, `09:AC-G07-01~05` |
| FD-NFR-EMP-001 | Empty/Error는 기술적 상태로만 표현하며 영적 의미를 부여하지 않는다. | CURRENT | `04` |
| FD-NFR-PRI-001 | Private Source는 Owner 중심 권한을 유지하고 Moderator는 공유된 Confession/ShareCopy만 검토한다. | CURRENT | `05`, `07`, `08` |
| FD-NFR-DAT-001 | AI는 Record Owner가 될 수 없다. | CURRENT | `05` |

## 4. OPEN / HOLD

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
- Scripture Full Text License / Retrieval
- OpenAI Runtime Binding / Official Model Run
- RS-AR05-D3 / RS-G10-D1

> HOLD/CANDIDATE는 Missing Product Planning으로 재분류하지 않는다.

## 5. Trace Forward

`FD-REQ-*` → `02 Service Architecture` → `03 Feature Definition` → `04 Story/Task/AC`.

New Product Meaning Created = 0  
New Theology Rule Created = 0
