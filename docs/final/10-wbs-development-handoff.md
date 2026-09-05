---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 10 개발 우선순위·WBS·실행 인계 / WBS, Development Priority & Handoff

> 목적: Final Documentation 01~09를 실제 개발 착수 순서와 Trace Gate로 연결한다. 신규 Product Scope를 만들지 않는다.

## 1. Development Start Principle

개발 착수 기준은 다음 순서를 따른다.

`Foundation → Core Domain → Cross-cutting → Shared Surface → Governance Detail → Deferred/HOLD`

Figma/Visual Design은 `08 Screen Specification` 이후 작업한다. Legacy Prototype은 구현 기준으로 사용하지 않는다.

## 2. WBS / Work Breakdown Structure

| WBS ID | Work Package | Priority | Dependency | Output | Gate | Status |
|---|---|---|---|---|---|---|
| WBS-RPT-000 | Foundation / 공통 기반 | P0 | Final Docs 01~09 | Navigation shell, common state/error pattern, auth/owner boundary | Main Nav/Permission Lock | READY |
| WBS-RPT-100 | Journey Core | P0 | 000 | Journey time view, marker, TurningPoint, Search/Filter | FD-REQ-JNY / SCR-RPT-JNY/SEA | READY |
| WBS-RPT-200 | Prayer Core | P0 | 000 | Prayer Record + Prayer Only Exit | Response Tracking 없음 확인 | READY |
| WBS-RPT-300 | Promise Core | P0 | 000 | Promise + 1:N Action relation | `마무리됨`, Streak 없음 | READY |
| WBS-RPT-400 | Action Core | P0 | 300 | Action + Follow-up Choice | Failure Cause Taxonomy 없음 | READY |
| WBS-RPT-500 | Repentance Core | P0 | 000 | Optional Progressive Flow | Fixed Step/Progress/Score 없음 | READY |
| WBS-RPT-600 | Confession Core | P0 | 000 | Direct Confession + Privacy 3옵션 + Preview | Anonymous 없음 | READY |
| WBS-RPT-610 | ShareCopy | P0 | 600 + Private Source | Snapshot share + delete choice | Sharing 3원칙 | READY |
| WBS-RPT-700 | Scripture Reference | P1 | Core flows | Book/Chapter/Verse Reference | Full Text License HOLD 준수 | READY WITH HOLD BOUNDARY |
| WBS-RPT-800 | Community Reaction/Report | P1 | 600/610 | 공감 1종 + 신고 4종 | G-07 AC | READY |
| WBS-RPT-810 | Moderation Detail | P2 | 800 | Workflow/Action implementation | AC-G07-01~05 | CANDIDATE / NOT START |
| WBS-RPT-900 | Notification | P1 | 300/400 | Promise/Action Reminder | Prayer/Repentance Nudge 없음 | READY |
| WBS-RPT-910 | Account Delete | P1 | Data layer | Private Source delete + ShareCopy choice | privacy/log rules | READY |
| WBS-RPT-920 | Export | P2 | stable data model | Export capability | schema detail OPEN | LOW PRIORITY |
| WBS-RPT-930 | AI Memory Opt-in | P2/HOLD | Consent gate | OFF/Opt-in/Stop/Delete | Longitudinal Consent | PARTIAL READY / HOLD |
| WBS-RPT-940 | AI/VGL Runtime Binding | HOLD | Provider/API/Consent/License | runtime provider binding | Official Model Run | HOLD |

## 3. Implementation Gate by Domain

### Journey
- MUST: Time Range, Missing Day No Point, Search inside Journey, TurningPoint User Confirm.
- MUST NOT: Faith Score, Journey Social/함께, 독립 Search Tab.

### Prayer
- MUST: Prayer Record, Prayer Only Exit.
- MUST NOT: Answered/Pending/Response Rate.

### Promise
- MUST: Promise 1:N Action, 사용자 종료 `마무리됨`.
- MUST NOT: Streak, Miss=Sin.

### Action
- MUST: Retry/Modify/Reschedule/Record Only/Optional Repent.
- MUST NOT: Failure Cause Taxonomy, Auto Repent, Failure=Sin.

### Repentance
- MUST: Optional Progressive Flow, `회개 기록 마치기`.
- MUST NOT: Fixed Step count, progress %, score, sincerity/sufficiency judgment.

### Confession / ShareCopy
- MUST: 3 Privacy options, Preview before Publish, Snapshot separation.
- MUST NOT: Anonymous, implicit share, cascading source/share delete.

