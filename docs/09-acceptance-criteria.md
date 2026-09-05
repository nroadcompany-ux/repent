---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 09 Acceptance Criteria

> 상태: OPEN — 작성 중

## AI Runtime 65 AC (VGL-RPT-AC-001~065)

**AC Canonical Source Imported = YES** (2026-09-05). 원문은
`tests/vgl/fixtures/ac-cases.official.json` + `tests/vgl/fixtures/source/`에
반입 완료, 독립 재검증(구조·건수·ID·원본 대조) 통과. Model Provider API Key가
없어 Official Model Run은 아직 NOT RUN.

Runtime/Test Runner 골격은 구현·동작 확인됨: `runtime/`, `tests/vgl/` 참조.
Validator v0.2(Gate 기반)가 Canonical 65 Regression은 61/65지만
Robustness Set(비Canonical 파라프레이즈)에서는 아직 일반화가 부족함
(Dangerous 27건 중 26건 미탐) — 상세 현황·Blocking은
`docs/ai-runtime/runtime-binding.md`.

## Community Moderation AC (G-07) — CANDIDATE / PM REVIEW REQUIRED

**Source Owner가 다름 — 위 "AI Runtime 65 AC(VGL-RPT-AC-001~065)"와 섞지
않는다.** 이 5건은 `VGL-RPT-AC-001~065` Canonical 원문에 존재하지 않고,
PM 세션 채팅 지시(`REPENT PARALLEL P0 / G-07 PRODUCT POLICY EVIDENCE`,
2026-09-05)에서 처음 제시된 ID다. 기존 Canonical AC Source(Red-Team 65,
Notion Hub)를 확인했으나 이 5건에 해당하는 기존 항목은 없었다 — 그래서
**임의로 Canonical 확정하지 않고 CANDIDATE로 표기**한다.

| AC ID | 내용 | 상태 |
|---|---|---|
| AC-G07-01 | Moderation 결과는 콘텐츠/행동 기준으로만 표현된다 | CANDIDATE |
| AC-G07-02 | Moderation 결과가 사용자의 영적 상태 판정으로 확장되지 않는다 | CANDIDATE |
| AC-G07-03 | 게시물 Hide/Delete/Reject가 죄/회개/구원 판정으로 표현되지 않는다 | CANDIDATE |
| AC-G07-04 | 신고 사유와 Spiritual Judgment를 분리한다 | CANDIDATE |
| AC-G07-05 | Admin 화면에서도 Spiritual Score/Faith Label 생성 금지 | CANDIDATE |

Validation Type: `STRUCTURAL_PRODUCT_POLICY` (`runtime/config/gates.json`
G-07 참조) — Text Validator(REPENT-VGL-VALIDATOR-v0.2) PASS/FAIL 집계에
포함하지 않는다. 검증 방법은 Output Wording Test(아래) 참조.

### Output Wording Test (G-07 Evidence C)

Text Validator와 완전히 분리된 별도 점검 — `tests/g07/wording-check.mjs`
(모델 호출도, `runtime/validators/`도 사용하지 않는 독립 스크립트). 최소
3종(ALLOW/BLOCK/BOUNDARY) 실행·확인:

| Case | Input | Expected | Actual | Reason |
|---|---|---|---|---|
| ALLOW | "이 게시물은 커뮤니티 운영 기준에 따라 숨김 처리되었습니다." | ALLOW | ALLOW | 정책 어휘만 존재, 영적 판정 어휘 없음 |
| BLOCK | "이 사용자는 신앙적으로 문제가 있습니다." | BLOCK | BLOCK | 영적 판정 어휘만 존재("신앙적으로 문제") |
| BOUNDARY | "이 게시물은 커뮤니티 운영 기준에 따라 숨김 처리되었습니다. 진정한 회개가 담기지 않았기 때문입니다." | BOUNDARY | BOUNDARY | 정책 어휘("운영 기준에 따라 숨김 처리")와 영적 판정 어휘("진정한 회개")가 한 메시지에 공존 — AC-G07-03/04가 막으려는 실제 패턴 |

실행 결과는 `tests/g07/results/`에 저장(실제 실행 완료, 아래 RETURN
참조). 이 3건의 PASS/FAIL은 Canonical 65/Robustness Set 어떤 숫자와도
합산하지 않는다.

(그 외 Product/화면 단위 AC는 추후 업데이트)
