---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 09 데이터·상태·권한 / Data, State & Permission

> 목적: 승인된 Canonical Data Model/Permission Boundary를 개발 구현 단위로 정규화한다. Exact Lifecycle Enum Naming은 기존 Owner 결정대로 CANDIDATE/OPEN을 유지하며 임의 확정하지 않는다.

## 1. Core Entity

| Entity | Owner | Default Visibility | Main Relations | Status |
|---|---|---|---|---|
| User | 본인 | Private | all owned records | CURRENT |
| LifeEvent | User | Private | Season/StoryArc reference | CURRENT |
| Season | User | Private | 기간 중첩 허용 | CURRENT |
| StoryArc | User | Private | 여러 record reference, 원본 복제 없음 | CURRENT |
| TurningPoint | User Confirm | Private | Journey coordinate | CURRENT |
| Prayer | User | Private | optional Reflection/Scripture/Promise/Action | CURRENT |
| Promise | User | Private | Action 1:N | CURRENT |
| Action | User | Private | belongs/links to Promise context | CURRENT |
| RepentanceRecord | User | Private | optional Scripture/Promise/Action | CURRENT |
| Confession | User | 3 Privacy options | Direct=Live Reference | CURRENT |
| ShareCopy | User | 3 Privacy options | Snapshot + Source Reference | CURRENT |
| ScriptureReference | System presents / corpus governed | Reference-readable | Book/Chapter/Verse | CURRENT / FULL TEXT HOLD |

## 2. Relation Rules

- Promise 1:N Action.
- Prayer는 Optional Reflection/Scripture/Promise/Action Reference 가능.
- RepentanceRecord는 Optional Scripture/Promise/Action Reference 가능.
- StoryArc는 여러 Record를 Reference로 연결하며 원본을 복제하지 않는다.
- TurningPoint 확정 Owner는 User. AI는 Candidate 제안만 가능.
- ShareCopy는 Snapshot이며 Source Edit/Delete와 자동 동기화하지 않는다.
- Source Delete 시 ShareCopy Keep/Delete 여부를 User가 선택한다.
- AI는 어떤 Entity의 Record Owner도 될 수 없다.

## 3. CRUD / Visibility Matrix

| Entity | Create | Read | Update | Delete | Visibility Rule | Notes |
|---|---|---|---|---|---|---|
| User | Owner/System signup | Owner | Owner | Owner request | Private | legal/operational log 분리 |
| LifeEvent | Owner | Owner | Owner | Owner | Private | reference only |
| Season | Owner | Owner | Owner | Owner | Private | overlap allowed |
| StoryArc | Owner | Owner | Owner | Owner | Private | record references |
| TurningPoint | Owner Confirm | Owner | Owner | Owner | Private | AI create/confirm 금지 |
| Prayer | Owner | Owner | Owner | Owner | Private | Prayer Only 유지 |
| Promise | Owner | Owner | Owner | Owner | Private | 1:N Action |
| Action | Owner | Owner | Owner | Owner | Private | Failure≠Sin |
| RepentanceRecord | Owner | Owner | Owner | Owner | Private | spiritual completion state 금지 |
| Confession | Owner | Owner + permitted Viewer | Owner | Owner | 나만/이름가림/이름공개 | Anonymous 금지 |
| ShareCopy | Owner after Preview | Owner + permitted Viewer | Update 없음(Snapshot) | Owner | selected privacy | Source와 독립 |
| ScriptureReference | System/reference layer | User | governed source only | governed source only | reference readable | Full Text License HOLD |

## 4. Actor / Permission Boundary

| Actor | Allowed | Forbidden |
|---|---|---|
| Owner | 본인 Record CRUD, Share/Preview, opt-in 설정 | 다른 User Private Source 접근 |
| Viewer | 공개범위가 허용된 Confession/ShareCopy Read, 공감/신고 | Private Source Read |
| Moderator | 공유된 Confession/ShareCopy 운영 검토 | Private Prayer/RepentanceRecord Source 접근, Spiritual Judgment |
| System | 자동화/표시/라우팅 | Record Owner 역할, 영적 상태 판정 |
| AI | Reflection Assist, TurningPoint 후보, Scripture 후보 | Record Owner, Private Source 무동의 자동 열람, God's Voice/Prophet/Pastor Substitute/Spiritual Judge |

## 5. State Model — Product Meaning

> 아래는 필요한 시스템 상태의 의미를 정규화한 것이다. 정확한 Enum 문자열은 CANDIDATE/OPEN이며 이 문서에서 임의 Lock하지 않는다.

