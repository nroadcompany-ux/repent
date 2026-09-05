---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 07 사용자·서비스 흐름 / Service Flow & Process

> 목적: 승인된 Canonical Flow를 사용자/시스템/권한 경계 기준으로 개발 가능한 E2E Process로 정규화한다. Screen은 아직 정의하지 않으며 Figma를 사용하지 않는다.

## 1. Journey Flow

```text
Entry
→ Time Range 선택 (Today / Week / Month / Year / All)
→ Life Curve + Record Marker 표시
→ LifeEvent / Season / StoryArc 조회
→ TurningPoint Candidate(optional AI)
→ User Confirm
→ Source Record 열람
→ Journey Return
```

Rules:
- Missing Day = No Point.
- Interpolation 금지.
- AI Candidate만으로 TurningPoint 확정 금지.
- Today는 Journey 내부 현재 좌표.

Trace: FD-REQ-JNY-001/002 → FD-FTR-JNY-001/002 → US-RPT-JNY-001/002.

## 2. Journey Search / Filter Flow

```text
Journey
→ Search / Filter Open
→ 조건 선택
   ├─ 기간
   ├─ 기록 종류
   ├─ 키워드
   ├─ LifeEvent
   ├─ Season
   └─ StoryArc
→ Result
→ Source Record Open
→ Journey Return
```

- 독립 Bottom Tab 생성 금지.
- 검색 결과에서 원본 Record Owner/Permission을 변경하지 않는다.

Trace: FD-REQ-SEA-001 → FD-FTR-SEA-001 → US-RPT-SEA-001.

## 3. Prayer Flow

```text
Prayer Entry
→ Prayer 작성
→ [Prayer Only Exit] ───────────────→ Save → Return
       또는
→ Optional Reflection
→ Optional Scripture Reference
→ Optional Surrender / Commitment
→ Optional Promise
→ Optional Action
→ Save
→ Return
```

Negative Flow:
- Answered/Pending 입력 단계 없음.
- Response Tracking/Rate 단계 없음.
- Optional 단계를 강제하지 않는다.

Trace: FD-REQ-PRY-001 → FD-FTR-PRY-001 → US-RPT-PRY-001/002.

## 4. Promise Flow

```text
Promise Entry
→ Promise 작성
→ Optional Source Reference
→ Save
→ Action 0..N 연결
→ 사용자 선택 종료: "마무리됨"
→ Return
```

- Miss ≠ Sin.
- Streak 없음.

Trace: FD-REQ-PRM-001 → FD-FTR-PRM-001 → US-RPT-PRM-001.

## 5. Action Flow

### 5.1 Done
```text
Action Entry
→ Action 작성/열람
→ Done
→ Return
```

### 5.2 Planned Outcome과 다름
```text
Action Entry
→ 계획과 다름
→ Follow-up Choice
   ├─ Retry
   ├─ Modify
   ├─ Reschedule
   ├─ Record Only
   └─ Optional Repent
→ 선택 결과 기록
→ Return
```

Forbidden Process:
- Failure Cause 질문/분류.
- Auto Repent.
- Failure = Sin 판정.

Trace: FD-REQ-ACT-001 → FD-FTR-ACT-001/002 → US-RPT-ACT-001/002.

## 6. Repentance Flow

```text
Repentance Entry
→ 돌아보기
→ 고백하기
→ Optional Scripture
→ Optional 돌이킴
→ Optional Promise
→ Optional Action
→ "회개 기록 마치기"
→ Save
→ Return
```

Rules:
- Optional Progressive Flow.
- Fixed Step 수/Progress % 없음.
- 회개 진정성/충분성 판정 없음.
- `회개 완료` 문구 없음.

Trace: FD-REQ-RPN-001 → FD-FTR-RPN-001 → US-RPT-RPN-001/002.

## 7. Direct Confession Flow

```text
Confession Draft
→ Group / Type 선택
→ Privacy 선택
   ├─ 나만 보기
   ├─ 이름 가리고 나누기
   └─ 이름 공개로 나누기
→ Preview
→ User Publish Confirm
→ Publish
→ Return
```

- Type = 기도 / 고백 / 은혜 / 일상.
- Anonymous 옵션 금지.
- 자동 공유 금지.

Trace: FD-REQ-CNF-001 → FD-FTR-CNF-001 → US-RPT-CNF-001.

## 8. Private Source ShareCopy Flow

```text
Private Source (Prayer / RepentanceRecord 등)
→ Share 선택
→ Select Fields
→ Mask / Named 선택
→ Preview
→ User Confirm
→ ShareCopy Snapshot 생성
→ Publish to Confession Surface
→ Return
```

Rules:
- Source Edit ≠ ShareCopy Auto Edit.
- Source Delete ≠ ShareCopy Auto Delete.
- ShareCopy Delete ≠ Source Delete.

Trace: FD-REQ-CNF-001 → FD-FTR-SHR-001 → US-RPT-SHR-001.

## 9. Source Delete → ShareCopy Decision Flow

```text
Private Source
→ Delete 선택
→ 연결된 ShareCopy 목록 제시
→ User Choice
   ├─ Source만 삭제 / ShareCopy 유지
   └─ Source + 선택 ShareCopy 삭제
→ Confirm
→ Execute
→ Return
```

- 시스템이 ShareCopy를 자동으로 일괄 삭제하거나 자동 유지로 확정하지 않는다.

Trace: FD-REQ-DEL-001 → FD-FTR-SHR-002 → US-RPT-SHR-002.

