# CHANGELOG

## G-07 Product Policy Evidence — parallel to API Key wait (2026-09-05)
- G-07(`Community Rule ≠ Spiritual Judgment`, `STRUCTURAL_PRODUCT_POLICY`)은
  Text Validator 작업이 아니므로 API Key 대기 중 병렬 진행
- `docs/06-ai-vgl-guardrail.md` — G-07 원칙(Moderation이 판단 가능한 것 vs
  영적 판정으로 변환 금지) 추가. 기존 "AI는 God/Spiritual Judge가 아니다"
  원칙을 Community Moderation 기능에 그대로 적용한 것 — 신규 신학 결정 아님
- `docs/08-social-safety.md` — Community Moderation Policy(Evidence A):
  허용 문구 3종·금지 문구 4종(전부 PM 지시 원문 그대로, 재작성 없음)
- `docs/09-acceptance-criteria.md` — Community Moderation AC(Evidence B)
  AC-G07-01~05 **CANDIDATE / PM REVIEW REQUIRED**로 기록(기존 Canonical
  Source 어디에도 이 ID들이 없어 임의 확정하지 않음, PM이 제시한 라벨만
  사용). AI Runtime 65 AC 섹션과 명확히 분리(Source Owner 다름)
- `tests/g07/wording-check.mjs`, `run.mjs`, `wording-cases.json` 신규 —
  Output Wording Test(Evidence C), Text Validator/Model 호출과 완전히
  분리된 독립 체커. ALLOW/BLOCK/BOUNDARY 최소 3종 실행, 결과 3/3 PASS
  (BOUNDARY 사례는 정책 문구+영적 판정 문구가 한 메시지에 섞인, AC-G07-03/
  04가 막으려는 실제 패턴을 합성해 검증). 이 3건은 Canonical
  65/Robustness 숫자와 절대 합산하지 않음
- `.gitignore` 신규 — 저장소에 기존에 없었음(`.env` 등 미보호 상태). 향후
  `OPENAI_API_KEY`를 로컬 `.env`로 쓸 것을 대비해 `.env`/`.env.*` 추가.
  Secret 자체는 생성하지 않았음
- API Runtime Binding 상태 무변경: `OPENAI_API_KEY PRESENT = NO` 유지,
  Provider Smoke/Official 65 여전히 NOT RUN, Production Release = HOLD
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## AI Runtime — Validator v0.2 Targeted Final Correction (2026-09-05)
- PM이 잔여 Robustness 3건(AR05-D3, G10-D1, G10-D3)을 개별 검토 후 다르게
  판정: RS-G10-D3만 실제 Validator 결함, RS-G10-D1은 "TEST DEFINITION
  REVIEW REQUIRED"(현재 G-10 정의로 Hard BLOCK 강제가 맞는지 Governance
  재검토 필요, Validator 결함 아님), RS-AR05-D3는 "CONTEXT-DEPENDENT
  AUTHORITY"(HUMAN_REVIEW 재라우팅 후보, Fixture Expected Verdict 변경은
  이번 라운드에서 보류)
- `HG-G10-SPIRITUAL-CAUSATION`에 `test()` 추가 — "틈을 타고" 리터럴
  hardcode가 아니라 [부정적/민감 사건] + [신앙·믿음 약화] + [인과·계기
  연결어] 3요소가 순서 무관하게 한 문장에 모두 있을 때만 매치. 신규 Rule
  ID 없음(기존 family 안에서 처리)
- RS-G10-D1, RS-AR05-D3는 코드·fixture 둘 다 무수정 — Governance 검토
  보류 상태로만 문서화
- **측정 결과**: Robustness 51/54→**52/54**(RS-G10-D3 BLOCK 정상화),
  Canonical 65는 65/65·FN/FP 0/0 유지, Safe/Boundary FP 0 유지(변동 없음)
- Official Model Run: 여전히 NOT RUN, Production Release = HOLD 유지
- Canonical Sentence/Verdict/Reason Changed = 0 / Robustness Set 문장
  무수정 / New Theology Rule Created = 0 / New Product Meaning Created = 0

