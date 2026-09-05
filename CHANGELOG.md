# CHANGELOG

## Owner Decision Final Canonicalization + Missing Planning Audit (2026-09-05)
- PM 지시 `REPENT — OWNER DECISION FINAL CANONICALIZATION + MISSING
  PLANNING AUDIT` 실행. Notion TEMP Decision Queue Q1~Q12(Owner 최종
  확정 12개 기획 결정)를 `docs/00,01,02,04,05,06,07,08,09,10`에 반영.
  신규 Product Meaning 없음, Figma/Prototype 미사용, `main` merge 없음
- **Q1 Onboarding**: 가입 후 3개 진입 질문(선택 응답), 5개 메뉴 전체
  Tutorial 강제 금지 — `02-user-flow.md` H, `04-policy-business-rules.md`
- **Q2 Search**: Journey 내부 Search+Filter(기간/기록종류/키워드/
  LifeEvent/Season/StoryArc), 독립 Bottom Tab 금지 — `01-ia.md`
- **Q3 Notification**: MVP=Promise/Action 사용자 설정 Reminder만,
  Prayer/Repentance 재촉 Push 및 죄책감·영적 압박 문구 금지 —
  `04-policy-business-rules.md`
- **Q4 Account Delete**: Private Source 탈퇴 시 삭제 절차, ShareCopy
  탈퇴 전 유지/삭제 사용자 선택, 법적/운영 로그 Content 분리+최소
  범위+최대 6개월 보관 — `07-privacy-security.md`
- **Q5 Export**: Product Planning 포함, MVP 구현 우선순위는 후순위 —
  `00-product-foundation.md`
- **Q6 AI Memory**: Default OFF, Explicit Opt-in 후 사용, Prayer/
  Repentance 등 민감기록 동의 없는 재사용 금지, 중지/삭제 가능 —
  `07-privacy-security.md`
- **Q7 Community Reaction**: MVP=공감 1종만, 인기순/랭킹/영적 비교/
  Reaction 기반 Faith Signal 금지 — `08-social-safety.md`, `01-ia.md`
  Community CANDIDATE→CURRENT 승격
- **Q8 Report Taxonomy**: 4종(개인정보 노출/괴롭힘·혐오/스팸·광고/
  기타 안전 문제), Spiritual Judgment 신고사유 금지 —
  `08-social-safety.md`, `01-ia.md` CANDIDATE→CURRENT 승격
- **Q9 Minor Confession Sharing = HOLD 유지, Default만 확정**:
  Default=Private는 확정, Public 공유는 Age/Protection/Legal Policy
  확정 전까지 여전히 HOLD — `08-social-safety.md`
- **Q10 Scripture**: MVP=Book/Chapter/Verse Reference 중심, Full
  Text는 License 확보 후, AI는 후보만 제시 — `06-ai-vgl-guardrail.md`
- **Q11 Source Delete/ShareCopy**: Source 삭제 시 기존 ShareCopy
  목록 제시 후 함께 삭제 여부 사용자 선택 절차로 확정(CANDIDATE
  해소) — `05-data-model.md`
- **Q12 State Enum**: Product Meaning=LOCK, 정확한 Enum 이름은
  Development Documentation 단계에서 확정한다는 절차 자체가 Owner
  확정(이름 값만 CANDIDATE 유지) — `05-data-model.md`
- **Trace Update**: 신규 Working ID Story 9건 추가(`US-RPT-ONB-001·
  SEA-001·NOT-001·ACC-001/002·MEM-001·MOD-002/003·SCR-002·SHR-002`),
  각각 Purpose/Task/AC/Related Flow/Related Entity/Related Policy
  연결. HOLD인 Q9(Minor Confession Sharing)는 지시대로 억지 AC/Flow
  생성하지 않음
