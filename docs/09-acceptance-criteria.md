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
Validator v0.2(Gate 기반, Correction Round 2 + Targeted Correction까지
반영)는 Canonical 65 Regression **65/65**, Robustness Set(비Canonical
파라프레이즈) **52/54**(잔여 2건은 Validator 결함이 아니라 Governance
검토 대상으로 별도 분류 — `docs/ai-runtime/runtime-binding.md` 참조).

## PASS / NOT RUN / HOLD 기준 (2026-09-05, 문서 전역 공통 정의)

이 저장소의 모든 문서·RETURN에서 이 세 상태는 다음 의미로만 쓴다 —
혼용 금지:

| 상태 | 의미 |
|---|---|
| **PASS** | 실제로 실행한 테스트/점검이 있고, 그 결과가 기대값과 일치함이 확인됨(재현 가능한 evidence 존재) |
| **NOT RUN** | 메커니즘(코드·Runner)은 존재하나 아직 실행하지 않음(예: Official 65 Model Run — Runner는 있지만 API Key가 없어 안 돌림) |
| **HOLD** | 실행 여부와 무관하게 Owner/PM/Legal의 결정이 먼저 필요해 의도적으로 시작하지 않음(예: Minor Safety, Scripture License) |

"Validator PASS"는 Text Validator 라우팅이 맞았다는 뜻일 뿐 "Governance
PASS"나 "Production Release 승인"을 의미하지 않는다
(`06-ai-vgl-guardrail.md` "Validator ≠ Full Governance" 참조).

## G-01~G-10 Acceptance (Canonical 65 부분집합 기준, 실행 확인)

**범위 한정**: 아래는 "그 Gate에 매핑된 Canonical AC들에 대해 현재
Text Validator가 맞게 라우팅하는가"만 확인한 것이다. Official Model
Run(실제 Provider 호출)이 아니고, Robustness(일반화) 검증도 아니다 —
이 표 하나로 Gate가 "완전히 통과됐다"고 말하지 않는다.

| Gate | Validation Type | Canonical 매핑 AC 라우팅 |
|---|---|---|
| G-01 | TEXT_ONLY | PASS (1/1) |
| G-02 | TEXT_ONLY | PASS (5/5) |
| G-03 | TEXT_ONLY | PASS (4/4) |
| G-04 | TEXT_ONLY | PASS (1/1) |
| G-05 | TEXT_ONLY | PASS (3/3) |
| G-06 | TEXT_ONLY | PASS (3/3) |
| G-07 | STRUCTURAL_PRODUCT_POLICY | **PRODUCT POLICY PASS** (2026-09-05 PM 승인 — Evidence Complete, 텍스트 라우팅과는 별개로 판정. 텍스트 매핑 AC 2/2는 참고용으로 유지) |
| G-08 | TEXT_ONLY | PASS (2/2) |
| G-09 | TEXT_ONLY | PASS (3/3) |
| G-10 | TEXT_ONLY | PASS (5/5) |

## Router Acceptance (Canonical 65 기준, 실행 확인)

| Router | 결과 |
|---|---|
| HUMAN_REVIEW Router | PASS — Canonical HUMAN_REVIEW 2/2 정확 라우팅. Queue 자체(사람이 실제 검토)는 미구현 — `06-ai-vgl-guardrail.md` 참조 |
| SCRIPTURE_CHECK Router | PASS — Canonical SCRIPTURE_CHECK 1/1 정확 라우팅. Queue/License 검증은 미구현·HOLD |
| REWRITE Router | PASS — Canonical REWRITE 2/2 정확 라우팅 |

## Privacy / Social / Runtime Gate Acceptance

| Gate | 상태 | 비고 |
|---|---|---|
| Privacy/Consent Gate | **HOLD** | `07-privacy-security.md` 참조 — Owner/Legal 결정 필요, 이 세션에서 미결정 |
| Minor Safety Gate | **HOLD** | `08-social-safety.md` 참조 |
| ShareCopy Source Delete Policy | **부분 확정 + 잔여 HOLD** | 원칙(Share Delete≠Source Delete, Soft30일→Hard Delete)은 `05-data-model.md` Owner Lock. Production 상세 구현 확인은 HOLD |
| Scripture License/Retrieval Gate | **HOLD** | 우리말성경 Full Text License 미확보 |
| API Runtime Binding | **HOLD** | `OPENAI_API_KEY` 없음 |
| Official 65 Model Run | **NOT RUN** | Runner는 존재(`tests/vgl/runner/run.mjs --official`), 미실행 |
| Production Release | **HOLD** | 위 전부 해소 전까지 유지 |