## AI Runtime — Validator v0.2 Correction Round 2 (2026-09-05)
- PM 지시(`VGL VALIDATOR CORRECTION ROUND 2`)로 Round 1의 Robustness 낮은
  점수(28/54) 원인을 코드 수정 전에 먼저 Family별 실패 분석(Canonical 4건
  + Robustness Dangerous 26건) — 상세는 `docs/ai-runtime/runtime-binding.md`
- 근본 원인: 삽입어 미허용(강조어-명사 사이), 어순 스크램블 가정, 인과
  서술 하위구조 누락, 간접 권위 선언(자기지칭 채널·사동), 관형절 내포형,
  완곡·헤지 표현, 조건부 표현, 어휘 동의어 부족, 한국어 명시적 라벨 누락,
  부정형/명사화 주어 미모델링 — 전부 구조적 원인이지 개별 문장 문제 아님
- `runtime/validators/validator.v0.2.mjs` 보강: 하위 Family 신설
  (`HG-AR02B-DIVINE-RELATIVE-CLAUSE`, `HG-AR05B-IDENTITY-RELATIVE-CLAUSE`,
  `HG-G08B-CONDITIONAL-GUILT-PUSH`), 기존 Family에 어휘·구조 확장. 새 AR/G
  번호 없음 — 전부 기존 AR-02/05/08의 하위 구조
- 순서 고정 정규식으로 못 푸는 경우(AC-009 어순 스크램블, G-09 스트릭
  카운트 순서)는 `family.test(text)` AND-조건 함수 도입 — 정규식 하나로
  억지로 넓히면 "하나님이 당신에게 은혜를 주셨습니다" 같은 흔한 축복
  표현까지 BLOCK 될 위험이 있어 신적 행위자/개인 대상/말씀 언급/전달 동사가
  전부 있는지 확인하는 방식으로 전환. G-08 조건부 위협도 신앙 anchor
  필수의 AND-조건으로 구현(일반 조건문 오탐 방지)
- **의도적 미수정 3건**: AR-05 "새사람으로 인정받다"(일반 자기계발 표현과
  혼동 위험), G-10 "믿음이 약해진 틈을 타고"(순수 관용구), G-10 "마음가짐이
  흐트러져서"(세속적으로도 흔해 확정 BLOCK 근거 약함 — Human Review 재설계
  검토 필요). Canonical/Robustness 문장에 맞춘 literal hardcode로 메우지
  않음
- **측정 결과**: Canonical 65 — 61/65→**65/65**(BLOCK False Negative
  4→0, False Positive 0 유지). Robustness Set — 28/54→**51/54**(Dangerous
  27건 중 미탐 26→2, Safe/Boundary 27건 False Positive 0 유지) — Recall
  개선을 False Positive 증가로 얻지 않았음(Canonical+Robustness 합계 88건
  전부 오탐 0)
- Robustness Set(54건) 원본 문장 무수정 확인 — 기존 실패 문장을 정답에
  맞게 고치는 방식 아님
- G-07 `STRUCTURAL_PRODUCT_POLICY`/`REQUIRES_PRODUCT_REVIEW` 유지, 텍스트
  판정 대상 아님
- Official Model Run: 이번 Correction Round에서도 API Key 연결·Provider
  Smoke Test·Official 65 Model Run 전부 금지 지시대로 미실행, **NOT RUN**
  유지. Production Release = **HOLD** 유지
- Canonical Sentence/Verdict/Reason Changed = 0 / New Theology Rule
  Created = 0 / New Product Meaning Created = 0

## AI Runtime — Validator v0.2 Generalization Round (2026-09-05)
- `runtime/validators/validator.v0.1.mjs` — v0.1 이름 변경(History 보존,
  삭제 안 함), `tests/vgl/runner/validator.v0.1.unit.mjs`도 동일하게 보존
- `runtime/validators/validator.v0.2.mjs` 신규 — 단일 Rule 목록 대신 5개
  역할로 분리: Hard Authority Guard(BLOCK) / Rewrite Guard(REWRITE) /
  Scripture Router(SCRIPTURE_CHECK) / Human Review Router(HUMAN_REVIEW) /
  Structural Product Gate(G-07, 이 파일 밖). 우선순위
  `BLOCK > REWRITE > SCRIPTURE_CHECK > HUMAN_REVIEW > ALLOW`. AR-01~06을
  Canonical 65 문장이 아니라 구조([행위자]+[행위]+[개인 적용] 등)로 일반화
  — case별 literal 문자열/AC ID 예외 없음
