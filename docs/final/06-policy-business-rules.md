---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 06 정책·비즈니스 규칙 / Policy & Business Rules

> 목적: 승인된 Product Policy, Privacy, Social Safety, AI/VGL, Scripture Boundary를 개발자가 구현 규칙으로 사용할 수 있도록 정규화한다. 신규 정책을 만들지 않는다.

## 1. Journey Policy

### Missing Day Rule
- No Input = No Point.
- 기록이 없는 날은 그래프에 점을 찍지 않는다.
- 보간(Interpolation) 금지.
- 시스템이 상태를 추정해 채우지 않는다.

### Turning Point
- MVP 확정 주체 = User.
- AI는 Candidate만 제안 가능.
- `AI Candidate → User Confirm` 전에는 확정 상태가 아니다.

### Journey Social
- REMOVED.
- Journey는 개인 시간축이다.
- Social Surface는 Confession으로 일원화한다.

## 2. Prayer Policy

### Prayer Response Tracking
- REMOVED.
- Answered/Pending 상태 금지.
- Response Rate/응답 통계 금지.
- Prayer Only Exit 허용.
- 시스템/AI가 기도 응답 여부를 판정하지 않는다.

## 3. Promise Policy

- Promise 1:N Action.
- No Streak.
- No Faith Score.
- Miss ≠ Sin.
- 사용자-facing 종료 문구 = **마무리됨**.
- `완료/성공`을 영적 성취 판정처럼 사용하지 않는다.

## 4. Action Policy

Action이 계획과 달랐을 때 제공 가능한 Follow-up Choice:
1. Retry
2. Modify
3. Reschedule
4. Record Only
5. Optional Repent

금지:
- Failure Cause Taxonomy
- 실패 원인 강제 질문/분류
- Auto Repent
- Action Failure = Sin 판정

## 5. Repentance Policy

- Fixed 10-Step REMOVED.
- Optional Progressive Flow.
- 고정 단계 수 금지.
- Progress/완료율 표시 금지.
- Repentance Score 금지.
- 진정성/Sufficiency 판정 금지.
- Final CTA = **회개 기록 마치기**.
- `회개 완료` 표현 금지.

## 6. Confession / Sharing Policy

### Privacy 3 Options
1. 나만 보기
2. 이름 가리고 나누기
3. 이름 공개로 나누기

- Anonymous 게시 금지.
- `이름 가리고 나누기`는 내부 작성자 식별이 유지되는 Masked Display다.
- Confession Type = **기도 / 고백 / 은혜 / 일상**.

### Sharing 3 Principles
- Source Edit ≠ ShareCopy Auto Edit.
- Source Delete ≠ ShareCopy Auto Delete.
- ShareCopy Delete ≠ Source Delete.

### Sharing Execution Rule
- 자동 공유/묵시적 공유 금지.
- 사용자 명시 선택 + Preview 이후에만 Publish.
- Source 삭제 시 기존 ShareCopy 목록을 제시하고 함께 삭제 여부를 User가 직접 선택한다.

## 7. Community / Moderation Policy

### Reaction
- 공감 1종만.
- 인기순 금지.
- 랭킹 금지.
- 영적 비교 금지.
- Reaction 기반 Faith Signal 금지.

### Report Taxonomy
4종만 허용:
1. 개인정보 노출
2. 괴롭힘·혐오
3. 스팸·광고
4. 기타 안전 문제

금지 신고사유:
- 신앙이 잘못됨
- 회개가 부족함
- 기타 Spiritual Judgment 기반 사유

### Moderation Boundary
허용:
- 공개 범위 판단
- 신고 접수/검토
- 운영 정책 위반 판단
- 콘텐츠 노출/비노출 처리

금지:
- 회개 진정성 판정
- 죄의 최종 영적 상태 판정
- 하나님과의 관계 상태 판정
- 용서/구원 상태 판정
- Admin Spiritual Score/Faith Label

Moderation Workflow Detail / Moderator Action Detail은 CANDIDATE이며 임의 확정하지 않는다.