## Community Moderation AC (G-07) — CURRENT / CANONICAL PRODUCT POLICY AC

**2026-09-05 PM 승인 — CANDIDATE / PM REVIEW REQUIRED → CURRENT /
CANONICAL PRODUCT POLICY AC로 상태 변경.** Canonical Owner: **REPENT
Product Policy / Social Safety** (VGL-RPT-AC-001~065의 Canonical
Owner인 VGL Red-Team Source와 다름).

**Source Owner가 다름 — 위 "AI Runtime 65 AC(VGL-RPT-AC-001~065)"와 계속
분리 관리하고 합산하지 않는다.** 이 5건은 PM 세션 채팅 지시
(`REPENT PARALLEL P0 / G-07 PRODUCT POLICY EVIDENCE`, 2026-09-05)에서
제시되고, 이후 `REPENT — G-07 CANONICALIZATION DECISION`(같은 날)으로
승인됐다 — `VGL-RPT-AC-001~065` 원문 자체에는 존재하지 않으며, 그 65건을
변경하거나 그 안에 편입한 것이 아니다.

| AC ID | 내용 | 상태 |
|---|---|---|
| AC-G07-01 | Moderation 결과는 콘텐츠/행동 기준으로만 표현된다 | **CURRENT / CANONICAL** |
| AC-G07-02 | Moderation 결과가 사용자의 영적 상태 판정으로 확장되지 않는다 | **CURRENT / CANONICAL** |
| AC-G07-03 | 게시물 Hide/Delete/Reject가 죄/회개/구원 판정으로 표현되지 않는다 | **CURRENT / CANONICAL** |
| AC-G07-04 | 신고 사유와 Spiritual Judgment를 분리한다 | **CURRENT / CANONICAL** |
| AC-G07-05 | Admin 화면에서도 Spiritual Score/Faith Label 생성 금지 | **CURRENT / CANONICAL** |

Validation Type: `STRUCTURAL_PRODUCT_POLICY` (`runtime/config/gates.json`
G-07 참조) — Text Validator(REPENT-VGL-VALIDATOR-v0.2) PASS/FAIL 집계에
**여전히 포함하지 않는다** — Canonical 승격이 이 분리 원칙 자체를
바꾸지 않는다. 검증 방법은 Output Wording Test(아래) 참조.

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

## PRODUCT FUNCTIONAL TRACE (2026-09-05, Owner/PM 확정 — Canonicalization Batch)

**분리 원칙(재확인)**: 아래 Working ID(US-RPT-\*)는 **Product
Functional AC**다. `VGL-RPT-AC-001~065`·`AC-G07-01~05`와 **수정·합산
금지** — 각자 독립 트랙으로 유지한다. Working ID는 Trace 목적의
임시 식별자이며, Canonical Feature ID로의 승격은 별도 PM/Owner
지시가 있을 때만 진행한다.

### US-RPT-JNY-001 — 시간 범위별 Journey 조회

- **Purpose**: 사용자가 자신의 삶/신앙 기록을 시간 위에서 확인한다
- **Task**: Time Range(Today/Week/Month/Year/All) 선택, Life Curve +
  Faith Record Marker 렌더링, Missing Day 처리
- **AC**: No Input = No Point / Interpolation(보간) 금지 / Faith
  Score 생성 금지
- **Related Flow**: `02-user-flow.md` A. Journey
- **Related Entity**: LifeEvent, Season, StoryArc
- **Related Policy**: `04-policy-business-rules.md` Missing Day Rule, LCI

### US-RPT-JNY-002 — Turning Point 표시

- **Purpose**: 사용자가 삶의 중요한 시점을 직접 확정한다
- **Task**: AI 후보 제안 UI + User Confirm 액션
- **AC**: TurningPoint는 User Confirm이 있어야 확정됨(AI는 후보만 제안)
- **Related Flow**: `02-user-flow.md` A. Journey
- **Related Entity**: TurningPoint
- **Related Policy**: `04-policy-business-rules.md` Turning Point

### US-RPT-PRY-001 — 기도 기록(Prayer Only 종료 포함)

- **Purpose**: 사용자가 하나님께 드리는 기도를 기록한다
- **Task**: Prayer 작성 + Optional Reflection/Scripture/Surrender/
  Promise/Action 단계 + Prayer Only Exit 경로
- **AC**: Prayer Only로 종료 가능(다른 단계 강제 없음)
- **Related Flow**: `02-user-flow.md` B. Prayer
- **Related Entity**: Prayer
- **Related Policy**: `00-product-foundation.md` Requirement Matrix(Prayer)

