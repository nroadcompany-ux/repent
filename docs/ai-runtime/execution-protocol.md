---
status: OPEN
version: 0.1
updated: 2026-09-05
---

# REPENT AI Runtime — Execution Protocol

> 목적 문서. Runtime을 실제로 어떻게 돌리는지, Phase를 어떻게 나누는지만
> 다룬다. Product/Theology 결정은 다루지 않는다(전부 Owner Lock 문서 참조).

## 디렉토리

```
runtime/
  README.md                     실행 방법 요약
  config/
    runtime.candidate.json      Runtime Binding 필드 (Candidate)
    gates.json                  G-01~G-10 정의 + AC 번호 매핑 + Rule 매핑
  prompts/
    system_prompt.v0.1.md       System Prompt 원문
    system_prompt.v0.1.sha256.txt
    MANIFEST.json               Canonical ID → 파일 경로
  validators/
    validator.mjs                REPENT-VGL-VALIDATOR-v0.1 (Rule-based)
  src/
    provider-client.mjs          Model Provider 호출 추상화 (mock / openai)

tests/vgl/
  fixtures/
    ac-cases.schema.json         공식 AC 파일이 지켜야 할 스키마
    smoke-cases.json             자체 제작 스모크 테스트 5건 (공식 아님)
    README.md                    AC 원문 확보 상태·절차
  runner/
    run.mjs                      CLI Test Runner
    validator.unit.mjs           Validator 유닛 테스트
  results/
    run-*.jsonl                  실행별 Evidence Log
    run-*.summary.json           실행별 요약(집계)
```

## Phase 진행 순서 (01번 지시서 6번 그대로)

- **Phase A** — Base AI + VGL only. Scripture/Memory/Personalization 전부 OFF.
  지금 이 Runtime Candidate가 Phase A 구성이다.
- **Phase B** — + Scripture Retrieval (Approved Source만, License/Permission
  Gate 통과 후). 아직 시작 안 함.
- **Phase C** — + Approved Memory Context (Privacy/Consent 통과 후). 아직
  시작 안 함.

각 Phase 결과는 분리 기록하고, 한 Runtime에 기능을 섞지 않는다.

## 실행 명령

```bash
# 유닛 테스트
node tests/vgl/runner/validator.unit.mjs

# 스모크 테스트 (mock provider, 공식 AC 아님)
node tests/vgl/runner/run.mjs \
  --config runtime/config/runtime.candidate.json \
  --cases tests/vgl/fixtures/smoke-cases.json \
  --provider mock \
  --out tests/vgl/results

# 공식 실행 (AC 원문 + API Key 확보 후에만)
OPENAI_API_KEY=sk-... node tests/vgl/runner/run.mjs \
  --config runtime/config/runtime.candidate.json \
  --cases tests/vgl/fixtures/ac-cases.official.json \
  --provider openai \
  --official \
  --out tests/vgl/results
```

`--official` 플래그는 mock provider를 거부한다 — 실제 Provider 없이 공식
평가로 오인될 결과가 나오는 것을 코드 레벨에서 막기 위함.

## G-01~G-10 (PM 확정, Source: 세션 채팅 — `runtime/config/gates.json`에 원문 인용)

| Gate | 의미 |
|---|---|
| G-01 | 하나님의 음성 대행 차단 |
| G-02 | 개인 하나님의 뜻 선언 차단 |
| G-03 | 개인 죄 최종 판정 차단 |
| G-04 | 회개 진정성 판정 차단 |
| G-05 | 개인 용서·구원 선언 차단 |
| G-06 | AI 계시·예언 차단 |
| G-07 | Community Rule / Spiritual Judgment 분리 (구조적 — Validator 범위 밖) |
| G-08 | 죄책감 기반 Push / Retention 차단 (텍스트 부분만 Validator 커버) |
| G-09 | Faith / Repentance Score화 차단 |
| G-10 | Sensitive State 영적 원인 단정 차단 |

새 Gate를 여기서 만들지 않는다. G-01~G-10 외 새로운 판정축이 필요하다고
판단되면 PM/Owner Escalation.

## AC 원문 반입 절차

1. PM이 `VGL-RPT-AC-001~065` 원문을 `tests/vgl/fixtures/ac-cases.schema.json`
   스키마에 맞춰 `ac-cases.official.json`으로 전달 (각 항목 `source` 필드 필수).
2. Claude/개발팀은 원문을 기억이나 추정으로 재작성하지 않는다 — 전달받은
   파일을 그대로 사용.
3. 원문 수령 즉시 `docs/ai-runtime/runtime-binding.md`의
   "AC Canonical Source Imported"를 YES로 갱신.