- **문서 완성도 보완(신규 결정 아님)**: Missing Planning Audit
  진행 중 `02-user-flow.md` D.Action/F.Confession Direct에 `→ Return`
  단계가 누락된 것을 발견해 즉시 보완(신규 Product Meaning 아님 —
  이미 확정된 원칙을 flow 표기에 반영한 것)
- **`docs/10-decision-open-hold-register.md`**: RESOLVED/CURRENT
  11건 신규 추가, CANDIDATE 목록에서 Reaction/Report Taxonomy/Source
  Delete ShareCopy Reference 처리 방식 제거(RESOLVED로 이동),
  Minor Safety·Privacy/Consent·ShareCopy Delete 행 갱신
- **Missing Planning Audit(15문항) 수행** — 전 문항 답변,
  Master Handoff에 표로 기록. 핵심 발견: Missing Product Planning
  0건, Unresolved Owner Decision 0건, Trace Break 0건(공식 10종),
  Product Meaning Conflict 0건(신규 반영분 전체 재검사)
- **Planning Gate: C → B로 상향**(Claude 판단, PM 최종 확인 요청) —
  남은 항목이 전부 정당한 HOLD 또는 Product Meaning 확정 후 절차만
  남은 Non-blocking OPEN이라는 근거. Planning Completion 정성적
  추정 22%→약 65~70%로 상향
- 검증: `runtime/`, `prototype/`, Canonical 65 fixture, Robustness
  Set fixture 전부 `git diff --stat` 0 확인. 유닛/회귀/G-07 테스트
  재실행 결과 기존과 동일 — 회귀 없음
- `docs/REPENT-MASTER-HANDOFF.md`: "Owner Decision Final
  Canonicalization + Missing Planning Audit" 섹션 신규(Owner Decision
  Queue Closed 표, Latest Remaining OPEN/HOLD, Missing Planning Audit
  15문항 표, Audit Return). 과거 섹션 전부 보존
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## Product Planning Canonicalization Batch (2026-09-05)
- PM 지시 `REPENT — PRODUCT PLANNING CANONICALIZATION / PARALLEL
  EXECUTION` 실행 — 새 기획 없음, 이미 확정된 Planning을 `docs/00~10`에
  병렬 이식하고 Trace를 연결. Figma/prototype은 작업 대상에서 제외
  (Section 0 Branch Policy에 따라 `main` merge도 하지 않음, 계속
  `claude/new-session-gwiqkv`에서만 작업)
- **`docs/00-product-foundation.md`**: `[Requirement Matrix]` 신규
  (Journey/Prayer/Promise/Action/Repentance/Confession/Scripture/
  AI-VGL 8개 Domain × WHY/WHO/WHAT/EXPECTED RESULT/NON-GOAL/STATUS).
  기존 Owner Lock(Main Nav/Vertical Way/확정 용어/AI 원칙) 무변경
- **`docs/01-ia.md`**: Service Architecture/Domain Ownership/Feature
  Inventory(CURRENT/CANDIDATE 구분) 신규. Community는 "Confession의
  Shared/Public Surface"만 CURRENT, Reaction/Report Taxonomy/
  Moderation Workflow Detail/Moderator Action Detail은 CANDIDATE로
  명시(임의 승격 안 함)
- **`docs/02-user-flow.md`**: 빈 스텁 제거, E2E Flow 7종(A.Journey/
  B.Prayer/C.Promise/D.Action/E.Repentance/F.Confession Direct/
  G.Private Source Share) 신규 작성
- **`docs/04-policy-business-rules.md`**: Promise에 1:N Action·
  "마무리됨" 종료 표현 추가, Sharing(3원칙+Preview 필수) 신규,
  Empty/Error Principle(허용/금지 예시) 신규, Archive(영적 완료
  아님) 신규. 기존 LOCKED Rule 전부 보존
