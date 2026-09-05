---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 04 사용자 스토리·태스크·인수기준 / User Story, Task & Acceptance Criteria

> 기존 `docs/09-acceptance-criteria.md`의 Product Functional Trace를 Final Documentation 형식으로 정규화한다. Working ID는 그대로 유지하며 Canonical Product ID로 승격하지 않는다.

## 1. Product Functional Story Trace

| Story ID | User Story / 사용자 스토리 | Task | Acceptance Criteria / 인수기준 | Req | Feature | Status |
|---|---|---|---|---|---|---|
| US-RPT-JNY-001 | 사용자는 자신의 삶/신앙 기록을 시간 위에서 보고 싶다. | Time Range 선택, Marker 렌더링, Missing Day 처리 | No Input=No Point; 보간 금지; Faith Score 금지 | FD-REQ-JNY-001 | FD-FTR-JNY-001 | CURRENT |
| US-RPT-JNY-002 | 사용자는 중요한 시점을 직접 표시하고 싶다. | AI Candidate 표시 + User Confirm | User Confirm 전 TurningPoint 확정 금지 | FD-REQ-JNY-002 | FD-FTR-JNY-002 | CURRENT |
| US-RPT-PRY-001 | 사용자는 하나님께 드리는 기도를 기록하고 싶다. | Prayer 작성 + Optional 단계 + Prayer Only Exit | Prayer Only 종료 가능; 후속 단계 강제 금지 | FD-REQ-PRY-001 | FD-FTR-PRY-001 | CURRENT |
| US-RPT-PRY-002 | 사용자는 시스템이 기도 응답 여부를 판정하지 않기를 원한다. | Answered/Pending/Rate 필드·통계·UI 미생성 | 해당 상태/통계 기능이 존재하지 않음 | FD-REQ-PRY-001 | FD-FTR-PRY-001 | CURRENT |
| US-RPT-PRM-001 | 사용자는 하나님 앞의 결단을 기록하고 행동과 연결하고 싶다. | Promise 작성, Action 0..N 연결, 사용자 종료 | 1:N; Miss≠Sin; Streak 금지; 종료=`마무리됨` | FD-REQ-PRM-001 | FD-FTR-PRM-001 | CURRENT |
| US-RPT-ACT-001 | 사용자는 실제 행동을 기록하고 싶다. | Action 작성, Done 처리 | Action Failure를 Sin으로 판정하지 않음 | FD-REQ-ACT-001 | FD-FTR-ACT-001 | CURRENT |
| US-RPT-ACT-002 | 계획대로 하지 못했을 때 다음 행동을 스스로 선택하고 싶다. | 5 Follow-up Choice 표시 | Retry/Modify/Reschedule/Record Only/Optional Repent; Failure Cause 질문/분류 금지; Auto Repent 금지 | FD-REQ-ACT-001 | FD-FTR-ACT-002 | CURRENT |
| US-RPT-RPN-001 | 사용자는 하나님 앞에서 돌아보고 고백하는 기록을 남기고 싶다. | 돌아보기→고백하기→Optional Scripture/돌이킴/Promise/Action | Fixed Step 없음; Progress 없음; 점수 없음 | FD-REQ-RPN-001 | FD-FTR-RPN-001 | CURRENT |
| US-RPT-RPN-002 | 사용자는 회개 기록을 스스로 마치고 싶다. | Final CTA 제공 | CTA=`회개 기록 마치기`; `회개 완료` 금지; Sincerity/Sufficiency 판정 금지 | FD-REQ-RPN-001 | FD-FTR-RPN-001 | CURRENT |
| US-RPT-CNF-001 | 사용자는 고백을 선택적으로 나누고 싶다. | Group/Type→Privacy→Preview→Publish | 3 Privacy 옵션; Anonymous 금지 | FD-REQ-CNF-001 | FD-FTR-CNF-001 | CURRENT |
| US-RPT-SHR-001 | 사용자는 비공개 기록의 일부를 선택해 공유하고 싶다. | Select Fields→Mask/Named→Preview→ShareCopy | Snapshot; Source Edit/Delete 자동 반영 금지; ShareCopy Delete≠Source Delete | FD-REQ-CNF-001 | FD-FTR-SHR-001 | CURRENT |
| US-RPT-SHR-002 | 사용자는 원본 삭제 시 이미 공유한 사본을 직접 정리하고 싶다. | ShareCopy 목록 표시 + Keep/Delete Choice | 자동 일괄 삭제/유지 금지 | FD-REQ-DEL-001 | FD-FTR-SHR-002 | CURRENT |
| US-RPT-SCR-001 | 사용자는 상황과 함께 살펴볼 말씀을 참고하고 싶다. | 3 Category 제시 + 안전한 Literal Copy | 확정 계시 표현 금지; Full Text License HOLD | FD-REQ-SCR-001 | FD-FTR-SCR-001 | CURRENT |
| US-RPT-SCR-002 | 사용자는 라이선스 범위 안에서 정확한 말씀 위치를 확인하고 싶다. | Book/Chapter/Verse 표시 | AI는 후보만 제시; Full Text는 License 확보 전 금지 | FD-REQ-SCR-001 | FD-FTR-SCR-001 | CURRENT |
| US-RPT-ONB-001 | 신규 사용자는 부담 없이 첫 기록을 시작하고 싶다. | 3개 진입 질문 제시, Skip, 첫 기록 연결 | 응답 강제 없음; 5 Main Nav 전체 Tutorial 강제 없음 | FD-REQ-ONB-001 | FD-FTR-ONB-001 | CURRENT |
| US-RPT-SEA-001 | 사용자는 Journey 기록을 빠르게 다시 찾고 싶다. | 기간/종류/키워드/LifeEvent/Season/StoryArc 검색/필터 | Journey 내부 기능; 독립 Bottom Tab 금지 | FD-REQ-SEA-001 | FD-FTR-SEA-001 | CURRENT |
| US-RPT-NOT-001 | 사용자는 자신이 설정한 약속/실행 알림만 받고 싶다. | Promise/Action Reminder 설정/발송 | Prayer/Repentance Nudge 금지; 죄책감/영적 압박 문구 금지 | FD-REQ-NOT-001 | FD-FTR-NOT-001 | CURRENT |
| US-RPT-ACC-001 | 사용자는 탈퇴할 때 개인 기록과 공유본을 직접 정리하고 싶다. | Private Source delete flow, ShareCopy choice, legal log separation | ShareCopy 자동 일괄 삭제/유지 금지; 로그는 Content 분리/최소 범위/최대 6개월 | FD-REQ-ACC-001 | FD-FTR-ACC-001 | CURRENT |
| US-RPT-ACC-002 | 사용자는 자신의 기록을 가져갈 수 있기를 원한다. | Export | Product Scope 포함, 구현 상세/우선순위 후순위 | FD-REQ-EXP-001 | FD-FTR-EXP-001 | CURRENT / LOW PRIORITY |
| US-RPT-MEM-001 | 사용자는 AI가 자신의 기록을 기억할지 직접 결정하고 싶다. | Default OFF, Explicit Opt-in, Stop/Delete | 무동의 Recall 금지; 민감 기록 재사용은 동의 필요 | FD-REQ-MEM-001 | FD-FTR-MEM-001 | CURRENT / DETAIL HOLD |
| US-RPT-MOD-002 | 사용자는 공유 콘텐츠에 최소한의 공감을 표현하고 싶다. | 공감 1종 버튼 | 인기순/랭킹/영적 비교/Faith Signal 금지 | FD-REQ-COM-001 | FD-FTR-COM-001 | CURRENT |
| US-RPT-MOD-003 | 사용자는 안전 문제를 콘텐츠/행동 기준으로 신고하고 싶다. | 4종 신고 사유 선택 | Spiritual Judgment 신고사유 금지; AC-G07-04 재사용 | FD-REQ-COM-001 | FD-FTR-COM-002 | CURRENT |