- `runtime/validators/validator.mjs` — 이제 v0.2를 re-export(현재 기본)
- `tests/vgl/runner/validator.v0.2.unit.mjs` 신규 — Gate별 라우팅 19건 PASS
- `tests/vgl/fixtures/robustness/paraphrase-challenge-set.json` 신규 —
  NON-CANONICAL 파라프레이즈 54건(AR-01~06·G-08~10 각 dangerous 3/safe
  2/boundary 1), Canonical 65와 다른 어휘로 일반화 여부 검증
- `tests/vgl/runner/validator-v2-regression.mjs` 신규 — Canonical 65와
  Robustness Set을 분리 측정(단일 Accuracy로 합치지 않음)
- **측정 결과**: Canonical 65 — Routed Correctly 61/65, BLOCK False
  Negative 4, BLOCK False Positive 0, REWRITE/HUMAN_REVIEW/SCRIPTURE_CHECK
  전부 100% 커버. **Robustness Set — 54건 중 28건만 정답, Dangerous
  파라프레이즈 27건 중 26건 미탐(오탐 0)** — Canonical 65는 크게 개선됐지만
  실제 일반화는 아직 부족함을 확인. 이번 라운드에서 Robustness Set
  문장에 맞춰 반응적으로 패턴을 넓히지 않음(그러면 정답지 암기와 동일)
- `runtime/config/gates.json`, `runtime/config/ar-rules.json` —
  validator_rule_ids를 v0.2 id로 갱신, v0.1 id는 `*_v0.1_history` 필드로 보존
- `tests/vgl/runner/run.mjs` — Runner Adapter 추가(`normalizeCasesFile`):
  Canonical fixture(`{cases:[{ac_id,test_sentence,expected_verdict}]}`)와
  자체 fixture(평면 배열) 모두 읽음, Canonical fixture 자체는 무수정.
  `--provider mock`으로 공식 65 AC 구조적 read 확인(65/65 파싱, 에러 0) —
  mock 텍스트라 pass/fail 숫자는 무의미해 결과를 저장소에 남기지 않음
  ("Mock으로 공식 PASS 생성 금지" 준수)
- G-01~10 Actual Model Run: 여전히 NOT RUN (API Key 없음, PM 지시로 보류)
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## AI Runtime — Import Canonical VGL 65 Acceptance Cases (2026-09-05)
- `REPENT_VGL_Runtime_Canonical_Import_Pack.zip`이 이 세션에 실제로 첨부됨
  (두 차례 "첨부했다"는 설명은 실제 파일이 없어 반입 보류됐던 것과 대비)
- `tests/vgl/fixtures/ac-cases.official.json` — `VGL-RPT-AC-001~065` 원문
  byte-identical 반입, `tests/vgl/fixtures/source/02_VGL_for_REPENT_RedTeam_65_v0.2.md`
  원본도 함께 반입
- `runtime/config/source/ar-01-06.owner-approved.json` — AR-01~06 Owner
  승인 정의 반입, 이전에 채팅으로 받은 텍스트와 byte-level 동일 확인
- `tests/vgl/runner/validate-official.mjs` 신규 — 전달받은 `source_integrity`
  claim(문장/판정/이유 변경 0건)을 그대로 믿지 않고 원본 마크다운과 독립
  재계산해 대조, 65/65 건 전부 확인
- `tests/vgl/fixtures/ac-cases.schema.json` — 실제 파일 구조(ALLOW/REWRITE/
  SCRIPTURE_CHECK/HUMAN_REVIEW/BLOCK 어휘 등)에 맞춰 갱신 (이전 버전은 추측)
- `tests/vgl/runner/validator-dryrun.mjs` 신규 — Validator 단독으로 65건
  실행(모델 호출 없음, Official Model Run 아님). 결과: 65건 중 REWRITE 2건
  미지원, 나머지 63건 중 34건만 일치 — 패턴 보강 필요성 확인(별도 작업)
- `runtime/config/gates.json`의 G-01~10 ↔ AC 번호 매핑을 실제 65건 내용과
  대조 — 10개 Gate 전부 정합 확인
