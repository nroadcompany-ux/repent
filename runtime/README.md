# REPENT AI Runtime — Candidate Scaffold

> 상태: **CANDIDATE / NOT BOUND**. 자세한 현황·Blocking은
> `docs/ai-runtime/runtime-binding.md`, 실행 방법은
> `docs/ai-runtime/execution-protocol.md` 참조. 이 파일은 요약만 담는다.

## 구성

```
runtime/
  config/runtime.candidate.json   Runtime Binding 후보값
  config/gates.json               G-01~G-10 정의 + AC 번호 매핑 + validator_rule_ids(v0.2)
  config/ar-rules.json            AR-01~06 정의 + Gate/Validator 매핑
  config/source/ar-01-06.owner-approved.json  AR-01~06 Owner 승인 원본
  prompts/system_prompt.v0.1.md   System Prompt (REPENT-SYSTEM-PROMPT-v0.1)
  validators/validator.mjs        현재 기본(v0.2 re-export)
  validators/validator.v0.1.mjs   REPENT-VGL-VALIDATOR-v0.1 (History, 삭제 금지)
  validators/validator.v0.2.mjs   REPENT-VGL-VALIDATOR-v0.2 (Gate 기반)
  src/provider-client.mjs         Model Provider 호출 (mock / openai)

tests/vgl/
  fixtures/   공식 65 AC + 스모크 + Robustness Set(NON-CANONICAL)
  runner/     Test Runner + 검증/Regression 스크립트 + 유닛 테스트
  results/    실행 결과 (Evidence Log)
```

## 빠른 실행

```bash
node tests/vgl/runner/validator.v0.2.unit.mjs           # 현재 기본 Validator 유닛 테스트
node tests/vgl/runner/validate-official.mjs             # 공식 65 AC 구조 검증
node tests/vgl/runner/validator-v2-regression.mjs       # Canonical 65 Regression + Robustness Set
node tests/vgl/runner/run.mjs \
  --config runtime/config/runtime.candidate.json \
  --cases tests/vgl/fixtures/smoke-cases.json \
  --provider mock --out tests/vgl/results
```

## 현재 상태 요약

- 65 AC 원문 반입·독립 재검증 완료.
- Validator v0.2(Gate 기반)로 재설계: Canonical 65 Regression 61/65,
  REWRITE·HUMAN_REVIEW·SCRIPTURE_CHECK 100% 커버.
- **단, Robustness Set(Canonical과 다른 어휘 54건)에서 Dangerous 27건 중
  26건 미탐** — 실제 일반화는 아직 부족함을 확인. 반응적 패턴 추가로
  메우지 않았다(암기와 같아짐).
- Model Provider API Key 없어 Official Model Run은 아직 미실행 —
  "테스트를 실행하지 않고 PASS 선언" 금지 원칙 유지.

자세한 내용은 `docs/ai-runtime/runtime-binding.md`.
