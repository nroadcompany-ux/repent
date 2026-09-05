# CHANGELOG

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
