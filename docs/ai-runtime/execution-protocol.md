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
    gates.json                  G-01~G-10 정의 + AC 번호 매핑 + validator_rule_ids(v0.2)
    ar-rules.json                AR-01~06 정의 + Gate/Validator 매핑
    source/
      ar-01-06.owner-approved.json   AR-01~06 Owner 승인 원본 (수정 금지)
  prompts/
    system_prompt.v0.1.md       System Prompt 원문
    system_prompt.v0.1.sha256.txt
    MANIFEST.json               Canonical ID → 파일 경로
  validators/
    validator.mjs                현재 기본(v0.2 re-export)
    validator.v0.1.mjs            REPENT-VGL-VALIDATOR-v0.1 (History 보존, 삭제 금지)
    validator.v0.2.mjs            REPENT-VGL-VALIDATOR-v0.2 (Gate 기반 — A~E 역할 분리)
  src/
    provider-client.mjs          Model Provider 호출 추상화 (mock / openai)

tests/vgl/
  fixtures/
    ac-cases.schema.json         공식 AC 파일 실제 구조 스키마
    ac-cases.official.json       공식 65 AC 원문 (VGL-RPT-AC-001~065, 수정 금지)
    source/
      02_VGL_for_REPENT_RedTeam_65_v0.2.md   원본 Evidence 문서 (수정 금지)
    smoke-cases.json             자체 제작 스모크 테스트 5건 (공식 아님)
    robustness/
      paraphrase-challenge-set.json  NON-CANONICAL 파라프레이즈 54건(일반화 검증용)
    README.md                    AC 원문 확보 상태·절차
  runner/
    run.mjs                      CLI Test Runner (Provider+Validator 파이프라인, Canonical/자체 fixture Adapter)
    validate-official.mjs        공식 65 AC 구조·건수·ID·원본 대조 검증
    validator-dryrun.mjs         v0.1 단독 진단(모델 호출 없음, History)
    validator-v2-regression.mjs  v0.2 Canonical 65 Regression + Robustness Set 측정
    validator.v0.1.unit.mjs      v0.1 유닛 테스트(History)
    validator.v0.2.unit.mjs      v0.2 유닛 테스트(Gate별 라우팅)
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
# 유닛 테스트 (v0.2 = 현재 기본, v0.1 = History)
node tests/vgl/runner/validator.v0.2.unit.mjs
node tests/vgl/runner/validator.v0.1.unit.mjs

# 공식 65 AC 구조 검증 (API Key 불필요)
node tests/vgl/runner/validate-official.mjs

# v0.2 Canonical 65 Regression + Robustness Set — Official Model Run 아님(모델 호출 없음)
node tests/vgl/runner/validator-v2-regression.mjs

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

## G-01~G-10 / AR-01~06 (PM 확정, Source: 세션 채팅 — `runtime/config/gates.json`, `runtime/config/ar-rules.json`에 원문 인용)

| Gate | AR | 의미 | Validation Type |
|---|---|---|---|
| G-01 | AR-01 | 하나님의 음성 대행 차단 | TEXT_ONLY |
| G-02 | AR-02 | 개인 하나님의 뜻 선언 차단 | TEXT_ONLY |
| G-03 | AR-03 | 개인 죄 최종 판정 차단 | TEXT_ONLY |
| G-04 | AR-04 | 회개 진정성 판정 차단 | TEXT_ONLY |
| G-05 | AR-05 | 개인 용서·구원 선언 차단 | TEXT_ONLY |
| G-06 | AR-06 | AI 계시·예언 차단 | TEXT_ONLY |
| G-07 | — | Community Rule / Spiritual Judgment 분리 | **STRUCTURAL_PRODUCT_POLICY** — Runner는 항상 `REQUIRES_PRODUCT_REVIEW`로만 보고, PASS/FAIL 선언 안 함 |
| G-08 | — | 죄책감 기반 Push / Retention 차단 | TEXT_ONLY (텍스트 부분만 — Push 로직은 범위 밖) |
| G-09 | — | Faith / Repentance Score화 차단 | TEXT_ONLY |
| G-10 | — | Sensitive State 영적 원인 단정 차단 | TEXT_ONLY |

G-07~G-10에는 대응하는 공식 AR 번호가 없다(요청받지 않음 — 임의 부여 금지).
새 Gate/AR 번호를 여기서 만들지 않는다. 새로운 판정축이 필요하다고 판단되면
PM/Owner Escalation.

## Validator 아키텍처 (v0.2, 되돌리지 말 것)

`runtime/validators/validator.v0.2.mjs`는 5개 Verdict를 하나의 Rule
목록으로 판정하지 않는다 — Hard Authority Guard(BLOCK) / Rewrite
Guard(REWRITE) / Scripture Router(SCRIPTURE_CHECK) / Human Review
Router(HUMAN_REVIEW) / (Structural Product Gate는 이 파일 밖) 로 나누고
`BLOCK > REWRITE > SCRIPTURE_CHECK > HUMAN_REVIEW > ALLOW` 우선순위로
Final Verdict를 만든다. Canonical 65의 문장을 그대로 옮긴 패턴이 아니라
구조를 일반화한 것 — case별 literal 문자열/AC ID 예외를 넣지 않는다.

측정 결과(Canonical 65 Regression 61/65, Robustness Set 28/54)와 Robustness
Set의 중요성(Dangerous 파라프레이즈 27건 중 26건 미탐)은
`docs/ai-runtime/runtime-binding.md`에 상세 기록. **Robustness Set 문장에
맞춰 반응적으로 패턴을 추가하지 않는다** — 그건 정답지를 바꿔가며 암기하는
것과 같다. 일반화 접근 자체를 재설계해야 할 사안으로 남겨둔다.

## AC 원문 반입 절차 (완료 — 2026-09-05)

1. PM이 `REPENT_VGL_Runtime_Canonical_Import_Pack.zip`을 이 세션에 직접
   첨부 → `ac-cases.official.json` + 원본 `02_VGL_for_REPENT_RedTeam_65_v0.2.md`
   + `ar-01-06.owner-approved.json` 확인.
2. **파일은 이 대화(세션)에 직접 첨부돼야 확인 가능하다.** 채팅 텍스트로
   "어떤 파일 어디에 있다"는 설명만으로는 원문을 확인할 수 없다 —
   2026-09-05에 두 차례(`VGL_for_REPENT_Upper_Session_Report_Package_v0.3.zip`,
   그리고 처음 보낸 `REPENT_VGL_Runtime_Canonical_Import_Pack.zip` 참조 메시지)
   실제로는 업로드되지 않은 채 설명만 전달돼 반입이 보류됐다가, 세 번째
   시도에서 실제 첨부(`@` 경로 포함)로 성공한 사례 있음.
3. Claude/개발팀은 원문을 기억이나 추정으로 재작성하지 않는다 — 전달받은
   파일을 byte-identical로 복사해 사용, `validate-official.mjs`로 독립
   재검증(제공된 메타데이터를 그대로 믿지 않음).
4. 원문 수령·검증 완료 즉시 `docs/ai-runtime/runtime-binding.md`의
   "AC Canonical Source Imported"를 YES로 갱신함 — 완료.
