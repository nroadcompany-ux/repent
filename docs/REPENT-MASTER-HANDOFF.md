---
status: OWNER_APPROVED
version: 1.1.0
updated: 2026-09-06
planning_lock: PASS
canonical_promotion: PASS
current_phase: PRODUCTION_BUILD_HANDOFF
---

# RETURN Master Handoff

> Repository legacy path는 `REPENT-MASTER-HANDOFF.md`를 유지하되 Product Name은 RETURN을 사용한다.

## 1. Source of Truth

Evidence priority:
1. GitHub Remote
2. Actual Figma Node
3. Notion Current
4. Canonical Artifact
5. Latest Owner Decision
6. Past-session text completion claim

Current canonical source:
- `docs/00-product-foundation.md`
- `docs/01-ia.md`
- `docs/02-user-flow.md`
- `docs/03-screen-spec.md`
- `docs/04-policy-business-rules.md`
- `docs/05-data-model.md`
- `docs/06-ai-vgl-guardrail.md`
- `docs/07-privacy-security.md`
- `docs/08-social-safety.md`
- `docs/09-acceptance-criteria.md`
- `docs/10-decision-open-hold-register.md`
- `docs/TRACEABILITY-MASTER.md`
- `docs/CLAUDE-PM-HANDOFF-2026-09-06.md`
- `docs/CLAUDE-PM-LOW-FI-EXECUTION-ORDER-2026-09-06.md`
- `docs/CLAUDE-PRODUCTION-BUILD-EXECUTION-ORDER-2026-09-06.md`

## 2. Owner Approval / Execution State

- Planning Lock: PASS
- Canonical Promotion: PASS
- Traceability: PASS WITH NON-BLOCKING HOLD
- Main Nav: 여정 | 기도 | 회개 | 약속 | 고백
- Action: Promise 내부
- Search: Journey 내부
- Claude PM Handoff: ISSUED
- Low-fi Execution Order: ISSUED
- Production Build Order: ISSUED
- Supabase Project: Owner-reported created / connection verification required
- Claude PM1: Owner reports instruction delivered
- Current Phase: WAITING FOR CLAUDE PRODUCTION BUILD / REALITY CHECK REPORT
- Figma: after Owner visual/UX PASS
- Production Release: evidence-based Gate only

## 3. Core Loop

`기도 → 회개 → 약속 → 실행 → 여정`

강제 순서가 아니다.

Community optional:
`Private Record → User-selected ShareCopy → 고백 → Reaction / Comment`

## 4. Locked Product Decisions

### Journey
- TODAY 4-slot: 나의 말씀 / 이어갈 기도 / 오늘의 약속·실행 / 성경읽기
- 5단계 자기기록 Graph
- Calendar / 나의 말씀 / 성경읽기표 / Search + Filter
- No input = Missing / no interpolation

### Prayer
- 기도 제목 | 기도문
- 나의 기도 | 중보기도 항상 노출
- 기도함 → 기도 제목 → 날짜별 기도 기록

### Repentance
- 한글 Primary + 4R internal framework
- Draft 임시저장 + 이어쓰기
- Final CTA = `회개 기록 마치기`
- Progress/Completion/Spiritual score 금지

### Promise / Action
- 기본 그룹: 나의 삶 / 사람과 관계 / 신앙생활
- Promise 1:N Action
- 사용자-facing finish = `마무리됨`
- Retry / Modify / Reschedule / Record Only / Optional Repent
- Action Failure ≠ Sin

### Confession
- Types: 기도 / 고백 / 은혜 / 일상
- Photo + Comment MVP
- Photo 최대 1장 / post
- Reaction 3종, 1인 1Reaction, 변경 가능
- No AI

### Profile / Auth
- Social Login: 네이버 / 구글
- 교회명 / 교단 입력
- 대표사진
- Profile Gallery 최대 30장
- Profile / Confession Hashtag
- 교회명/교단 자동 공개 금지

