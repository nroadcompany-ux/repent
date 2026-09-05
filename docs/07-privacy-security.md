---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 07 Privacy Security

> 상태: OPEN — 작성 중 (아래는 Owner/PM 확정 Canonical Decision만 반영. 미확정 영역은 계속 OPEN)

## Confession Privacy (Owner Lock)

공개 설정은 다음 3옵션만 존재한다:
1. 나만 보기
2. 이름 가리고 나누기
3. 이름 공개로 나누기

**Anonymous(익명) 옵션은 금지한다.** "이름 가리고 나누기"는 익명이 아니라 이름 표시를 선택적으로 가리는 것이며, 시스템 내부적으로는 작성자가 항상 식별 가능해야 한다.

## Confession 데이터 처리

- Direct Confession = Live Reference / ShareCopy = Snapshot 규칙은 `05-data-model.md` 참조

## Longitudinal Context / Sensitive Repentance Context — HOLD (2026-09-05)

**이 세션에서 결정한 것 없음 — 기존에 이미 OFF/HOLD였던 상태를 정리해
기록만 한다.**

- **Longitudinal AI Memory = OFF** (Runtime Phase A 확정 —
  `runtime/config/runtime.candidate.json`의 `memory: "OFF"`,
  `docs/ai-runtime/execution-protocol.md`의 Phase A/B/C 구분 참조).
  Phase C(+ Approved Memory Context)로 넘어가려면 Privacy/Consent
  Boundary가 먼저 확정돼야 한다 — 순서를 바꾸지 않는다
- **Sensitive Repentance Memory = Restricted/User-controlled** (Product
  Foundation 원칙 — 자동 Recall 금지, 사용자가 직접 통제)
- Longitudinal AI Privacy/Consent Boundary 자체(어떤 데이터를 얼마나
  오래, 어떤 동의 하에 보관·재사용할지)는 **여전히 미확정** — Notion
  `REPENT PM Working Hub`에 "Current Production Blockers"로 반복
  명시돼 있음

## Consent Gate — Specification (미결정 상태 그대로 기록)

**Gate가 무엇을 확인해야 하는지 미리 정의만 해둔다 — Gate를 통과시키는
결정 자체는 이 세션에서 하지 않는다.** Phase C 진입 전 최소 아래를
Owner/Legal이 확정해야 한다:

1. 어떤 데이터가 "Longitudinal/Sensitive Context"에 해당하는지 범위 정의
2. 사용자 동의 수집 시점(가입 시 / 기능 사용 시점 / 옵트인)
3. 동의 철회 시 기존 저장 데이터 처리(즉시 삭제 vs 보존 후 미사용)
4. 미성년 사용자에 대한 별도 동의 요건(Minor Safety Gate와 연동,
  `08-social-safety.md` 참조)
5. 동의 상태를 Runtime이 실제로 참조할 수 있는 저장 위치(DB/API — 아직
  설계 안 됨, Product Foundation의 "실제 DB/API/Prompt Binding = HOLD"
  참조)

## Memory OFF until Approved (재확인, 되돌리지 말 것)

Runtime Candidate(`REPENT-AI-RUNTIME-001`)는 Phase A 구성이며 Memory /
Longitudinal Context / Sensitive Context / Personalization이 전부
`OFF`다. **이 Gate들이 위 Consent Gate·Minor Safety Gate를 통과하기
전까지 Runtime Config의 이 값들을 켜지 않는다** — 코드에서 임의로
`ON`으로 바꾸는 것은 신규 Product Meaning을 만드는 것과 같은 무게로
취급한다.

(그 외 세부 보안 정책은 추후 업데이트)