### US-RPT-PRY-002 — 기도 응답 추적 금지

- **Purpose**: AI/System이 기도의 응답 여부를 판정·집계하지 않음을
  보장한다
- **Task**: 응답 상태(Answered/Pending) 필드·통계 화면 자체를 만들지
  않음(Negative Requirement)
- **AC**: Answered/Pending/Response Rate 기능 없음
- **Related Flow**: `02-user-flow.md` B. Prayer
- **Related Entity**: Prayer
- **Related Policy**: `04-policy-business-rules.md` Prayer Response Tracking

### US-RPT-PRM-001 — 약속 기록 및 사용자 종료

- **Purpose**: 사용자가 스스로 결단을 기록하고 실행과 연결한다
- **Task**: Promise 작성, Action 1:N 연결, 사용자 종료 액션("마무리됨")
- **AC**: Promise 1:N Action / Miss ≠ Sin / Streak 금지 / 종료 표현
  = "마무리됨"
- **Related Flow**: `02-user-flow.md` C. Promise
- **Related Entity**: Promise, Action
- **Related Policy**: `04-policy-business-rules.md` Promise

### US-RPT-ACT-001 — 실행 기록 및 완료

- **Purpose**: 결단을 실제 삶의 행동으로 옮긴 것을 기록한다
- **Task**: Action 작성, Done 처리
- **AC**: Action Failure ≠ Sin(완료 경로에서도 실패를 죄로 판단하지 않음)
- **Related Flow**: `02-user-flow.md` D. Action
- **Related Entity**: Action
- **Related Policy**: `04-policy-business-rules.md` Action Failure

### US-RPT-ACT-002 — 실행 실패 후속 선택

- **Purpose**: 실행이 계획과 달랐을 때 사용자가 다음 행동을 스스로
  선택하게 한다
- **Task**: Follow-up Action Choice 5종(Retry/Modify/Reschedule/
  Record Only/Optional Repent) 제시, Failure Cause 질문 UI 미생성
- **AC**: Auto Repent 금지(Optional Repent만 허용) / 5 Follow-up
  Choice 제공 / Failure Cause Taxonomy 생성 금지
- **Related Flow**: `02-user-flow.md` D. Action
- **Related Entity**: Action, RepentanceRecord(Optional Repent 선택 시)
- **Related Policy**: `04-policy-business-rules.md` Action Failure

### US-RPT-RPN-001 — 회개 Optional Progressive Flow

- **Purpose**: 하나님 앞에서 돌아보고 고백하는 기록을 남긴다
- **Task**: 돌아보기 → 고백하기 → Optional Scripture/돌이킴/Promise/
  Action 단계 구현(고정 스텝 UI·진행률 바 금지)
- **AC**: Fixed Steps 없음 / Progress(진행률) 표시 없음 / 점수 없음
- **Related Flow**: `02-user-flow.md` E. Repentance
- **Related Entity**: RepentanceRecord
- **Related Policy**: `04-policy-business-rules.md` Repentance Fixed 10-Step

### US-RPT-RPN-002 — 회개 기록 마치기

- **Purpose**: 회개 기록을 사용자 스스로 종료한다
- **Task**: Final CTA "회개 기록 마치기" 제공, 완료 문구 "하나님께
  드린 회개를 기록했습니다" 표시
- **AC**: Sincerity/Sufficiency(진정성/충분성) 판단 없음 / CTA =
  "회개 기록 마치기"
- **Related Flow**: `02-user-flow.md` E. Repentance
- **Related Entity**: RepentanceRecord
- **Related Policy**: `04-policy-business-rules.md` Repentance Fixed
  10-Step, `06-ai-vgl-guardrail.md` AR-04/G-04

### US-RPT-CNF-001 — 고백 작성 및 공개(Direct)

- **Purpose**: 개인 기록을 선택적으로 타인과 나눈다
- **Task**: Group/Type 선택, Privacy 3옵션 선택, Preview, Publish
- **AC**: Anonymous 게시 금지 / Privacy 3옵션(나만 보기 / 이름 가리고
  나누기 / 이름 공개로 나누기)
- **Related Flow**: `02-user-flow.md` F. Confession Direct
- **Related Entity**: Confession
- **Related Policy**: `07-privacy-security.md` Confession Privacy

### US-RPT-SHR-001 — Private Source 공유(ShareCopy)

- **Purpose**: Prayer/RepentanceRecord 등 비공개 기록을 선택적으로
  공유한다
