---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 08 화면 명세 / Screen Specification

> Product Documentation 01~07 기반 Screen Specification. Figma/Legacy Prototype 역설계 금지. Screen ID는 개발 추적용 기술 식별자이며 신규 Product Meaning이 아니다.

## 1. Screen Inventory

| Screen ID | Screen / 화면 | Domain | Status | Related Story |
|---|---|---|---|---|
| SCR-RPT-ONB-001 | 온보딩 3개 진입 질문 | Onboarding | CURRENT | US-RPT-ONB-001 |
| SCR-RPT-JNY-001 | 여정 메인/시간범위 | Journey | CURRENT | US-RPT-JNY-001 |
| SCR-RPT-JNY-002 | Turning Point 확인 | Journey | CURRENT | US-RPT-JNY-002 |
| SCR-RPT-SEA-001 | 여정 검색/필터 | Journey | CURRENT | US-RPT-SEA-001 |
| SCR-RPT-PRY-001 | 기도 작성 | Prayer | CURRENT | US-RPT-PRY-001/002 |
| SCR-RPT-PRM-001 | 약속 작성/상세 | Promise | CURRENT | US-RPT-PRM-001 |
| SCR-RPT-ACT-001 | 실행 작성/상세 | Action | CURRENT | US-RPT-ACT-001 |
| SCR-RPT-ACT-002 | 실행 후속 선택 | Action | CURRENT | US-RPT-ACT-002 |
| SCR-RPT-RPN-001 | 회개 기록 흐름 | Repentance | CURRENT | US-RPT-RPN-001 |
| SCR-RPT-RPN-002 | 회개 기록 마치기 | Repentance | CURRENT | US-RPT-RPN-002 |
| SCR-RPT-CNF-001 | 고백 작성 | Confession | CURRENT | US-RPT-CNF-001 |
| SCR-RPT-CNF-002 | 공개범위/미리보기 | Confession | CURRENT | US-RPT-CNF-001 |
| SCR-RPT-SHR-001 | Private Source 공유 항목 선택 | Sharing | CURRENT | US-RPT-SHR-001 |
| SCR-RPT-SHR-002 | ShareCopy 미리보기/게시 | Sharing | CURRENT | US-RPT-SHR-001 |
| SCR-RPT-SHR-003 | Source 삭제 시 ShareCopy 선택 | Sharing | CURRENT | US-RPT-SHR-002 |
| SCR-RPT-SCR-001 | 말씀 Reference | Scripture | CURRENT / FULL TEXT HOLD | US-RPT-SCR-001/002 |
| SCR-RPT-COM-001 | 공유 콘텐츠 상세/공감 | Community Surface | CURRENT | US-RPT-MOD-002 |
| SCR-RPT-COM-002 | 신고 사유 선택 | Community Surface | CURRENT | US-RPT-MOD-003 |
| SCR-RPT-MOD-001 | Moderation 검토 | Moderation | CANDIDATE DETAIL | AC-G07-01~05 |
| SCR-RPT-NOT-001 | Promise/Action Reminder 설정 | Notification | CURRENT | US-RPT-NOT-001 |
| SCR-RPT-ACC-001 | 계정 삭제/ShareCopy 선택 | Account | CURRENT | US-RPT-ACC-001 |
| SCR-RPT-EXP-001 | Export | Account | OPEN / LOW PRIORITY | US-RPT-ACC-002 |
| SCR-RPT-MEM-001 | AI Memory Opt-in | AI Memory | CURRENT / DETAIL HOLD | US-RPT-MEM-001 |

## 2. Screen Specification Matrix