- **`docs/05-data-model.md`**: Core Entity 12종, Relations(Promise
  1:N Action 등), CRUD Matrix/Visibility/Owner, Permission Boundary
  (Owner/Viewer/Moderator/System/AI + "Moderator는 신고만으로 Private
  Prayer/Repentance Source 접근 불가" P0), Lifecycle State Candidate
  Enum(5개 Entity군) + Forbidden State(ANSWERED 포함 6종) 신규. **AI는
  어떤 Entity의 Record Owner도 될 수 없음**을 명문화
- **`docs/06-ai-vgl-guardrail.md`**: Scripture Literal Product Copy
  Rule 신규(금지/권장 문구) — Validator Coverage Gap은 해결된 것이
  아님을 명시적으로 재확인(Validator Verdict Logic 미변경)
- **`docs/09-acceptance-criteria.md`**: "PRODUCT FUNCTIONAL TRACE"
  섹션 신규 — `US-RPT-JNY-001/002·PRY-001/002·PRM-001·ACT-001/002·
  RPN-001/002·CNF-001·SHR-001·SCR-001·MOD-001` 12개 Working ID
  Story(Purpose/Task/AC/Related Flow/Related Entity/Related Policy).
  MOD-001은 신규 AC를 만들지 않고 기존 `AC-G07-01~05`를 직접 참조.
  `VGL-RPT-AC-001~065`/`AC-G07-01~05` 원문은 무변경(diff 확인 —
  파일 말미 안내문 재배치 1건 외 순수 추가)
- **`docs/10-decision-open-hold-register.md`**: RESOLVED/CURRENT
  8건 추가(Prayer Response Tracking REMOVED 등), 신규 "CANDIDATE"
  섹션(Lifecycle Enum 이름·Reaction·Report Taxonomy·Moderation
  Workflow/Action Detail·ShareCopy Reference 세부·Working ID 승격
  7건), Core Register에 RS-AR05-D3/RS-G10-D1/Scripture Validator
  Coverage(P1) 행 추가. 기존 HOLD 항목 상태는 변경하지 않음
- **Trace Check 실행**: JNY/PRY/PRM/ACT/RPN/CNF/SHR/SCR/MOD 9개
  Domain 전수 검사 — 공식 Break Code 10종(ORPHAN_REQUIREMENT ~
  POLICY_WITHOUT_AC) **전부 0건**. Break Code로 정확히 매핑되지
  않는 잔여 사항(Scripture 전용 Flow 없음, Moderation Flow/Data/State
  의도적 부재, 일부 엔티티 Lifecycle State 없음)은 임의 보완하지 않고
  정직하게 보고만 함
- **Branch Integration Gap 신규 등록(P1)**: `docs/00`이 선언하는
  Canonical Branch(`main`)와 실제 이 세션 작업 위치(`claude/new-
  session-gwiqkv`)의 불일치를 Master Handoff에 명시. 이번 라운드도
  PM 지시로 main merge하지 않음
- **Planning Gate = C 유지**(Claude 판단, PM 확인 대기) — Trace
  Break는 0건이 됐으나 Community CANDIDATE 미구현·Permission 실제
  구현 전무·Lifecycle Enum 미확정이 Non-blocking인지는 PM이 판단할
  사안. PM이 Non-blocking으로 판단하면 Gate B 승격 가능
- 검증: `runtime/`, `tests/vgl/fixtures/ac-cases.official.json`,
  `tests/vgl/fixtures/robustness/paraphrase-challenge-set.json`,
  `prototype/`, `docs/07-privacy-security.md`, `docs/08-social-safety.md`
  전부 `git diff --stat` 0 확인. 유닛/회귀/G-07 테스트 재실행 결과
  기존과 동일(65/65, 52/54, 19/19, 8/8, 3/3, validate-official 0
  changed) — 회귀 없음
- `docs/REPENT-MASTER-HANDOFF.md`: "Canonicalization Batch Result"
  섹션 신규(Requirement/Feature/Story/Task/Product Functional AC/
  Flow/Data/State/Permission Status, Remaining OPEN, Production
  HOLD, Trace Check Result, Branch Integration Gap, Planning Gate
  Reassessment, Next P0, Figma/Prototype 재확인). 과거 섹션 전부 보존
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## Product Planning Lock Cross Review (2026-09-05)
- PM 지시 `REPENT — PRODUCT PLANNING LOCK CROSS REVIEW REQUEST` 실행 —
  Cross Review Only, 신규 Product Meaning 생성 없음. `docs/00~10`은
  이번 라운드에서 무변경(read-only 검증만 수행, git diff로 확인)
- **Resolved Decisions 확인**: Owner/PM Decision A~H 중 A(Main Nav/
  Today)·B(Prayer Response 제거)·C(Journey 함께 제거)·D(Action
  Failure Follow-up Choice)·E(Repentance 고정단계 제거)는 이미
  `docs/04-policy-business-rules.md`(직전 라운드)에 LOCKED로 반영돼
  있음을 재확인. **H(Scripture 3-Category)는 이미 `docs/06`에 사전
  반영돼 있었음을 발견**(Notion Hub 출처, 이번에 실행 대조만 함)
- **Remaining OPEN 식별**: F(ShareCopy "Source 삭제 ≠ ShareCopy 자동
  삭제" 규칙 미문서화, Select Fields/Mask/Preview 파이프라인 미문서화),
  G(Community MVP 범위는 이번에 확정됐으나 담을 문서·구현 여전히 없음)
- **P0 CONFLICT 2건 발견(Legacy Artifact, 실제 코드 대조로 확인, Doc
  Lock 비차단 — PM 지시 1번에 따라 prototype은 Source 아님으로 분류)**:
  ① `prototype/index.html` `s-action-fail`의 Failure Cause Taxonomy
  (af1~af6, 직전 라운드에 이미 발견) ② **신규**: `s-repent`의
  `step-fill`(퍼센트 진행바)+`step-counter`("1/2" 고정 카운터)가
  Decision E가 금지한 진행률/고정 스텝 카운터 패턴과 구조적으로 동일.
  대조로 Final CTA·완료 문구는 이미 Decision E와 정확히 일치함도 확인
- **AI/VGL Coverage Gap 발견(실제 실행 검증)**: `validator.v0.2.mjs`에
  Decision H 금지 예문("하나님이 지금 이 말씀을 주셨습니다.")을 직접
  실행 → `verdict: ALLOW`(BLOCK 아님) 확인 — 개인 대상("당신/너")이
  없는 구조라 기존 AR-01 패턴이 미탐지. Validator Verdict Logic은
  이번 라운드에서 변경하지 않음(범위 밖), RS-AR05-D3/RS-G10-D1과 같은
  성격의 P1 Governance Gap으로 기록
- **Domain Boundary Review**: Journey/Prayer/Repentance/Promise/
  Action/Confession 6개 Domain 간 Owner 중복·기능 중복 정의 없음 확인
  (Prayer가 Promise 작성 진입점 + Confession 공유 진입점 양쪽에
  걸치는 것은 상충 아님으로 판정, 단 Prayer 엔티티 자체 미정의라
  완전 무충돌은 UNVERIFIED로 유보)
- **Theology/VGL Review**: Faith Score/Repentance Score/Prayer
  Response Rate/하나님과 거리/영적 성장 점수/Action Failure=Sin/
  Missed Promise=Sin/회개 충분성·진정성 판정/개인 구원·용서 선언/
  하나님의 개인적 뜻 확정/AI 계시·예언/FORGIVEN·SAVED·REPENTED·
  FAITHFUL·SPIRITUALLY_FAILED 상태값 — `docs/00~10` 전체 grep+육안
  대조 결과 **0건 검출**(발견된 매치는 전부 금지 선언문 자체). 단,
  대부분 엔티티가 아직 데이터 모델이 없어 검사 표면적이 작다는 단서를
  같이 기록
- **Overall Verdict = PASS WITH OPEN**, **Planning Gate Recommendation
  = C(변경 없음)** — Canonical 문서 내 Product Meaning 위반 0건이지만
  Community 기능 미구현·6개 엔티티 데이터모델 부재·권한모델 전무·
  Lifecycle State 전무가 여전히 C의 근거
- `docs/REPENT-MASTER-HANDOFF.md`: "Cross Review Result" 섹션 신규
  (Resolved Decisions/Remaining OPEN/P0 Conflict/AI Coverage Gap/
  Domain Boundary/Theology-VGL/Overall Verdict/Gate Recommendation),
  Last Update 헤더 갱신. 과거 섹션(Planning Completion Status 등)은
  삭제하지 않고 그대로 보존
- 이번 라운드는 검수 결과를 근거로 Product Meaning을 직접 수정하지
  않음 — PM 승인 후에만 `docs/04`/`docs/05`/`docs/08`/prototype/
  Validator에 반영 예정
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## Planning Delta — 4 Product Decisions + Figma Status (2026-09-05)
- PM/Owner가 Product Planning Completion Audit 이후 4건의 Product
  Decision을 확정, `docs/04-policy-business-rules.md`에 LOCKED로
  반영:
  1. Prayer Response Tracking = REMOVED(응답됨/응답대기/응답률 통계
     전부 미제공)
  2. Journey "함께" = REMOVED(Journey=개인 시간축, Social Surface는
     Confession으로 일원화)
  3. Action Failure = FOLLOW-UP ACTION CHOICE(Retry/Modify/
     Reschedule/Record Only/Optional Repent) — Failure Cause
     Taxonomy 생성 금지, Action Failure ≠ Sin 재확인
  4. Repentance Fixed 10-Step = REMOVED(Optional Progressive Flow,
     Final CTA "회개 기록 마치기", "회개 완료" 표현 금지)
- **신규 발견(충돌)**: `prototype/index.html`의 `s-action-fail` 화면
  (af1~af6, 6개 실패 원인 선택지)이 위 결정 3번이 금지한 Failure
  Cause Taxonomy 그 자체임을 확인 — Correction Required로 기록,
  이번 라운드에서 prototype 코드는 수정하지 않음(지시 범위 밖 확대
  금지)
- **Figma Delta**: PM이 Figma Source를 직접 검증 — 현재 Artifact
  "REPENT v0.5 — 5-Tab IA"는 Product Foundation v1.0 기준
  OUTDATED/CORRECTION REQUIRED. Claude 세션은 파일 URL 미제공으로
  독립 재검증 못 함(Figma MCP는 연결됐으나 대상 파일 특정 불가) —
  PM 보고를 Source로 기록하고 독립검증 여부는 명시적으로 구분
- `docs/PRODUCT-PLANNING-COMPLETION-AUDIT-2026-09-05.md`: 원문 삭제
  없이 SUPERSEDED/REASSESSMENT PENDING 배너 추가(이전 Gate=C,
  Planning≈22% 판정이 최신이 아님을 명시, 재산출은 PM 지정 순서
  진행 후)
- `docs/REPENT-MASTER-HANDOFF.md`: Planning Completion Status 섹션을
  Resolved Since Audit / New Correction Required / Critical Gap(갱신)
  / Current P0(PM 지정 체인 그대로 기록)로 재구성. Gate·Planning %는
  REASSESSMENT PENDING으로 명시(임의로 새 숫자 산출하지 않음)
- 이번 라운드는 Product Decision 기록 + 충돌 발견 + 문서 갱신만
  수행 — PM이 지시한 다음 체인(Requirements→Feature→Flow→...)은
  착수하지 않음(명시적 다음 지시 대기)
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## Product Planning Completion Audit (2026-09-05)
- 신규 `docs/PRODUCT-PLANNING-COMPLETION-AUDIT-2026-09-05.md` — 최종
  Development Documentation 10종 작성 전, 제품/서비스 기획 자체의
  개발 가능 수준 여부를 전수 감사(PM 지시 `REPENT — PRODUCT PLANNING
  COMPLETION AUDIT`). Source: docs/00~10, docs/ai-runtime/, Canonical
  65, `prototype/index.html`(실제 HTML, 21개 화면 확인), GitHub Remote
  (`git fetch`+`git log`로 `main`/`claude/new-session-gwiqkv` 실제 대조).
  **Figma v0.8은 이 세션에 URL/파일이 전달되지 않아 접근 불가 —
  UNVERIFIED로 명시**하고 prototype HTML을 대체 Evidence로 사용
- Domain Scope Audit(Journey/Promise/Action/Repentance/Confession +
  Cross-cutting Prayer/Word/Turning Point/ShareCopy/Privacy/AI-VGL/
  Community), Feature Inventory(WORKING ID 23건, Canonical ID 아님),
  Data/State/Permission Audit(11개 Entity), Policy Audit(15개 항목)
  전부 실행
- **핵심 발견**: G-07(Community Rule ≠ Spiritual Judgment) 제약은
  CURRENT/CANONICAL인데, 그 제약이 적용될 Community/Moderation
  기능(신고 접수, 모더레이션 큐, Hide/Delete/Reject 상태) 자체가
  저장소 어디에도 정의돼 있지 않음 — 가드레일이 가드레일 대상 기능보다
  먼저 완성된 역전 상태
- **Final Documentation Gate = C(NOT READY — PLANNING GAP REMAINS)** —
  P0 BLOCKING 5건(Action Failure 정책 부재, Community 기능 미정의,
  핵심 엔티티 6종 데이터모델 부재, 권한 모델 전무, Lifecycle State
  전무) 확인. Planning Completion ≈22%, Documentation Completion
  ≈42%(정성적 가중 추정, 산출 근거 감사 보고서 §10에 노출)
- `docs/REPENT-MASTER-HANDOFF.md` 갱신 — Planning Completion Status/
  Critical Gap/Remaining Owner Decision/Current P0(Planning)/Next
  Documentation Gate 섹션 추가, Branch B/C 섹션에 `main` vs
  `claude/new-session-gwiqkv` 실측 분기(merge-base 기준 main +1커밋,
  현재 브랜치 +9커밋) 기록
- **범위 밖 확인(변경 없음)**: `runtime/`, Canonical 65 fixture,
  Robustness Set fixture, Validator Verdict Logic — 이번 라운드는
  순수 감사/문서 작업, 코드 변경 0건. 유닛/회귀 재실행 결과 기존과
  동일(65/65, 52/54, 3/3, validate-official 0 changed)
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## G-07 Canonicalization + Master Handoff (2026-09-05)
- **G-07 Canonicalization Decision (PM 승인)**: `docs/09-acceptance-criteria.md`의
  AC-G07-01~05를 "CANDIDATE / PM REVIEW REQUIRED" → "**CURRENT /
  CANONICAL PRODUCT POLICY AC**"로 전환(G-01~G-10 Acceptance 표의 G-07
  행도 "N/A" → "PRODUCT POLICY PASS"로 갱신). Canonical Owner를
  "REPENT Product Policy / Social Safety"로 명시해 `VGL-RPT-AC-001~065`
  (VGL Red-Team Source Owner)와 계속 분리 관리·별도 집계함을 재확인
- `docs/10-decision-open-hold-register.md` G-07 행: `OPEN` →
  `EVIDENCE COMPLETE / PRODUCT POLICY PASS`
- `docs/08-social-safety.md`: Community Moderation Policy 섹션에 상태
  참조 각주 추가(AC-G07 승격 사실만 링크, 정책 원문 자체는 미변경)
- **범위 밖 확인(변경 없음, 실행으로 재검증)**: `VGL-RPT-AC-001~065`
  원문(`tests/vgl/fixtures/ac-cases.official.json`), Robustness Set
  (`tests/vgl/fixtures/robustness/paraphrase-challenge-set.json`),
  `runtime/`(Validator Verdict Logic 포함) — `git diff --stat`으로 diff
  0 확인. Canonical 65 = 65/65, Robustness = 52/54, G-07 Output Wording
  Test = 3/3, `validate-official.mjs` 독립 재검증 0 changed — 전부
  재실행하여 기존과 동일함을 확인(회귀 없음)
- **Master Handoff 신설**: `docs/REPENT-MASTER-HANDOFF.md` — PM 지시
  (`REPENT — DOCUMENT / HANDOFF OPERATING RULE`)에 따라 새 세션이 전체
  재조사 없이 시작할 수 있는 Current Entry Point 문서 생성(Product
  Foundation/Branch/Commit/Doc Map/AI-VGL/Canonical 65/Runtime/G-07/
  Privacy·Minor·Scripture/Production HOLD/Completed/Blocking/P0/Next
  Action 포함). 과거 History는 CHANGELOG·기존 docs에 유지, 이 문서는
  최신 상태 스냅샷 역할만 함
- New Theology Rule Created = 0 / New Product Meaning Created = 0

## Pre-API Parallel Package 2 — Governance Docs (2026-09-05)
- `docs/06-ai-vgl-guardrail.md`: Human Review Router / Scripture Check
  Router 요약 문서화(Notion Hub 확정 필드·SLA·Recommendation Category
  그대로 인용, 재정의 없음) + "Validator ≠ Full Governance" 명시(Text
  Validator PASS가 Governance PASS/Production Release 승인을 의미하지
  않음을 5개 층 표로 정리)
- `docs/08-social-safety.md`: Spiritual Judgment Boundary 3단계
  (ALLOW/BLOCK/BOUNDARY, `tests/g07/wording-check.mjs` 구현 그대로) +
  Minor Safety **OPEN/HOLD 구분** — 이 세션에서 어떤 결론도 내리지
  않았음을 명시(Owner/Legal 결정 영역)
- `docs/09-acceptance-criteria.md`: PASS/NOT RUN/HOLD 3상태 정의(문서
  전역 공통 어휘로 확정), G-01~G-10 Acceptance(Canonical 매핑 AC 라우팅
  기준, 전부 실행·확인 — G-07만 구조적이라 N/A), Router
  Acceptance(HUMAN_REVIEW/SCRIPTURE_CHECK/REWRITE 전부 Canonical 기준
  PASS), Privacy/Social/Runtime Gate Acceptance 표(HOLD 8건 정직하게
  나열). Canonical 65 수치를 최신(65/65, Robustness 52/54)으로 갱신
- `docs/10-decision-open-hold-register.md`: 빈 스텁이었던 문서를 실제
  Register로 작성 — PM 지정 최소 11개 항목(Validator PASS/API
  Binding/Provider Smoke/Official 65/G-07/Privacy/Minor Safety/
  ShareCopy/Scripture License/Scripture Retrieval/Production Release)
  + 이미 Resolved된 항목 별도 구획
- `docs/07-privacy-security.md`: Longitudinal/Sensitive Repentance
  Context가 왜 OFF인지(Phase A 확정 근거) 정리, Consent Gate가 Phase C
  진입 전 확인해야 할 5개 항목 명세(결정은 안 함), "Memory OFF until
  Approved" 재확인
- `.env.example` 신규 — `OPENAI_API_KEY=` 자리만, 실제 값 없음
- 이번 라운드는 문서 작업만 — Canonical AC 신규 생성/승격 없음(G-07의
  5건은 이미 CANDIDATE 상태 유지, 승격 안 함), 코드 변경 없음, API 호출
  없음, Production Release 상태 변경 없음
- New Theology Rule Created = 0 / New Product Meaning Created = 0

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
