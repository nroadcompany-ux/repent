---
status: CURRENT
version: 1.0-draft
updated: 2026-09-05
owner: REPENT Final Documentation PM
source_type: NORMALIZED_FROM_CANONICAL_PLANNING
---

# 05 정보구조·메뉴구조 / IA & Menu Architecture

> 목적: 승인된 Main Nav, Journey/Today/Search 관계, Confession Shared Surface를 개발·화면 설계가 가능한 IA로 정규화한다. Figma/Legacy Prototype을 근거로 사용하지 않는다.

## 1. Global Navigation / 전역 메뉴

| Level | Menu | Ownership | Entry | Notes | Status | Trace |
|---|---|---|---|---|---|---|
| L1 | 여정 / Journey | Journey | Bottom Navigation | 개인 시간축의 최상위 진입 | CURRENT | FD-REQ-JNY-001 / FD-FTR-JNY-001 |
| L1 | 약속 / Promise | Promise | Bottom Navigation | 사용자 결단 기록 | CURRENT | FD-REQ-PRM-001 / FD-FTR-PRM-001 |
| L1 | 실행 / Action | Action | Bottom Navigation | 실제 행동 기록 | CURRENT | FD-REQ-ACT-001 / FD-FTR-ACT-001/002 |
| L1 | 회개 / Repentance | Repentance | Bottom Navigation | Optional Progressive Flow | CURRENT | FD-REQ-RPN-001 / FD-FTR-RPN-001 |
| L1 | 고백 / Confession | Confession | Bottom Navigation | 선택적 공유 Surface | CURRENT | FD-REQ-CNF-001 / FD-FTR-CNF-001 |

### Locked Navigation Rules
- Main Nav는 **여정 / 약속 / 실행 / 회개 / 고백** 5개다.
- Today는 독립 Tab이 아니다. **Journey의 현재 좌표**다.
- Search는 독립 Bottom Tab이 아니다. **Journey 내부 기능**이다.
- Journey에는 Social/함께 메뉴를 만들지 않는다.
- Community는 독립 대형 Domain이 아니라 **Confession의 Shared/Public Surface**다.

## 2. Journey IA / 여정 정보구조

```text
Journey
├─ Time View
│  ├─ Today
│  ├─ Week
│  ├─ Month
│  ├─ Year
│  └─ All
├─ Life/Faith Record Marker
├─ LifeEvent Reference
├─ Season Reference
├─ StoryArc Reference
├─ TurningPoint
│  ├─ Candidate by AI(optional)
│  └─ Confirm by User(required for final state)
└─ Search / Filter
   ├─ Period
   ├─ Record Type
   ├─ Keyword
   ├─ LifeEvent
   ├─ Season
   └─ StoryArc
```

Rules:
- Missing Day = No Point.
- Interpolation 금지.
- Time Range/LCI/Marker를 Faith Score 또는 영적 단계로 해석하지 않는다.

## 3. Prayer IA / 기도 정보구조

```text
Prayer Entry
├─ Prayer Record
├─ Prayer Only Exit
└─ Optional Extension
   ├─ Reflection
   ├─ Scripture Reference
   ├─ Surrender / Commitment
   ├─ Promise
   └─ Action
```

금지 구조:
- Answered / Pending
- Response Rate / 응답률
- Prayer Success/Failure

## 4. Promise IA / 약속 정보구조

```text
Promise
├─ Promise Record
├─ Optional Source Reference
├─ Action 0..N
└─ User Close = "마무리됨"
```

- Promise 1:N Action.
- Streak 없음.
- Miss = Sin 판정 없음.

## 5. Action IA / 실행 정보구조

```text
Action
├─ Action Record
├─ Done
└─ Follow-up Choice
   ├─ Retry
   ├─ Modify
   ├─ Reschedule
   ├─ Record Only
   └─ Optional Repent
```

금지:
- Failure Cause Taxonomy
- Why-failed mandatory question
- Auto Repent
- Action Failure = Sin

## 6. Repentance IA / 회개 정보구조

```text
Repentance
├─ 돌아보기
├─ 고백하기
├─ Optional Scripture
├─ Optional 돌이킴
├─ Optional Promise
├─ Optional Action
└─ Final CTA: 회개 기록 마치기
```

- Fixed Step 수 없음.
- Progress % 없음.
- Spiritual/Repentance Score 없음.
- `회개 완료` 표현 금지.

## 7. Confession / Shared Surface IA

```text
Confession
├─ Direct Confession
│  ├─ Group / Type
│  ├─ Privacy
│  │  ├─ 나만 보기
│  │  ├─ 이름 가리고 나누기
│  │  └─ 이름 공개로 나누기
│  ├─ Preview
│  └─ Publish
├─ ShareCopy
│  ├─ Select Fields
│  ├─ Mask / Named
│  ├─ Preview
│  └─ Publish Snapshot
└─ Shared/Public Surface
   ├─ Reaction: 공감 1종
   ├─ Report: 4종
   └─ Moderation
      ├─ Policy Boundary = CURRENT
      ├─ Workflow Detail = CANDIDATE
      └─ Moderator Action Detail = CANDIDATE
```

Confession Type: **기도 / 고백 / 은혜 / 일상**.

Social 금지:
- 인기순
- 랭킹
- 영적 비교
- Reaction 기반 Faith Signal
- Anonymous 게시

## 8. Cross-cutting IA

| Capability | Location / IA Rule | Status | Trace |
|---|---|---|---|
| Onboarding | 가입 직후 3개 선택 질문 → 첫 기록 연결 → Main Nav | CURRENT | FD-REQ-ONB-001 |
| Scripture Reference | Prayer/Repentance 등 필요한 Flow의 Optional Reference | CURRENT | FD-REQ-SCR-001 |
| Notification | Promise/Action 설정 Context 안 | CURRENT | FD-REQ-NOT-001 |
| Account Delete | Account/Settings Context | CURRENT | FD-REQ-ACC-001 |
| Export | Account/Data Context | CURRENT / LOW PRIORITY | FD-REQ-EXP-001 |
| AI Memory | AI/Privacy Setting Context | CURRENT / DETAIL HOLD | FD-REQ-MEM-001 |

## 9. IA Prohibitions / 정보구조 금지사항

1. Today 독립 Bottom Tab 생성 금지.
2. Search 독립 Bottom Tab 생성 금지.
3. Journey Social/함께 메뉴 생성 금지.
4. Prayer Response Tracking 메뉴/상태/통계 생성 금지.
5. Failure Cause 메뉴/설문 생성 금지.
6. Repentance Fixed Step Navigator/Progress Menu 생성 금지.
7. Faith/Repentance/Prayer Response/Spiritual Maturity Ranking 생성 금지.
8. Community를 별도 대형 Domain으로 확장 금지.

## 10. Trace Forward

`FD-REQ-* → FD-FTR-* → US-RPT-* / AC-* → 05 IA → 07 Flow → 08 Screen Specification`.

New Product Meaning Created = 0  
New Theology Rule Created = 0