### Community / Moderation
- MUST: Reaction 1종, Report 4종, content/behavior policy wording.
- MUST NOT: ranking/popularity/Faith Signal/Spiritual Judgment.
- Workflow/Moderator Action Detail은 CANDIDATE이므로 P2 이전에 임의 구현 금지.

### Scripture
- MUST: Reference 중심.
- MUST NOT: License 전 Full Text, divine certainty wording.

## 4. Development Handoff Checklist

개발팀은 각 Task 착수 전 아래를 확인한다.

1. Requirement ID 존재
2. Feature ID 존재
3. Story/Task/AC 연결
4. IA Entry/Return 확인
5. Policy MUST/MUST NOT 확인
6. Flow 확인
7. Screen ID 확인
8. Data/Relation 확인
9. State Meaning 확인
10. Permission 확인
11. OPEN/HOLD 침범 여부 확인
12. Test/Acceptance evidence 저장 위치 정의

## 5. Final Cross Trace Audit

Audit Chain:

`Requirement → Service → Feature → Story → Task → AC → IA → Policy → Flow → Screen → Data → State → Permission → WBS → Handoff`

### Audit Result

| Audit Code | Meaning | Result | Note |
|---|---|---|---|
| ORPHAN_REQUIREMENT | Requirement가 Feature/Story로 연결되지 않음 | 0 | CURRENT scope 기준 |
| FEATURE_WITHOUT_REQUIREMENT | Feature가 Requirement 없이 존재 | 0 | CANDIDATE는 상태 보존 |
| STORY_WITHOUT_FEATURE | Story가 Feature 없이 존재 | 0 | 기존 US-RPT trace 유지 |
| TASK_WITHOUT_AC | Task가 AC 없이 존재 | 0 | MOD 상세는 CANDIDATE |
| AC_WITHOUT_POLICY | AC가 Policy 근거 없이 존재 | 0 | G07/VGL 독립 Owner 유지 |
| FLOW_WITHOUT_STORY | Flow가 Story 없이 존재 | 0 | Cross-cutting optional flow는 parent story 연결 |
| SCREEN_WITHOUT_STORY | Screen이 Story/AC 근거 없이 존재 | 0 | MOD screen은 G07 AC 기반 CANDIDATE |
| DATA_WITHOUT_OWNER | Entity/Data가 Owner 없이 존재 | 0 | AI owner 금지 명시 |
| STATE_WITH_SPIRITUAL_JUDGMENT | 영적 판정 State 존재 | 0 | Forbidden State 적용 |
| PERMISSION_LEAK | Moderator/AI Private Source 과권한 | 0 | boundary 명시 |
| POLICY_WITHOUT_AC | Current Policy가 검증 지점 없이 존재 | 0 | Product Functional/G07/VGL AC로 연결 |

**Trace Break = 0 (CURRENT scope).**

## 6. Intentional OPEN / HOLD — Audit Exclusion

다음은 Trace Break가 아니라 의도적 상태다.

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

HOLD는 Missing Product Planning으로 계산하지 않는다.

## 7. Final Documentation Index

| No | Document | Status |
|---|---|---|
| 01 | Requirement Definition / 요구사항 정의서 | CURRENT |
| 02 | Service Architecture / 서비스 설계서 | CURRENT |
| 03 | Feature Definition / 기능 정의서 | CURRENT |
| 04 | User Story / Task / AC | CURRENT |
| 05 | IA / Menu Architecture | CURRENT |
| 06 | Policy / Business Rules | CURRENT |
| 07 | Service Flow / Process | CURRENT |
| 08 | Screen Specification | CURRENT |
| 09 | Data / State / Permission | CURRENT |
| 10 | WBS / Development Priority / Handoff | CURRENT |

## 8. Development Ready Verdict

- Final Documentation 10종: **DRAFT COMPLETE / TRACE PASS**
- Product Meaning Conflict: **0**
- Trace Break: **0**
- Owner Decision Required for Current scope: **0**
- Development Blocking for Current non-HOLD scope: **0**
- Figma: **NEXT — Product docs 기반 재설계 가능**
- Prototype: **LEGACY / NON-CANONICAL**
- main merge: **금지**

최종 Lock 전 PM/Owner 시각 검수 및 Handoff/CHANGELOG 갱신 후 `FINAL DOCUMENTATION LOCK` 판정한다.

New Product Meaning Created = 0  
New Theology Rule Created = 0