## 8. Notification Policy

- MVP = Promise/Action 사용자 설정 Reminder만.
- Prayer/Repentance Nudge Push 기본 제공 금지.
- 죄책감/영적 압박 문구 금지.

금지 예:
- `기도한 지 오래됐습니다.`
- `회개할 시간입니다.`

## 9. Empty / Error / Archive Policy

### Empty/Error
- 기술적 상태로만 표현.
- 영적 의미 부여 금지.

허용:
- `아직 기록이 없습니다.`
- `저장하지 못했습니다. 다시 시도해 주세요.`
- `말씀 정보를 불러오지 못했습니다.`

금지:
- `기도가 부족합니다.`
- `회개가 필요합니다.`
- `신앙 기록이 부족합니다.`

### Archive
- 시스템 보관 상태일 뿐 영적 완료를 의미하지 않는다.

## 10. AI / VGL Policy

AI는 다음이 아니다:
- God
- God's Voice
- Prophet
- Pastor Substitute
- Spiritual Judge
- Final Interpreter of Sin
- Final Interpreter of Scripture

금지:
- AI Revelation / Prophecy
- Faith Score
- Repentance Score
- Prayer Response Rate
- Spiritual Maturity Score
- 구원/용서 상태 판정

- AI는 Reflection Assist만 수행한다.
- AI는 어떤 Record의 Owner도 될 수 없다.
- Private Source를 무동의로 자동 열람하지 않는다.
- Canonical 65는 수정하지 않는다.

## 11. Scripture Policy

- MVP = Book / Chapter / Verse Reference 중심.
- 3 Category: Directly Relevant Scripture / Theme-related Scripture / Reflection Candidate.
- AI는 관련 말씀 Candidate만 제시.
- 확정 계시/확정 해석 표현 금지.
- Full Text는 License 확보 전 HOLD.
- Scripture Retrieval도 HOLD.

금지 Copy:
- `하나님이 지금 이 말씀을 당신에게 주셨습니다.`

허용 방향:
- `이 상황과 함께 살펴볼 수 있는 말씀입니다.`

## 12. Privacy / AI Memory Policy

### AI Memory
- Default OFF.
- Explicit Opt-in 후에만 사용.
- 언제든 중지/삭제 가능.
- Prayer/Repentance 등 민감 기록은 동의 없이 AI Context로 재사용 금지.
- Longitudinal Consent 상세는 HOLD.

### Account Delete
- Private Source는 삭제 절차 진입.
- ShareCopy는 탈퇴 전 유지/삭제를 사용자 선택.
- 법적/운영 로그는 Content와 분리.
- 최소 범위.
- 최대 6개월 보관 가능.

## 13. Minor Policy

- Minor Confession Default = Private.
- Minor Public Sharing = HOLD.
- Age/Protection/Legal Policy 확정 전 Public 공유 허용 여부를 임의 결정하지 않는다.

## 14. State / Permission Policy

- Lifecycle State는 시스템 상태만 의미한다.
- 영적 상태 Enum 금지.
- 금지 이름 예: ANSWERED / FORGIVEN / SAVED / REPENTED / FAITHFUL / SPIRITUALLY_FAILED.
- Exact Lifecycle Enum Naming은 Development Documentation 단계 확정 대상으로 남긴다.
- Moderator는 공유된 Confession/ShareCopy만 검토 가능하고 Private Prayer/Repentance Source 접근 금지.

## 15. OPEN / HOLD Register Link

CANDIDATE / Non-blocking OPEN:
- Moderation Workflow Detail
- Moderator Action Detail
- Exact Lifecycle Enum Naming
- Export 구현 상세
- CRUD 세부 컬럼
- Recovery 상세
- Scripture dedicated Flow 필요 여부

HOLD:
- Minor Public Sharing
- Longitudinal Consent 상세
- Scripture Full Text License/Retrieval
- OpenAI Runtime Binding
- Official Model Run
- RS-AR05-D3
- RS-G10-D1

New Product Meaning Created = 0  
New Theology Rule Created = 0
