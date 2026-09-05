---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 10 Decision / Open / Hold Register

> 상태: OPEN — 이 문서 자체가 "무엇이 결정됐고 무엇이 아직인지"를 추적하는
> 용도라 전체 status는 항상 OPEN으로 둔다(레지스터가 비어있지 않다고
> "완료"가 아님). 각 행의 상태만 개별적으로 CURRENT/HOLD/OPEN이다.

`PASS`/`NOT RUN`/`HOLD`의 정의는 `09-acceptance-criteria.md` 참조 —
이 표에서도 동일하게 쓴다.

## Core Register (PM 지시 최소 항목, 2026-09-05)

| 항목 | 상태 | 근거/참조 |
|---|---|---|
| Validator v0.2 | **PASS** (Engineering) | Canonical 65 = 65/65, Robustness = 52/54 — `docs/ai-runtime/runtime-binding.md` |
| API Binding | **HOLD** | `OPENAI_API_KEY` 미설정(확인 완료, 값 미기록) |
| Provider Smoke | **NOT RUN** | Runner 존재, API Key 대기 |
| Official 65 | **NOT RUN** | 위와 동일 사유 |
| G-07 | **EVIDENCE COMPLETE / PRODUCT POLICY PASS** | 2026-09-05 PM 승인 — AC-G07-01~05가 CANDIDATE→CURRENT/CANONICAL PRODUCT POLICY AC로 전환됨(`09-acceptance-criteria.md`). VGL-RPT-AC-001~065와는 계속 별도 집계 |
| Privacy/Consent | **HOLD** | Longitudinal/Sensitive Memory Owner 결정 필요 — `07-privacy-security.md` |
| Minor Safety | **HOLD** | Owner/Legal 결정 필요 — `08-social-safety.md` |
| ShareCopy Delete | **HOLD** | 원칙(Delete≠Source Delete)은 Owner Lock 기확정(`05-data-model.md`), Production 구현 확인은 HOLD |
| Scripture License | **HOLD** | 우리말성경 Full Text License 미확보(외부 계약 사안, 엔지니어링 범위 밖) |
| Scripture Retrieval | **HOLD** | License 확보 전까지 Phase B 진입 불가 |
| Production Release | **HOLD** | 위 항목 전부 해소 전까지 유지 |

## 이미 해결된 항목 (참고용 — Core Register와 별도)

레지스터의 완전성을 위해 이미 Resolved된 항목도 함께 남긴다(Core
Register 위 표와 혼동 방지를 위해 별도 구획):

| 항목 | 상태 | 근거 |
|---|---|---|
| AC Canonical Source Import | RESOLVED | `tests/vgl/fixtures/ac-cases.official.json`, 독립 재검증 완료 |
| AR-01~06 정의 | RESOLVED | `runtime/config/source/ar-01-06.owner-approved.json` |
| G-01~G-10 정의 | RESOLVED | `runtime/config/gates.json` |
| Confession Privacy 3옵션 | RESOLVED (Owner Lock) | `07-privacy-security.md` |
| Main Nav / Vertical Way | RESOLVED (Owner Lock) | `00-product-foundation.md` |

## 갱신 규칙

이 문서는 PM이 명시적으로 상태 변경을 지시한 경우에만 갱신한다. Claude가
임의로 HOLD를 RESOLVED로, OPEN을 CANDIDATE→CONFIRMED로 바꾸지 않는다.