## 5. Production Stack Direction

Owner 승인 방향:
- Frontend: Next.js Current Production/LTS + App Router + TypeScript
- Hosting: Vercel
- DB: Supabase PostgreSQL
- Auth: Supabase Auth / Google + Naver
- Storage: Supabase Storage
- AI: Anthropic Claude API / Server-side only

핵심 원칙:
- Migration First
- RLS 전면 적용
- Storage RLS
- Secret Client 노출 금지
- DEV / PREVIEW / PROD 분리
- Mock / LocalStorage 완료 인정 금지
- 실제 DB Persistence / Auth / Storage / Deployment Evidence 기준

상세는 `docs/CLAUDE-PRODUCTION-BUILD-EXECUTION-ORDER-2026-09-06.md` 참조.

## 6. Theological / AI Guardrail

AI는 God / God's Voice / Prophet / Pastor Substitute / Spiritual Judge / 최종 성경 해석자가 아니다.

금지:
- 죄/용서/구원/응답 여부 판정
- 영적 점수 / 신앙 등급
- Action 실패의 자동 죄 연결
- Confession AI

AI Memory:
- Default OFF
- Explicit Opt-in

## 7. ShareCopy / Privacy

- Private Original과 ShareCopy는 별도 객체
- Source 수정이 기존 ShareCopy에 자동 반영되지 않음
- Source 삭제 시 ShareCopy 자동삭제 금지 + 사용자 선택
- Sensitive fields Default OFF

## 8. Non-blocking HOLD

- Account Delete 최종 보존기간
- Export 상세
- Minor Safety 상세 법적 검토
- Report Taxonomy 운영문구 상세
- Internal Physical State Enum
- Scripture Full Text License
- 유명 목회자 설교 / YouTube Layer
- Church Verification 상세
- Voice Premium 상세

위 HOLD는 임의 해석하여 Product Meaning을 확장하지 않는다.

## 9. Current Next Action — New Session Start Point

새 세션은 재기획하지 않는다.

첫 작업:
1. GitHub Remote HEAD / Claude 작업 결과 Reality Check
2. Claude `RETURN PRODUCTION BUILD REPORT` 수령 여부 확인
3. 실제 Commit / File / Migration / Deployment URL / Test Result 확인
4. Canonical 위반 검사
5. Supabase 연결 / Migration / RLS / Auth / Storage 검증
6. Mock 잔존 검사
7. E2E / Security 결과 검사
8. 결과를 PASS / FAIL / HOLD / UNVERIFIED로 판정

Claude가 아직 작업 중이면 새 작업을 덧붙이지 말고 현재 지시 범위 진행 상태만 확인한다.

## 10. Claude Required Return

반드시 다음 증거를 받아야 한다:
- Repository / Branch / HEAD SHA
- Production URL / Preview URL
- Canonical Compliance
- Google / Naver Auth Test
- Supabase Migration List
- RLS Policy List / Test
- Storage Bucket / Policy
- Core Domain CRUD 상태
- E2E Test
- Security Check
- OPEN / HOLD / Known Issues
- Owner Action Required
- New Product Meaning Created = 0
- Final Verdict: PRODUCTION READY / CONDITIONAL READY / NOT READY

## 11. Completion Rule

`완료`는 말이 아니라 다음 증거 중 하나로 판단한다:
- Remote Commit SHA
- Actual File
- Figma Node
- Notion record
- Test Result
- Deployment URL

확인 불가 시 `UNVERIFIED`.

## 12. Session Handoff Snapshot

2026-09-06 현재:
- Planning: CLOSED / LOCKED
- Canonical: PROMOTED
- Trace / Master Handoff: PRESENT
- Claude Low-fi order: PRESENT
- Claude Production Build order: PRESENT
- Supabase: Owner reports project created; actual project connection not yet verified by PM
- Claude: Owner reports production order delivered
- Current wait state: Claude execution result pending

새 PM 세션은 이 지점에서 시작한다.