- AC Canonical Source Imported: NO → **YES**
- Official Model Run: 여전히 NOT RUN (API Key 없음, PM 지시로 보류)
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## AI Runtime — AR-01~06 Mapping + G-07 Structural Gate (2026-09-05)
- `runtime/config/ar-rules.json` 신규 — PM이 세션 채팅으로 직접 전달한
  AR-01~06 공식 정의를 G-01~06 및 Validator rule id에 연결
- `runtime/validators/validator.mjs` — 각 rule에 `ar_id` 필드 추가(1:1 대응
  없는 규칙은 `null` 명시), evidence 출력에도 `ar_id`/`gate` 포함
- `runtime/config/gates.json` — `validation_type` 필드 추가. G-07은
  `STRUCTURAL_PRODUCT_POLICY`로 명시하고 필요 Evidence(Moderation Policy /
  Community AC / Output Wording Test) 기록
- `tests/vgl/runner/run.mjs` — G-07류 구조적 Gate는 텍스트 실행 결과와
  무관하게 항상 `REQUIRES_PRODUCT_REVIEW`로 보고하도록 수정(PASS/FAIL 오판
  방지), 실제 실행으로 확인
- **65 AC 원문 반입은 보류** — PM이 언급한
  `VGL_for_REPENT_Upper_Session_Report_Package_v0.3.zip`이 이 세션에 실제로
  첨부되지 않음(파일시스템 검색으로 확인) — 채팅 설명만으로 원문을
  재구성하지 않았음. AC Canonical Source Imported = NO 유지
- API Key 연결은 PM 지시로 이번 라운드 보류
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## AI Runtime Candidate Scaffold + VGL Test Harness (2026-09-05)
- `runtime/` — Runtime Binding Candidate config, System Prompt v0.1 (SHA-256 동봉),
  Rule-based Output Validator(`REPENT-VGL-VALIDATOR-v0.1`, G-01~G-10 매핑),
  Provider Client(mock/openai) 실제 구현·동작 확인
- `tests/vgl/` — CLI Test Runner, Validator 유닛 테스트 8건 PASS, 스모크
  테스트 5건 실행(Evidence Log 포함) — 전부 실제 실행 결과, 공식 65 AC 아님
- `docs/ai-runtime/runtime-binding.md`, `execution-protocol.md` 신규 —
  Runtime Binding 상태 반환(Section 9 형식) 및 실행 절차
- **AC Canonical Source Imported = NO** — `VGL-RPT-AC-001~065` 원문 미확보,
  Model Provider API Key 미설정 — 공식 65 AC 실행은 아직 수행하지 않음
  (실행하지 않은 것을 PASS로 표기하지 않음)
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## Foundation v1.0 canonical resync (2026-09-05)
- Vertical Way 7단계(LIFE DIRECTION/LONG-TERM/YEAR/MONTH/WEEK/TODAY/NOW ACTION) → 5단계(Direction/Promise/Action/Today/Now) Owner Lock 구조로 정합
- Confession 공개 설정 2옵션(나만 보기/함께 나누기) → 3옵션(나만 보기/이름 가리고 나누기/이름 공개로 나누기)으로 확장, Anonymous 금지 명시
- Life Event · Season/StoryArc 명칭 비교 화면의 하단 안내 카피를 "Owner 결정 필요"에서 "Owner Lock 완료(RESOLVED)"로 정정 (상단 가드 문구와의 자기모순 제거)
- docs/00,01,04,05,06,07 스켈레톤 문서에 Owner/PM 확정 Canonical Decision(Foundation, Nav, Vertical Way, LCI, Missing Day, Turning Point, Promise, LifeEvent/Season/StoryArc, Confession Privacy, VGL Guardrail)만 반영 — status: OPEN은 유지(미확정 영역 존재)
- New Product Meaning 생성 없음 — 기존 확정 결정의 Repository 재동기화만 수행

## v0.7.2.1 (2026-09-05)
- Zero-delta cleanup: LifeEvent=삶의 사건, Season=시기, StoryArc=이야기 흐름
- Red validation 제거
- LCI 이모지 통일 (✨ 제거)
- Privacy copy 분리
- Missing Day Rule 명시 (No Input = No Point)
