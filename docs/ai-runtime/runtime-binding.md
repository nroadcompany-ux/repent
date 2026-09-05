---
status: CANDIDATE / NOT BOUND
version: 0.3
updated: 2026-09-05
---

# REPENT AI Runtime Binding — Status Return

`01_CLAUDE_RUNTIME_BINDING_DIRECTIVE.md` 9번 항목 형식에 맞춘 반환. 실행되지
않은 항목을 실행된 것처럼 표기하지 않는다.

| 항목 | 값 |
|---|---|
| A. Runtime ID | `REPENT-AI-RUNTIME-001` |
| B. Provider | OpenAI (**Candidate — Owner 미승인**) |
| C. Model | `gpt-5.6-sol` (**Candidate**) |
| D. Model Version | NOT SET |
| E. Prompt Version | `v0.1` (`REPENT-SYSTEM-PROMPT-v0.1`, Candidate) |
| F. System Prompt Hash | `e295da39df9817459127d497d45cee568d56114a5467f5db1e5ab279633cdb6f` (SHA-256, `runtime/prompts/system_prompt.v0.1.md`) |
| G. Retrieval Config | Scripture Retrieval OFF (Phase A) — Config Version 없음 |
| H. Output Validator / Classifier Version | **`REPENT-VGL-VALIDATOR-v0.2`** (Gate 기반, `runtime/validators/validator.v0.2.mjs`). v0.1은 `validator.v0.1.mjs`로 보존(삭제 안 함) |
| I. Test Runner Path / Method | `tests/vgl/runner/run.mjs`(Provider+Validator 파이프라인, Canonical/자체 fixture 겸용 Adapter 포함) / `validate-official.mjs`(구조 검증) / `validator-v2-regression.mjs`(Canonical 65 Regression + Robustness Set) |
| J. 65 AC Executable Structure YES/NO | **YES** |
| K. Actual (Official Model) Test Started YES/NO | **NO** — Provider API Key 없음. Validator 단독 Regression(모델 호출 없음)은 실행함(아래) |
| L. Executed Count (Official, Provider 포함) | 0 / 65 |
| M. PASS (Official) | 0 |
| N. FAIL (Official) | 0 |
| O. P0 False Negative (Official) | 0 (미실행) |
| P. G-01~G-10 Actual PASS | 0 / 10 — NOT RUN (G-07은 애초에 텍스트 기준 PASS 대상 아님 — 구조적 Gate) |
| Q. Blocking | 아래 참조 |
| R. New Theology Rule Created | 0 |

## Validator v0.2 — Gate 기반 재설계 (2026-09-05)

PM 지시(`REPENT — VGL VALIDATOR GENERALIZATION ROUND v0.2`)에 따라 단일 Rule
목록을 5개 역할로 분리했다. Canonical 65 문장을 암기하는 방식은 금지 —
AR-01~06/G-08~10을 구조([행위자]+[행위]+[개인 적용] 등)로 일반화했다.

- **A. Hard Authority Guard** — AR-01~06 + G-08/09/10의 "명백한 BLOCK" 구조
- **B. Rewrite Guard** — 완료·점수화 프레이밍, 과도한 명령형 권고
- **C. Scripture Router** — 명시 인용 + 출처 없는 일반 신앙 진술 → SCRIPTURE_CHECK
- **D. Human Review Router** — 문맥 의존적 개인 신적 관계 진술 → HUMAN_REVIEW
- **E. Structural Product Gate** — G-07, 이 파일 밖(`gates.json`, `run.mjs`)에서 처리

우선순위: `BLOCK > REWRITE > SCRIPTURE_CHECK > HUMAN_REVIEW > ALLOW`.

### 측정 결과 (실행 완료, `tests/vgl/runner/validator-v2-regression.mjs`)

**Canonical 65 (Regression 용도만 — 문장 자체는 패턴에 반영 안 함):**

| 지표 | 값 |
|---|---|
| Total | 65 |
| Routed Correctly | 61 |
| Misrouted | 4 |
| BLOCK False Negative | 4 |
| BLOCK False Positive | 0 |
| REWRITE Coverage | 2/2 |
| HUMAN_REVIEW Routing | 2/2 |
| SCRIPTURE_CHECK Routing | 1/1 |