- **Task**: Select Fields → Mask/Named → Preview → ShareCopy 생성
- **AC**: ShareCopy = Snapshot / Delete 방향 3원칙 분리(Source
  Edit/Delete ≠ ShareCopy 자동 반영, ShareCopy Delete ≠ Source Delete)
- **Related Flow**: `02-user-flow.md` G. Private Source Share
- **Related Entity**: ShareCopy
- **Related Policy**: `05-data-model.md` Sharing 3원칙

### US-RPT-SCR-001 — 말씀 참고 제시(Reflection Reference)

- **Purpose**: 사용자 상황에 참고할 말씀을 제시한다(확정 계시 아님)
- **Task**: 3-Category(Directly Relevant/Theme-related/Reflection
  Candidate) 분류 제시, 리터럴 문구 규칙 적용
- **AC**: Reference Category로만 제시 / "하나님이 이 말씀을 당신에게
  주셨습니다" 류 Divine Voice wording 금지 / Full Text Production은
  License HOLD
- **Related Flow**: 각 Domain Flow의 Optional Scripture 단계(전용
  Flow 미정의 — Cross-cutting)
- **Related Entity**: ScriptureReference
- **Related Policy**: `06-ai-vgl-guardrail.md` Scripture Check
  Router, Literal Product Copy Rule

### US-RPT-MOD-001 — 커뮤니티 운영 검토(Moderation)

- **Purpose**: Confession의 공유 Surface에서 신고·운영 검토를 수행한다
- **Task**: **CANDIDATE** — Reaction/Report Taxonomy/Moderation
  Workflow Detail/Moderator Action Detail 전부 미확정, Feature 자체
  미구현(`01-ia.md` Community 참조)
- **AC**: **기존 `AC-G07-01~05`를 그대로 참조한다 — 중복 AC를 새로
  만들지 않는다.**
- **Related Flow**: 미정(Feature가 CANDIDATE 단계)
- **Related Entity**: Confession, ShareCopy(Moderator는 이 둘만 열람
  가능 — Private Prayer/RepentanceRecord Source 접근 불가)
- **Related Policy**: `06-ai-vgl-guardrail.md` G-07, `08-social-safety.md`
  Community Moderation Policy, 위 "Community Moderation AC (G-07)" 섹션

### US-RPT-ONB-001 — 가입 온보딩(3개 진입 질문)

- **Purpose**: 가입 직후 부담 없이 첫 기록을 시작하게 한다
- **Task**: 3개 진입 질문 제시(선택 응답), 첫 기록으로 자연스럽게 연결
- **AC**: 5개 메뉴 전체 Tutorial 강제 없음 / 질문 응답은 건너뛰기 가능
- **Related Flow**: `02-user-flow.md` H. Onboarding
- **Related Entity**: 없음(온보딩 자체는 Record를 강제 생성하지 않음)
- **Related Policy**: `04-policy-business-rules.md` Onboarding

### US-RPT-SEA-001 — Journey 내부 검색/필터

- **Purpose**: 사용자가 자신의 Journey 기록을 빠르게 다시 찾는다
- **Task**: 기간/기록종류/키워드/LifeEvent/Season/StoryArc 기준 검색+필터 제공
- **AC**: Journey 내부 기능으로만 존재 / 독립 Bottom Tab 생성 금지
- **Related Flow**: `02-user-flow.md` A. Journey
- **Related Entity**: LifeEvent, Season, StoryArc
- **Related Policy**: `00-product-foundation.md` System-Level Capabilities(Search)

### US-RPT-NOT-001 — Promise/Action Reminder

- **Purpose**: 사용자가 스스로 설정한 리마인더만 받게 한다
- **Task**: Promise/Action에 대한 사용자 설정 Reminder 발송
- **AC**: Prayer/Repentance 재촉 Push 기본 제공 금지 / 죄책감·영적
  압박 문구 금지
- **Related Flow**: `02-user-flow.md` C. Promise, D. Action(임베드된
  부가 기능 — 전용 Flow 아님)
- **Related Entity**: Promise, Action
- **Related Policy**: `04-policy-business-rules.md` Notification

### US-RPT-ACC-001 — 계정 삭제(탈퇴)

- **Purpose**: 탈퇴 시 개인 기록과 공유본을 사용자 의사대로 정리한다
- **Task**: Private Source 삭제 절차 진입, ShareCopy 유지/삭제 선택
  UI 제공, 법적/운영 로그를 Content와 분리해 최소 범위·최대 6개월
  보관
- **AC**: ShareCopy는 자동 일괄 삭제·자동 일괄 유지 둘 다 아님(사용자
  선택 필수) / 로그 보관 상한 6개월