| Entity | Required State Meaning | Existing Candidate Enum | User-facing Lock | Exact Enum Status |
|---|---|---|---|---|
| Prayer | 작성 중 / 기록됨 / 보관됨 | DRAFT / RECORDED / ARCHIVED | 영적 응답 상태 없음 | CANDIDATE |
| RepentanceRecord | 작성 중 / 기록됨 / 보관됨 | DRAFT / RECORDED / ARCHIVED | `회개 기록 마치기`, `회개 완료` 금지 | CANDIDATE |
| Promise | 진행 중 / 사용자 마무리 / 보관 | ACTIVE / CLOSED / ARCHIVED | 종료=`마무리됨` | CANDIDATE |
| Action | 계획 / 실행됨 / 후속 선택 결과 | PLANNED / DONE / RETRY / MODIFIED / RESCHEDULED / RECORDED_ONLY | Failure≠Sin | CANDIDATE |
| Confession/ShareCopy | 작성 / 게시 / 숨김 / 제거 | DRAFT / PUBLISHED / HIDDEN / REMOVED | Privacy 3옵션 | CANDIDATE |

### Forbidden State

다음은 Entity Enum/Field/Constant로 생성 금지:

`ANSWERED`, `FORGIVEN`, `SAVED`, `REPENTED`, `FAITHFUL`, `SPIRITUALLY_FAILED`.

추가로 Faith Score / Repentance Score / Prayer Response Rate / Spiritual Maturity Score를 상태값·파생필드·지표로 만들지 않는다.

## 6. Data Field Boundary

### CURRENT 필수 의미 필드
- Owner/User reference
- record content
- created/updated system timestamp
- relation/reference keys
- visibility/privacy selection where applicable
- user-confirmed TurningPoint flag/confirmation data
- ShareCopy snapshot payload/reference
- Reminder user-setting for Promise/Action
- AI Memory opt-in state

### OPEN — 구현 상세
- CRUD 세부 컬럼명
- DB 타입/인덱스
- soft/hard delete physical column naming
- Export file schema
- Recovery metadata 상세
- Exact Lifecycle Enum strings

위 OPEN은 Missing Product Planning이 아니다.

## 7. Sensitive / Privacy Boundary

- AI Memory Default OFF.
- Explicit Opt-in 후에만 사용.
- Prayer/Repentance 등 민감 기록의 Longitudinal Context 재사용 상세 Consent는 HOLD.
- Moderator는 Shared Surface만 접근.
- Minor Confession Default Private; Public Sharing은 HOLD.
- Account Delete 시 ShareCopy Keep/Delete 선택은 User에게 제공.
- 법적/운영 로그는 Content와 분리, 최소 범위, 최대 6개월.

## 8. Scripture Data Boundary

- MVP data = Book / Chapter / Verse Reference 중심.
- Recommendation Category: Directly Relevant Scripture / Theme-related Scripture / Reflection Candidate.
- Full Text field 제공/저장은 License 확보 전 Production HOLD.
- Retrieval/Approved Corpus binding은 HOLD.

## 9. Trace

| Data/Permission Area | Requirement | Feature | Story/AC | Screen |
|---|---|---|---|---|
| Journey records | FD-REQ-JNY-001/002 | FD-FTR-JNY-001/002 | US-RPT-JNY-001/002 | SCR-RPT-JNY-001/002/SEA-001 |
| Prayer | FD-REQ-PRY-001 | FD-FTR-PRY-001 | US-RPT-PRY-001/002 | SCR-RPT-PRY-001 |
| Promise/Action | FD-REQ-PRM-001 / ACT-001 | FD-FTR-PRM-001 / ACT-001/002 | US-RPT-PRM-001 / ACT-001/002 | SCR-RPT-PRM-001 / ACT-001/002 |
| Repentance | FD-REQ-RPN-001 | FD-FTR-RPN-001 | US-RPT-RPN-001/002 | SCR-RPT-RPN-001/002 |
| Confession/ShareCopy | FD-REQ-CNF-001 / DEL-001 | FD-FTR-CNF-001 / SHR-001/002 | US-RPT-CNF-001 / SHR-001/002 | SCR-RPT-CNF-001/002 / SHR-001~003 |
| Community | FD-REQ-COM-001/002 | FD-FTR-COM-001/002 / MOD-001 | US-RPT-MOD-002/003 / AC-G07-01~05 | SCR-RPT-COM-001/002 / MOD-001 |
| Scripture | FD-REQ-SCR-001 | FD-FTR-SCR-001 | US-RPT-SCR-001/002 | SCR-RPT-SCR-001 |
| AI Memory | FD-REQ-MEM-001 | FD-FTR-MEM-001 | US-RPT-MEM-001 | SCR-RPT-MEM-001 |

New Product Meaning Created = 0  
New Theology Rule Created = 0
