---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 02 서비스 설계서 / Service Architecture & Domain Ownership

> 승인된 Domain Boundary와 Cross-cutting Capability를 개발 팀이 구현 경계로 사용할 수 있도록 정규화한다. 신규 Domain을 만들지 않는다.

## 1. Service Boundary / 서비스 경계

### Main Domain

| Domain | Ownership / 소유 경계 | Input | Output | 주요 Trace |
|---|---|---|---|---|
| Journey | 개인 삶/신앙 기록의 시간축 조회 | User-owned records, Time Range, Search/Filter | Timeline/Marker/TurningPoint candidate/confirmed view | FD-REQ-JNY-001/002 |
| Prayer | 하나님께 드리는 개인 기도 기록 | Prayer content | Prayer Record + optional references | FD-REQ-PRY-001 |
| Promise | 사용자 결단 기록 | Promise content, optional source ref | Promise + Action 0..N | FD-REQ-PRM-001 |
| Action | 실제 행동 기록 | Action plan/status | Done 또는 Follow-up Choice | FD-REQ-ACT-001 |
| Repentance | 하나님 앞에서 돌아보고 고백하는 기록 | Reflection/Confession + optional refs | RepentanceRecord | FD-REQ-RPN-001 |
| Confession | 선택적 공유 Surface | Direct content 또는 ShareCopy | Private/Masked/Named published surface | FD-REQ-CNF-001 |

### Cross-cutting Capability

| Capability | Boundary | Status |
|---|---|---|
| ScriptureReference | 참고용 말씀 Reference. Full Text는 License 전 HOLD | CURRENT / FULL TEXT HOLD |
| TurningPoint | User Confirm만 확정. AI는 Candidate 제안 | CURRENT |
| ShareCopy | Private Source의 Snapshot 공유본 | CURRENT |
| Privacy | Visibility 3옵션, Source/ShareCopy 분리 | CURRENT |
| AI/VGL | Reflection Assist / Text Governance | CURRENT |
| Search | Journey 내부 검색/필터 | CURRENT |
| Notification | Promise/Action 사용자 설정 Reminder | CURRENT |
| AI Memory | Default OFF / Explicit Opt-in | CURRENT / LONGITUDINAL DETAIL HOLD |

## 2. Main Navigation Architecture / 주 메뉴 구조

Bottom Navigation:
1. 여정 / Journey
2. 약속 / Promise
3. 실행 / Action
4. 회개 / Repentance
5. 고백 / Confession

Rules:
- Today는 독립 Tab이 아니라 Journey의 현재 좌표다.
- Search는 Journey 내부다.
- Journey에 Social/함께 탭을 만들지 않는다.
- Community는 독립 대형 Domain이 아니라 Confession의 Shared/Public Surface다.

## 3. Ownership Rules / 소유권 규칙

| Actor | Ownership / Permission Boundary |
|---|---|
| Owner(User) | 본인 Record 생성/조회/수정/삭제 |
| Viewer | 공개 범위가 허용된 Confession/ShareCopy Read |
| Moderator | 공유된 Confession/ShareCopy만 운영 검토. Private Prayer/Repentance Source 접근 금지 |
| System | 자동화/표시 처리. Record Owner 아님 |
| AI | Reflection Assist. Record Owner 아님. 무동의 Private Source 자동 열람 금지 |

## 4. Inter-domain Contracts / 도메인 간 계약

### Prayer → Promise/Action
- Prayer는 Optional Promise/Action reference를 가질 수 있다.
- Prayer Only Exit를 항상 허용한다.

### Promise → Action
- Promise 1:N Action.
- Promise Miss ≠ Sin.
- Promise 사용자 종료 문구 = `마무리됨`.

### Action → Repentance
- Optional Repent만 허용.
- Failure가 자동으로 Repentance를 만들지 않는다.
- Failure Cause를 묻거나 분류하지 않는다.

### Repentance → Promise/Action
- Optional 연결.
- Fixed 10-Step/진행률/영적 완료 선언 금지.

### Private Source → ShareCopy → Confession Surface
- Explicit Select → Preview → ShareCopy 생성 → Publish.
- Source Edit/Delete와 ShareCopy의 자동 cascade 금지.
- Source Delete 시 ShareCopy 처리 여부는 User가 선택.

## 5. Governance Boundary / 거버넌스 경계

- AI/System/Moderator는 Spiritual Judge가 아니다.
- Moderation은 Content/Behavior 기준만 사용한다.
- Scripture는 Reflection Reference이며 Revelation/Prophecy Engine이 아니다.
- Faith/Repentance/Prayer Response/Spiritual Maturity Score 금지.
- Empty/Error/Archive는 영적 상태를 의미하지 않는다.

## 6. Candidate / Hold Boundary

CANDIDATE:
- Moderation Workflow Detail
- Moderator Action Detail
- Exact Lifecycle Enum Naming

OPEN (non-blocking):
- Export 구현 상세
- CRUD 세부 컬럼
- Recovery 상세
- Scripture dedicated Flow 필요 여부

HOLD:
- Minor Public Sharing
- Longitudinal Consent 상세
- Scripture Full Text License/Retrieval
- OpenAI Runtime Binding/Official Model Run
- RS-AR05-D3 / RS-G10-D1

## 7. Source Map

- Domain Boundary: `docs/01-ia.md`
- Flow: `docs/02-user-flow.md`
- Policy: `docs/04-policy-business-rules.md`
- Data/Permission: `docs/05-data-model.md`
- AI/VGL: `docs/06-ai-vgl-guardrail.md`
- Privacy: `docs/07-privacy-security.md`
- Social Safety: `docs/08-social-safety.md`
- Story/AC: `docs/09-acceptance-criteria.md`

New Product Meaning Created = 0  
New Theology Rule Created = 0
