---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 03 기능 정의서 / Feature Definition

> 기능 목록은 기존 Canonical Planning의 CURRENT/CANDIDATE/HOLD 상태를 정규화한 것이다. Feature Working ID를 Canonical Product ID로 승격하지 않는다.

## 1. Feature Inventory / 기능 목록

| Trace ID | Feature | User Value | Core Behavior | Status | Requirement | Existing Story/AC |
|---|---|---|---|---|---|---|
| FD-FTR-JNY-001 | Journey Time View | 삶/신앙 기록 시간축 조회 | Today/Week/Month/Year/All, Missing Day No Point | CURRENT | FD-REQ-JNY-001 | US-RPT-JNY-001 |
| FD-FTR-JNY-002 | Turning Point | 중요한 시점 표시 | AI Candidate → User Confirm | CURRENT | FD-REQ-JNY-002 | US-RPT-JNY-002 |
| FD-FTR-PRY-001 | Prayer Record | 개인 기도 기록 | Prayer Only Exit + optional refs | CURRENT | FD-REQ-PRY-001 | US-RPT-PRY-001/002 |
| FD-FTR-PRM-001 | Promise | 결단 기록/실행 연결 | Promise 1:N Action, `마무리됨` | CURRENT | FD-REQ-PRM-001 | US-RPT-PRM-001 |
| FD-FTR-ACT-001 | Action Record | 실제 행동 기록 | Done | CURRENT | FD-REQ-ACT-001 | US-RPT-ACT-001 |
| FD-FTR-ACT-002 | Action Follow-up | 계획과 달랐을 때 다음 행동 선택 | Retry/Modify/Reschedule/Record Only/Optional Repent | CURRENT | FD-REQ-ACT-001 | US-RPT-ACT-002 |
| FD-FTR-RPN-001 | Repentance Progressive Flow | 회개 기록 | Optional Progressive Flow | CURRENT | FD-REQ-RPN-001 | US-RPT-RPN-001/002 |
| FD-FTR-CNF-001 | Direct Confession | 직접 고백 작성/공유 | Group/Type → Privacy → Preview → Publish | CURRENT | FD-REQ-CNF-001 | US-RPT-CNF-001 |
| FD-FTR-SHR-001 | Private Source ShareCopy | 비공개 기록 선택 공유 | Select Fields → Mask/Named → Preview → Snapshot | CURRENT | FD-REQ-CNF-001 | US-RPT-SHR-001 |
| FD-FTR-SHR-002 | Source Delete ShareCopy Choice | 원본 삭제 시 공유본 정리 | ShareCopy 목록 → User Keep/Delete Choice | CURRENT | FD-REQ-DEL-001 | US-RPT-SHR-002 |
| FD-FTR-COM-001 | Reaction | 최소 공감 표현 | 공감 1종 | CURRENT | FD-REQ-COM-001 | US-RPT-MOD-002 |
| FD-FTR-COM-002 | Report | 공유 콘텐츠 신고 | 4종 Report Taxonomy | CURRENT | FD-REQ-COM-001 | US-RPT-MOD-003 / AC-G07-04 |
| FD-FTR-MOD-001 | Moderation Policy Boundary | 운영 검토의 영적 판정 방지 | Content/Behavior 기준만 사용 | CURRENT POLICY | FD-REQ-COM-002 | AC-G07-01~05 |
| FD-FTR-MOD-002 | Moderation Workflow Detail | 운영 검토 절차 | 미확정 | CANDIDATE | FD-REQ-COM-002 | 기존 MOD-001에서 상세 CANDIDATE |
| FD-FTR-SCR-001 | Scripture Reflection Reference | 상황에 참고할 말씀 확인 | 3 Category + Book/Chapter/Verse | CURRENT | FD-REQ-SCR-001 | US-RPT-SCR-001/002 |
| FD-FTR-AI-001 | AI/VGL Reflection Assist | 안전한 성찰 보조 | Spiritual Authority 금지, Validator/Router 연계 | CURRENT | FD-REQ-AI-001 | VGL-RPT-AC-001~065 |
| FD-FTR-ONB-001 | Onboarding | 첫 기록 진입 | 3개 질문, Skip 가능 | CURRENT | FD-REQ-ONB-001 | US-RPT-ONB-001 |
| FD-FTR-SEA-001 | Journey Search/Filter | 기록 재탐색 | 기간/종류/키워드/LifeEvent/Season/StoryArc | CURRENT | FD-REQ-SEA-001 | US-RPT-SEA-001 |
| FD-FTR-NOT-001 | Promise/Action Reminder | 사용자 설정 알림 | User-configured Reminder only | CURRENT | FD-REQ-NOT-001 | US-RPT-NOT-001 |
| FD-FTR-ACC-001 | Account Delete | 탈퇴 데이터 정리 | Private Source delete + ShareCopy Choice + log separation | CURRENT | FD-REQ-ACC-001 | US-RPT-ACC-001 |
| FD-FTR-EXP-001 | Export | 기록 내보내기 | 구현 상세 추후 | CURRENT / LOW PRIORITY | FD-REQ-EXP-001 | US-RPT-ACC-002 |
| FD-FTR-MEM-001 | AI Memory Opt-in | 사용자 통제 기억 | Default OFF, Explicit Opt-in, Stop/Delete | CURRENT / DETAIL HOLD | FD-REQ-MEM-001 | US-RPT-MEM-001 |

## 2. Negative Feature Requirements / 만들지 않는 기능

- Prayer Answered/Pending/Response Rate
- Journey Social/함께
- Search 독립 Bottom Tab
- Action Failure Cause Taxonomy
- Auto Repent on Action Failure
- Repentance Fixed 10-Step / Progress % / Spiritual Score
- Faith Score / Repentance Score / Prayer Response Rate / Spiritual Maturity Score
- 인기순/랭킹/Reaction 기반 Faith Signal
- Anonymous Confession
- AI Revelation / Prophecy / God's Voice
- License 확보 전 Scripture Full Text Production

## 3. Feature State Rules

- CURRENT: 개발 문서화 가능.
- CANDIDATE: Product Meaning은 존재하나 상세 구현 확정 전. 임의 승격 금지.
- HOLD: 외부/Owner/Legal/Runtime Gate 해소 전 구현 착수 금지.
- LOW PRIORITY: Product Scope에는 포함되나 MVP 우선순위 뒤.

## 4. Trace Rule

`FD-REQ-*` ↔ `FD-FTR-*` ↔ 기존 `US-RPT-*` / `AC-G07-*` / `VGL-RPT-AC-*`.

`FD-FTR-*`는 Final Documentation Trace ID이며 기존 Product Working ID를 Canonical ID로 승격하지 않는다.

New Product Meaning Created = 0  
New Theology Rule Created = 0