- **Related Flow**: 전용 Flow 미정의(Product Documentation Lock 이후
  진행)
- **Related Entity**: User, 전 Private Entity, ShareCopy
- **Related Policy**: `07-privacy-security.md` Account Delete

### US-RPT-ACC-002 — 기록 Export

- **Purpose**: 사용자가 자신의 기록을 내보낼 수 있게 한다
- **Task**: **우선순위 낮음(MVP 이후)** — Product Planning 범위에는
  포함, 구현 순서는 후순위
- **AC**: (구현 상세는 착수 시점에 확정 — 현재는 "포함됨"만 AC)
- **Related Flow**: 미정
- **Related Entity**: User, 전 Entity(Export 대상)
- **Related Policy**: `00-product-foundation.md` System-Level Capabilities(Export)

### US-RPT-MEM-001 — AI Memory Opt-in

- **Purpose**: AI가 사용자 동의 없이 민감 기록을 재사용하지 않게 한다
- **Task**: Default OFF 유지, Explicit Opt-in UI 제공, 중지/삭제 기능
  제공
- **AC**: Prayer/Repentance 등 민감 기록은 동의 없이 AI Context로
  재사용 금지 / 사용자가 언제든 중지·삭제 가능
- **Related Flow**: 전용 Flow 미정의(Phase C 진입 전까지는 기능
  비활성 — `runtime/config/runtime.candidate.json` memory: OFF)
- **Related Entity**: 전 Private Entity(재사용 대상 후보)
- **Related Policy**: `07-privacy-security.md` AI Memory — Opt-in Policy

### US-RPT-MOD-002 — Community Reaction(공감)

- **Purpose**: 공유된 콘텐츠에 최소한의 긍정 반응을 표현하게 한다
- **Task**: 공감 1종 Reaction 버튼 제공
- **AC**: 인기순/랭킹/영적 비교/Reaction 기반 Faith Signal 생성 금지
- **Related Flow**: `02-user-flow.md` F. Confession Direct(공유 후
  열람 화면에 부가 — 전용 Flow 아님)
- **Related Entity**: Confession, ShareCopy
- **Related Policy**: `08-social-safety.md` Community Reaction

### US-RPT-MOD-003 — Report(신고) 접수

- **Purpose**: 공유된 콘텐츠에 대한 신고를 콘텐츠/행동 기준으로만
  접수한다
- **Task**: 신고 사유 4종(개인정보 노출/괴롭힘·혐오/스팸·광고/기타
  안전 문제) 선택 UI 제공
- **AC**: Spiritual Judgment 신고사유(예: "신앙이 잘못됨") 생성 금지 —
  **기존 `AC-G07-04`(신고 사유와 Spiritual Judgment 분리)를 참조,
  중복 AC 생성 안 함**
- **Related Flow**: 전용 Flow 미정의(Moderation Workflow Detail이
  CANDIDATE인 동안 신고 접수 UI만 우선 정의됨)
- **Related Entity**: Confession, ShareCopy
- **Related Policy**: `08-social-safety.md` Report Taxonomy, `06-ai-vgl-guardrail.md` G-07

### US-RPT-SCR-002 — Scripture MVP(Book/Chapter/Verse 중심)

- **Purpose**: 확정 계시가 아닌 참고 자료로 말씀을 제시한다
- **Task**: Book/Chapter/Verse Reference 표시를 기본으로 구현, Full
  Text는 License 확보 후로 지연
- **AC**: AI는 관련 말씀 "후보"만 제시(확정 해석 금지) / Full Text
  Production은 License HOLD 유지
- **Related Flow**: 각 Domain Flow의 Optional Scripture 단계(SCR-001과
  동일 — Cross-cutting)
- **Related Entity**: ScriptureReference
- **Related Policy**: `06-ai-vgl-guardrail.md` Scripture MVP Scope

### US-RPT-SHR-002 — Source Delete 시 ShareCopy 처리

- **Purpose**: 원본 삭제 시 이미 공유된 ShareCopy를 사용자 의사대로
  정리한다
- **Task**: Source 삭제 액션 시 기존 ShareCopy 목록 제시, 함께 삭제
  여부를 사용자가 선택
- **AC**: Source Delete가 ShareCopy를 자동으로 지우거나 자동으로
  남기지 않음(사용자 선택 필수)
- **Related Flow**: `02-user-flow.md` G. Private Source Share(역방향
  — 삭제 시점의 절차)
- **Related Entity**: ShareCopy
- **Related Policy**: `05-data-model.md` Source Delete 절차

(그 외 Product/화면 단위 AC는 추후 업데이트)
