---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 02 User Flow

> 상태: OPEN — 작성 중 (아래 E2E Flow 7종은 Owner/PM 확정 Planning을
> 반영한 것 — 신규 설계 아님. Figma/Screen 화면 설계는 이 문서
> 확정 이후 별도 진행하며, 여기서는 다루지 않는다)

## A. Journey

```
Entry
→ Time Range 선택 (Today / Week / Month / Year / All)
→ Life Curve + Faith Record Marker 표시
→ LifeEvent / Season / StoryArc 조회
→ TurningPoint (User Confirm — AI는 후보만 제안)
→ Source Record 열람
→ Journey Return
```

Time Range는 Time Metadata일 뿐 영적 단계가 아니다. Missing Day(무입력)는
보간 없이 점을 찍지 않는다(`04-policy-business-rules.md` Missing Day
Rule).

## B. Prayer

```
Entry
→ Prayer 작성
→ Prayer Only Exit 가능 (기도만 기록하고 종료)
→ Optional Reflection
→ Optional Scripture
→ Optional Surrender / Commitment
→ Optional Promise
→ Optional Action
→ Save
→ Return
```

응답(Answered/Pending/Response Rate) 추적 없음(`04-policy-business-rules.md`
Prayer Response Tracking).

## C. Promise

```
Entry
→ Promise 작성
→ Source Reference(선택 — Prayer/Repentance 등에서 이어질 수 있음)
→ Save
→ Action 0..N (Promise 1:N Action)
→ 사용자 선택 마무리 ("마무리됨")
→ Return
```

Promise Miss(약속 미이행)는 Sin 판정이 아니다. Streak(연속 기록)
카운트를 두지 않는다.

## D. Action

```
Entry
→ Action
→ Done
```

또는:

```
Retry
Modify
Reschedule
Record Only
Optional Repent
```

**Failure Cause(실패 원인) 질문 금지** — 시스템이 "왜 실패했는가"를
분류·질문하지 않고, 다음에 무엇을 할지(Follow-up Action Choice)만
묻는다. Action Failure ≠ Sin.

## E. Repentance

```
Entry
→ 돌아보기
→ 고백하기
→ Optional Scripture
→ Optional 돌이킴
→ Optional Promise
→ Optional Action
→ 회개 기록 마치기
→ Return
```

고정 Step 수·진행률(%)·점수를 표시하지 않는다(Optional Progressive
Flow). 완료 문구는 "하나님께 드린 회개를 기록했습니다" — "회개
완료"라는 표현은 쓰지 않는다.

## F. Confession Direct

```
Draft
→ Group / Type 선택
→ Privacy(3옵션 — 나만 보기 / 이름 가리고 나누기 / 이름 공개로 나누기)
→ Preview
→ Publish
```

Anonymous(익명) 게시는 금지 — Masked Display(이름 가리기)만 허용.

## G. Private Source Share

```
Private Source (Prayer / RepentanceRecord 등)
→ Select Fields
→ Mask / Named
→ Preview
→ ShareCopy 생성
→ Publish
```

ShareCopy = Snapshot. Source 수정은 ShareCopy를 자동 수정하지 않고,
Source 삭제는 ShareCopy를 자동 삭제하지 않으며, ShareCopy 삭제는
Source를 삭제하지 않는다(`05-data-model.md` 참조).

(화면 단위 상세 Flow는 Product Documentation Lock 이후 별도 진행)