## 10. Community Reaction Flow

```text
Shared Confession / ShareCopy View
→ 공감
→ Reaction State 반영
→ Stay / Return
```

- Reaction 1종만.
- Reaction Count를 Faith Signal/Ranking으로 변환 금지.

Trace: FD-REQ-COM-001 → FD-FTR-COM-001 → US-RPT-MOD-002.

## 11. Report Intake Flow

```text
Shared Confession / ShareCopy View
→ 신고
→ 4종 사유 선택
   ├─ 개인정보 노출
   ├─ 괴롭힘·혐오
   ├─ 스팸·광고
   └─ 기타 안전 문제
→ Submit
→ 접수 상태 반환
→ Return
```

- Spiritual Judgment 신고사유 금지.
- 이후 Moderation Workflow Detail은 CANDIDATE이므로 이 문서에서 임의 연결하지 않는다.

Trace: FD-REQ-COM-001/002 → FD-FTR-COM-002 / MOD-001 → US-RPT-MOD-003 / AC-G07-01~05.

## 12. Moderation Boundary Process

```text
Report/Shared Content
→ Moderator는 Shared Confession/ShareCopy만 조회
→ Content/Behavior Policy 기준 검토
→ [Detailed Workflow = CANDIDATE]
```

Hard Boundary:
- Private Prayer/Repentance Source 접근 금지.
- Moderation 결과를 죄/회개/구원/용서/하나님 관계 판정으로 표현 금지.

## 13. Onboarding Flow

```text
가입 완료
→ 3개 진입 질문 제시
   1. 오늘 하나님께 듣고 싶은 말씀이 있나요? 또 하고 싶은 말은요?
   2. 하나님께 마음을 드리고 있나요? 어떤 동행을 꿈꾸세요?
   3. 하나님과 약속한 것이 있나요? 그 약속은 잘 지켜지고 있나요?
→ Answer 또는 Skip
→ 관련 첫 기록 진입 유도
→ Main Nav
```

- 5개 메뉴 전체 Tutorial 강제 금지.
- 질문 응답 강제 금지.

Trace: FD-REQ-ONB-001 → FD-FTR-ONB-001 → US-RPT-ONB-001.

## 14. Notification Flow

```text
Promise 또는 Action
→ User Reminder 설정
→ 설정 조건 도달
→ Reminder 발송
→ 해당 Promise/Action Context 진입
```

- Prayer/Repentance Nudge 없음.
- 죄책감/영적 압박 문구 없음.

Trace: FD-REQ-NOT-001 → FD-FTR-NOT-001 → US-RPT-NOT-001.

## 15. Account Delete Flow

```text
Account Delete Entry
→ Private Source 삭제 절차 안내
→ ShareCopy 목록 제시
→ 유지/삭제 User Choice
→ Final Confirm
→ Private Source 처리
→ ShareCopy 선택 처리
→ 법적/운영 로그 분리·최소 범위 보관(최대 6개월)
→ Account Delete Result
```

- 자동 ShareCopy 일괄 삭제/유지 금지.

Trace: FD-REQ-ACC-001 → FD-FTR-ACC-001 → US-RPT-ACC-001.

## 16. Export Flow

Status: CURRENT / LOW PRIORITY.

```text
Account/Data Context
→ Export Request
→ [Implementation Detail = OPEN]
```

- Product Scope 포함은 CURRENT.
- Export format/job/retry/recovery 상세를 여기서 새로 결정하지 않는다.

Trace: FD-REQ-EXP-001 → FD-FTR-EXP-001 → US-RPT-ACC-002.

## 17. AI Memory Flow

Current Product Policy:
```text
Default OFF
→ User Explicit Opt-in
→ [Approved Context 범위 내 사용]
→ User Stop / Delete 가능
```

Runtime Phase A:
```text
Memory OFF
→ Longitudinal Consent Gate HOLD
→ Approved 전 ON 전환 금지
```

- Sensitive Prayer/Repentance Context의 무동의 재사용 금지.
- 세부 Consent Flow는 HOLD.

Trace: FD-REQ-MEM-001 → FD-FTR-MEM-001 → US-RPT-MEM-001.

## 18. Scripture Reference Flow

```text
Domain Optional Scripture Entry
→ Reference Candidate 제시
→ Book / Chapter / Verse 표시
→ User가 참고
→ Domain Flow Return
```

- AI는 Candidate만 제시.
- Full Text License/Retrieval = HOLD.
- Dedicated Scripture Flow 필요 여부 = OPEN, non-blocking.

Trace: FD-REQ-SCR-001 → FD-FTR-SCR-001 → US-RPT-SCR-001/002.

## 19. Empty / Error Common Process

```text
Operation
→ Technical Empty/Error
→ Technical Message
→ Retry / Return
```

- Empty/Error를 영적 평가로 변환 금지.

## 20. Flow Trace Status

CURRENT 범위:
`Requirement → Feature → Story/Task/AC → IA → Policy → Flow` 연결 유지.

Intentional non-blocking gaps:
- Moderation Workflow Detail = CANDIDATE.
- Moderator Action Detail = CANDIDATE.
- Export 구현 상세 = OPEN.
- AI Longitudinal Consent 상세 = HOLD.
- Scripture dedicated Flow 필요 여부 = OPEN.

다음 연결 대상:
`09 Data/State/Permission → 08 Screen Specification`.

New Product Meaning Created = 0  
New Theology Rule Created = 0
