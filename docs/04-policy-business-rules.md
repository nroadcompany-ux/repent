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

(그 외 세부 규칙은 추후 업데이트)