v0.1 대비(참고, Canonical 65 대상 직접 비교는 어휘 차이로 완전 동일 기준은
아님): v0.1 Validator 단독 진단은 63건 중 34건 일치였다(REWRITE 2건 미지원).
v0.2는 65건 중 61건 일치, REWRITE·HUMAN_REVIEW·SCRIPTURE_CHECK 전부 100%
커버 — Canonical 65 기준으로는 뚜렷한 개선.

**⚠ Robustness Set (NON-CANONICAL, 별도 파라프레이즈 54건) — 중요 발견:**

| 지표 | 값 |
|---|---|
| Total | 54 |
| Correct | 28 |
| Incorrect | 26 |

**Dangerous 파라프레이즈(27건) 중 26건을 놓쳤다** — Canonical 65와 다른 어휘로
같은 위험을 표현하면 현재 정규식 패턴 대부분이 못 잡는다(Safe/Boundary
27건은 전부 올바르게 ALLOW — 오탐은 없음, 미탐이 문제). 즉 **v0.2는
Canonical 65에 대해서는 크게 개선됐지만, 실제 일반화는 아직 부족하다.**
정규식 구조가 여전히 특정 어순·동사 어미에 지나치게 긴밀하게 결합돼 있어
같은 개념의 다른 표현을 못 잡는다. 이건 반응적으로 이번 라운드 안에서
Robustness Set 문장에 맞춰 패턴을 더 넓히지 않았다 — 그렇게 하면 "다른
정답지에 맞춰 암기"하는 것과 본질이 같아진다. 다음 라운드에서 구조적으로
다른 접근(예: 정규식 한계를 인정하고 2차 검증 레이어 설계)이 필요하다고
판단해 별도 안건으로 분리한다.

**G-07 (`STRUCTURAL_PRODUCT_POLICY`)**: NOT TEXT-VALIDATED — 위 두 측정
어디에도 포함하지 않음. 별도 Evidence 필요(Moderation Policy/Community
AC/Output Wording Test).

## Runner Adapter (섹션 7, 구현·확인 완료)

`tests/vgl/runner/run.mjs`가 이제 Canonical fixture(`ac-cases.official.json`,
`{cases:[{ac_id, test_sentence, expected_verdict, ...}]}` 구조)와 자체
제작 fixture(`smoke-cases.json`, 평면 배열 `{input, expected_verdict}`)를
모두 읽을 수 있다 — `normalizeCasesFile()` 어댑터가 필드명을 통일한다.
**Canonical fixture 파일 자체는 수정하지 않았다.**

구조적 read 확인: `--provider mock`으로 `ac-cases.official.json`을 넘겨
`cases_found: 65, executed: 65`(에러 없이 65건 전부 파싱·순회) 확인. 이
실행은 mock 텍스트(고정 안내문)를 모든 case에 반환하므로 "pass/fail" 숫자
자체는 무의미하다 — **공식 PASS로 취급하지 않았고 결과를 저장소에 남기지도
않았다**(Mock으로 공식 PASS 생성 금지 원칙).

## Blocking

1. ~~AC Canonical Source Imported = NO~~ — **해결.**
2. **Model Provider API Key 없음** — PM 지시로 이번 라운드도 보류.
3. **(v0.2에서도 남음) Robustness 일반화 부족** — 위 참조. Dangerous
   파라프레이즈 27건 중 26건 미탐(오탐은 0). Official Run을 실제로 의미
   있게 만들려면 이 부분이 핵심 잔여 작업.
4. ~~AR-01~AR-06~~ — **해결.**
5. **G-07** — `STRUCTURAL_PRODUCT_POLICY`, 텍스트 검증 대상 아님. Moderation
   Policy/Community AC/Output Wording Test 미확보.

## Next Gate

Robustness 일반화 접근 재설계(다음 라운드, 별도 지시 필요) → Provider API
Key/승인 확보 →
`node tests/vgl/runner/run.mjs --cases tests/vgl/fixtures/ac-cases.official.json --provider openai --official` →
G-01~G-10 Actual PASS 계산 → Failure Correction → Regression → Production
Release Verdict.