| Screen ID | Purpose | Entry | Exit / Return | Actor | Input | Output | State | Empty | Error | Primary Action | Secondary Action | Related AC | Related Policy | Related Data | Permission | HOLD |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SCR-RPT-ONB-001 | 가입 직후 첫 기록 진입 | 가입 완료 | 선택한 첫 기록 또는 Main Nav | Owner | 3개 질문 중 선택 응답 | 첫 기록 진입 의도 | unanswered/answered/skipped(의미 상태, Enum 미확정) | 질문 응답 없음 허용 | 저장 실패=기술 오류 | 질문 답변/첫 기록 연결 | 건너뛰기 | US-RPT-ONB-001 AC | Onboarding | User | Owner | 없음 |
| SCR-RPT-JNY-001 | 개인 기록 시간축 조회 | Journey Tab | Journey 유지/Source Detail | Owner | Time Range, filter context | Life Curve + markers | time-range selected | 기록 없음=점 없음 | 조회 실패=기술 오류 | 범위 선택/기록 열기 | Search/Filter | US-RPT-JNY-001 AC | Missing Day, LCI | LifeEvent, Season, StoryArc | Owner | 없음 |
| SCR-RPT-JNY-002 | Turning Point 사용자 확정 | Journey candidate 선택 | Journey | Owner | Candidate, confirm 여부 | TurningPoint confirmed/unconfirmed | candidate/confirmed 의미 | Candidate 없음 | 저장 실패 | 확인 | 취소 | US-RPT-JNY-002 AC | Turning Point | TurningPoint | Owner; AI=제안만 | 없음 |
| SCR-RPT-SEA-001 | Journey 기록 재탐색 | Journey 내부 Search | Journey/Source Detail | Owner | 기간/종류/키워드/LifeEvent/Season/StoryArc | 결과 목록 | query/filter state | 검색 결과 없음 | 검색 실패 | 검색/필터 적용 | 초기화/닫기 | US-RPT-SEA-001 AC | Search=Journey 내부 | LifeEvent, Season, StoryArc + referenced records | Owner | 없음 |
| SCR-RPT-PRY-001 | 기도 기록 | Prayer Entry | 저장 후 Return 또는 Prayer Only Exit | Owner | Prayer content, optional refs | Prayer Record | draft/recorded 의미, Exact Enum CANDIDATE | 본문 미입력 시 저장 제한은 구현 validation 범위 | 저장 실패 | 기도 기록 저장 | Prayer Only Exit / optional refs | US-RPT-PRY-001/002 AC | Prayer Response Tracking REMOVED | Prayer | Owner | Response Tracking 금지 |
| SCR-RPT-PRM-001 | 약속 기록/행동 연결 | Promise Tab/optional source | Promise Return | Owner | Promise content, Action 0..N | Promise | active/closed 의미, Exact Enum CANDIDATE | Action 0개 허용 | 저장 실패 | 저장/Action 연결 | `마무리됨` | US-RPT-PRM-001 AC | Promise 1:N, Miss≠Sin | Promise, Action | Owner | 없음 |
| SCR-RPT-ACT-001 | 실행 기록 | Action Tab/Promise | Action Return | Owner | Action content | Action | planned/done 의미, Exact Enum CANDIDATE | 연결 Promise 없음 허용 여부는 기존 relation 범위에 따름 | 저장 실패 | Done 기록 | 수정/일정 조정 진입 | US-RPT-ACT-001 AC | Failure≠Sin | Action | Owner | 없음 |
| SCR-RPT-ACT-002 | 계획과 달랐을 때 다음 행동 선택 | Action 결과 | Action Return 또는 Optional Repent | Owner | 5 Follow-up Choice | 선택된 후속 처리 | retry/modify/reschedule/record-only 의미 | 해당 없음 | 처리 실패 | Retry/Modify/Reschedule/Record Only/Optional Repent | Return | US-RPT-ACT-002 AC | Failure Cause Taxonomy 금지 | Action, optional RepentanceRecord | Owner | Auto Repent 금지 |
| SCR-RPT-RPN-001 | 회개 기록 진행 | Repentance Tab/Optional Repent | RPN-002 또는 Return | Owner | 돌아보기/고백 + optional refs | RepentanceRecord | draft/recorded 의미, Exact Enum CANDIDATE | optional 단계 미입력 허용 | 저장 실패 | 기록 진행 | optional Scripture/Promise/Action | US-RPT-RPN-001 AC | Optional Progressive Flow | RepentanceRecord | Owner | Fixed Step/Progress 금지 |
| SCR-RPT-RPN-002 | 회개 기록 사용자 종료 | RPN-001 | Repentance Return | Owner | 종료 확인 | 기록 완료 메시지 | recorded 의미 | 해당 없음 | 저장 실패 | `회개 기록 마치기` | Return | US-RPT-RPN-002 AC | `회개 완료` 금지 | RepentanceRecord | Owner | 영적 충분성 판정 금지 |
| SCR-RPT-CNF-001 | Direct Confession 작성 | Confession Tab | CNF-002 | Owner | Group/Type/content | Confession draft | draft 의미 | 내용 없음 | 저장 실패 | 다음/미리보기 | 취소 | US-RPT-CNF-001 AC | Confession Privacy | Confession | Owner | Minor Public=HOLD |
| SCR-RPT-CNF-002 | 공개범위 선택 후 Preview/Publish | CNF-001 | Confession Surface | Owner | 나만/이름가림/이름공개 | Published/Private Confession | visibility + publish state | 해당 없음 | 게시 실패 | Preview 후 Publish | Back | US-RPT-CNF-001 AC | 3옵션/Anonymous 금지 | Confession | Owner | Minor Public=HOLD |
| SCR-RPT-SHR-001 | Private Source 공유 필드 선택 | Prayer/Repentance 등 Source | SHR-002 | Owner | 공유할 필드, Mask/Named | ShareCopy candidate | pre-share | 공유 가능 필드 없음 | 로드 실패 | 선택 완료 | 취소 | US-RPT-SHR-001 AC | Explicit Share | Source Record | Owner | Minor Public=HOLD |
| SCR-RPT-SHR-002 | Snapshot Preview 후 게시 | SHR-001 | Confession Surface | Owner | selected fields, visibility | ShareCopy Snapshot | draft/published 의미 | 해당 없음 | 게시 실패 | Publish | Back | US-RPT-SHR-001 AC | Sharing 3원칙 | ShareCopy | Owner | Minor Public=HOLD |
| SCR-RPT-SHR-003 | Source 삭제 시 ShareCopy 처리 선택 | Source Delete | 삭제 완료/Return | Owner | ShareCopy Keep/Delete choice | Source delete + 선택된 ShareCopy 처리 | deletion process | ShareCopy 없음=Source만 삭제 | 삭제 실패 | 사용자 선택 적용 | 취소 | US-RPT-SHR-002 AC | Auto cascade 금지 | Source, ShareCopy | Owner | Production 세부 HOLD 가능 |
| SCR-RPT-SCR-001 | 말씀 Reference 열람 | Optional Scripture entry | Source Flow Return | Owner/Viewer | context/reference request | Book/Chapter/Verse + category | reference state | 후보 없음 | 조회 실패 | Reference 확인 | Return | US-RPT-SCR-001/002 AC | Reflection Reference | ScriptureReference | User Read; System 제시 | Full Text License/Retrieval HOLD |
| SCR-RPT-COM-001 | 공유 콘텐츠 열람/공감 | Confession Shared Surface | Return | Viewer/Owner | shared post | Post + 공감 1종 | published/hidden 의미 | 게시물 없음 | 로드 실패 | 공감 | 신고 | US-RPT-MOD-002 + G07 | Reaction 1종 | Confession/ShareCopy | Viewer read; Owner own content | Minor Public 조건 적용 |
| SCR-RPT-COM-002 | 콘텐츠 신고 | COM-001 | COM-001 | Viewer/Owner | 4종 report reason | 신고 접수 | submitted 의미 | 해당 없음 | 접수 실패 | 신고 제출 | 취소 | US-RPT-MOD-003 / AC-G07-04 | Report Taxonomy | shared post reference | authenticated actor | 없음 |
| SCR-RPT-MOD-001 | 공유 콘텐츠 운영 검토 | Report queue | 미정 | Moderator | shared Confession/ShareCopy | policy action candidate | workflow enum 미정 | queue empty | technical error | 상세 action 미정 | 미정 | AC-G07-01~05 | Moderation spiritual boundary | Confession/ShareCopy only | Moderator; Private Source 접근 금지 | Workflow/Action Detail CANDIDATE |
| SCR-RPT-NOT-001 | Promise/Action Reminder 설정 | Promise/Action | Source Return | Owner | reminder setting | user-configured reminder | enabled/disabled 의미 | 설정 없음=OFF | 저장 실패 | 저장 | 해제 | US-RPT-NOT-001 AC | Prayer/Repentance Nudge 금지 | Promise/Action + reminder config | Owner | 없음 |
| SCR-RPT-ACC-001 | 탈퇴 데이터 선택 | Account Delete | Account terminated/Cancel | Owner | ShareCopy keep/delete choice | deletion instruction | deletion process | ShareCopy 없음 | 처리 실패 | 탈퇴 실행 | 취소 | US-RPT-ACC-001 AC | 로그 분리/최대6개월 | User + owned records + ShareCopy | Owner | Legal 상세 필요 시 HOLD |
| SCR-RPT-EXP-001 | 기록 Export | Account/Settings | Return | Owner | export request | export artifact | request state 미정 | export 대상 없음 | 생성 실패 | Export | Cancel | US-RPT-ACC-002 | Scope 포함/우선순위 낮음 | User-owned entities | Owner | 구현 상세 OPEN |
| SCR-RPT-MEM-001 | AI Memory Opt-in 관리 | Settings/AI | Return | Owner | opt-in/off/delete | memory consent state | OFF/OPT-IN 의미 | 기본 OFF | 저장 실패 | 켜기/끄기/삭제 | Return | US-RPT-MEM-001 AC | Default OFF | consent/config + allowed context | Owner | Longitudinal Consent 상세 HOLD |

## 3. Global Screen Rules

- Empty/Error는 기술 상태로만 표현. 영적 평가 문구 금지.
- Faith/Repentance/Prayer Response/Spiritual Maturity Score 표시 금지.
- AI/System/Moderator의 구원/용서/죄 최종 상태/회개 진정성 판정 금지.
- Moderator는 공유된 Confession/ShareCopy만 열람 가능하고 Private Prayer/RepentanceRecord Source 접근 금지.
- Figma는 이 문서 Lock 후 Visual Design Source로 사용한다.

## 4. Trace Coverage

CURRENT Product Functional Story 중 Screen이 필요한 Story는 위 Screen ID로 연결. Runtime-only `VGL-RPT-AC-001~065`는 제품 화면 1:1 대응을 강제하지 않는다.

New Product Meaning Created = 0  
New Theology Rule Created = 0
