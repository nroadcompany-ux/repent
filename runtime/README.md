# REPENT AI Runtime — Candidate Scaffold

> 상태: **CANDIDATE / NOT BOUND**. 자세한 현황·Blocking은
> `docs/ai-runtime/runtime-binding.md`, 실행 방법은
> `docs/ai-runtime/execution-protocol.md` 참조. 이 파일은 요약만 담는다.

## 구성

```
runtime/
  config/runtime.candidate.json   Runtime Binding 후보값
  config/gates.json               G-01~G-10 정의 + AC 번호 매핑
  prompts/system_prompt.v0.1.md   System Prompt (REPENT-SYSTEM-PROMPT-v0.1)
  validators/validator.mjs        REPENT-VGL-VALIDATOR-v0.1 (Rule-based)
  src/provider-client.mjs         Model Provider 호출 (mock / openai)

tests/vgl/
  fixtures/   AC 스키마 + 스모크 테스트 (공식 65 AC 아님 — README 참조)
  runner/     Test Runner + Validator 유닛 테스트
  results/    실행 결과 (Evidence Log)
```

## 빠른 실행

```bash
node tests/vgl/runner/validator.unit.mjs
node tests/vgl/runner/validate-official.mjs       # 공식 65 AC 구조 검증
node tests/vgl/runner/validator-dryrun.mjs        # Validator 단독 진단
node tests/vgl/runner/run.mjs \
  --config runtime/config/runtime.candidate.json \
  --cases tests/vgl/fixtures/smoke-cases.json \
  --provider mock --out tests/vgl/results
```

## 65 AC 원문 반입 완료, 공식 Model Run은 아직

`VGL-RPT-AC-001~065` 원문은 반입·독립 재검증 완료(`tests/vgl/fixtures/`).
다만 이 세션에 Model Provider API Key가 없어 실제 Provider를 호출하는
Official Model Run은 아직 안 했다 — "테스트를 실행하지 않고 PASS 선언"에
해당하는 어떤 결과도 만들지 않는다(지시서 10번 금지 항목 그대로). Validator
단독 진단(모델 호출 없음)은 65건 전부 돌려봤고, 현재 패턴이 대부분의 BLOCK
사례를 못 잡는다는 것을 확인했다 — 자세한 내용은
`docs/ai-runtime/runtime-binding.md`.