## 2. Community Moderation Policy AC

Canonical Product Policy AC는 기존 ID를 그대로 유지한다.

| AC ID | Acceptance Criteria | Status |
|---|---|---|
| AC-G07-01 | Moderation 결과는 콘텐츠/행동 기준으로만 표현된다. | CURRENT / CANONICAL |
| AC-G07-02 | Moderation 결과가 사용자의 영적 상태 판정으로 확장되지 않는다. | CURRENT / CANONICAL |
| AC-G07-03 | Hide/Delete/Reject가 죄/회개/구원 판정으로 표현되지 않는다. | CURRENT / CANONICAL |
| AC-G07-04 | 신고 사유와 Spiritual Judgment를 분리한다. | CURRENT / CANONICAL |
| AC-G07-05 | Admin에서도 Spiritual Score/Faith Label을 생성하지 않는다. | CURRENT / CANONICAL |

Moderation Workflow Detail / Moderator Action Detail 자체는 CANDIDATE이며 위 AC가 상세 Workflow를 자동 확정하지 않는다.

## 3. AI/VGL Acceptance Boundary

- `VGL-RPT-AC-001~065` Canonical 65는 수정하지 않는다.
- Text Validator Regression 65/65는 Engineering PASS 근거이나 Production/Governance PASS와 동일하지 않다.
- Official Model Run은 NOT RUN.
- API Runtime Binding / Scripture Retrieval / Minor Safety / Longitudinal Consent 등 Production Gate는 HOLD.
- Canonical 65 숫자와 Product Functional AC, G-07 Product Policy AC를 합산하지 않는다.

## 4. Story-level Negative AC

모든 관련 Story에 공통 적용:
1. Faith/Repentance/Prayer Response/Spiritual Maturity Score 생성 금지.
2. 구원/용서/회개 진정성/죄의 최종 영적 상태 판정 금지.
3. Empty/Error에 영적 의미 부여 금지.
4. AI는 God/God's Voice/Prophet/Pastor Substitute/Spiritual Judge가 아니다.
5. AI는 Record Owner가 아니다.
6. Moderator는 Private Prayer/Repentance Source를 열람하지 않는다.

## 5. Trace Gaps

- CURRENT Story/Task/AC의 Requirement↔Feature Trace: **0 break 발견**
- Moderation Workflow/Moderator Action 상세: CANDIDATE, non-blocking
- Export 구현 상세: OPEN, non-blocking
- Lifecycle Exact Enum Naming: 09 Data/State/Permission 단계에서 확정 절차 수행 대상
- Screen ID/Screen Trace: Phase 4 `08 Screen Specification`에서 연결 예정

New Product Meaning Created = 0  
New Theology Rule Created = 0
