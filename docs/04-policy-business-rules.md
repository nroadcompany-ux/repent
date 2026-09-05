---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 04 Policy Business Rules

> 상태: OPEN — 작성 중 (아래는 Owner/PM 확정 Canonical Decision만 반영. 미확정 영역은 계속 OPEN)

## LCI (Life Condition Indicator)

- 5단계 Check (매우 힘듦 / 힘듦 / 보통 / 좋음 / 매우 좋음)
- No AI Judgment — AI가 판정하거나 점수로 환산하지 않는다
- 점수·신앙 수준으로 환산하지 않는다
- No Drag — Drag 방식은 Research Only, 정식 화면에서 제공하지 않는다 (HOLD)

## Missing Day Rule

- No Input = No Point — 기록하지 않은 날은 그래프에 점을 찍지 않는다
- 보간(사이 값 추정) 금지, 시스템이 상태를 추정하거나 채우지 않는다

## Turning Point

- MVP = User 직접 지정 — 사용자가 직접 표시한다
- AI는 후보만 제안 가능("이 시기를 중요한 순간으로 표시할까요?") — 시스템이 "이때가 전환점입니다"라고 판정 금지

## Promise (약속)

- No Streak — 연속 기록 카운트 없음
- No Faith Score — 신앙 점수화 없음
- 지키지 못한 약속을 시스템이 죄로 판단하지 않는다

## Prayer Response Tracking (2026-09-05, Owner/PM 확정)

- **REMOVED** — 응답됨(answered) 상태, 응답 대기(pending) 상태, 응답률/통계
  기능 전부 두지 않는다
- 기도 기록 자체(내용 저장)는 유지하되, "이 기도가 응답됐는가"를 시스템이
  추적·집계·표시하지 않는다

## Journey "함께" (2026-09-05, Owner/PM 확정)

- **REMOVED** — Journey는 **개인 시간축**이다. 여러 사용자가 함께 보는
  Journey/그래프 화면을 두지 않는다
- Social/공유 표면은 **Confession으로 일원화** — 다른 사람과 나누는 것은
  전부 Confession(및 그 Privacy 3옵션) 경로를 통해서만 이뤄진다

## Action Failure (2026-09-05, Owner/PM 확정)

- Action Failure 발생 시 사용자에게 제시하는 것은 **Follow-up Action
  Choice**다(원인 분류가 아니다):
  - Retry(다시 시도)
  - Modify(약속/계획 수정)
  - Reschedule(일정 재조정)
  - Record Only(그냥 기록만 하고 종료)
  - Optional Repent(선택적으로 회개로 이어가기)
- **Failure Cause Taxonomy(실패 원인 분류 체계) 생성 금지** — "왜
  실패했는가"를 시스템이 분류·질문하지 않는다. 사용자가 다음에 무엇을
  할지(Follow-up Action)만 묻는다
- **Action Failure ≠ Sin** — 실행이 계획과 달랐다는 것을 시스템이 죄로
  판단하지 않는다(Promise 원칙과 동일선상)
- **⚠ 기존 Artifact와의 충돌 확인됨 — Correction Required**:
  `prototype/index.html`의 `s-action-fail` 화면(af1~af6, "감정이 먼저
  앞섰어요"/"그 순간 다른 선택을 했어요"/"일부만 실천했어요"/"실천할
  상황이 없었어요"/"계획이 현실적이지 않았어요"/"잊었어요")은 위에서
  금지한 **Failure Cause Taxonomy 그 자체**다. 이 화면은 이번 결정
  이전에 만들어진 구버전 구조이며, 새 Follow-up Action Choice(Retry/
  Modify/Reschedule/Record Only/Optional Repent) 구조로 교체가
  필요하다 — **prototype 코드를 이번 라운드에서 임의로 고치지 않았다**
  (PM 지시 범위 밖 작업 확대 금지 원칙), Correction 작업은 별도 P0로
  `docs/REPENT-MASTER-HANDOFF.md`에 기록만 해둔다

## Repentance — Fixed 10-Step (2026-09-05, Owner/PM 확정)

- **REMOVED** — 고정 10단계, 진행률(%) 표시를 두지 않는다
- **Optional Progressive Flow** — 단계는 있을 수 있으나 고정 개수·강제
  진행률이 아니라 선택적으로 진행 가능한 흐름이어야 한다
- **Final CTA = "회개 기록 마치기"** — 현재 `prototype/index.html`
  `s-repent-done`의 버튼 텍스트("회개 기록 마치기")가 이미 이 표현과
  일치함을 확인(교정 불필요)
- **"회개 완료"라는 표현 금지** — 시스템이 회개의 완결성을 선언하는
  것으로 읽히는 어떤 문구도 사용하지 않는다(AR-04/G-04, 회개 진정성
  판정 금지 원칙과 정합)

(그 외 세부 규칙은 추후 업데이트)
