---
status: OWNER_DIRECTED
version: 1.0.0
updated: 2026-09-06
execution_gate: PRODUCTION_BUILD
---

# RETURN Production Build Execution Order

> 목적: RETURN을 Mock/Prototype이 아니라 실제 가입·저장·보안·운영·배포가 가능한 Production Service로 구축한다.

## 1. Source of Truth

작업 전 반드시 아래 GitHub main Canonical을 선독한다.

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
- `docs/REPENT-MASTER-HANDOFF.md`
- `docs/CLAUDE-PM-HANDOFF-2026-09-06.md`
- `docs/CLAUDE-PM-LOW-FI-EXECUTION-ORDER-2026-09-06.md`

새 Product Meaning 생성 금지. Planning Lock 변경 금지.

## 2. Production Stack Direction

- Frontend: Next.js Current Production/LTS + App Router + TypeScript
- Hosting: Vercel
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
  - Google Social Login
  - Naver Social Login
- Storage: Supabase Storage
- AI: Anthropic Claude API, Server-side only

Owner 보고 기준 Supabase Project는 이미 생성됨. 실제 연결 상태는 작업자가 검증 후 Evidence로 보고할 것.

## 3. Environment / Secret

환경 최소 분리:
- Local / Dev
- Preview
- Production

금지:
- Production DB와 Test Data 혼용
- `.env` Commit
- Service Role Key Client 노출
- Anthropic API Key Client 노출

허용 Client Env는 공개키 범위만 사용. Secret은 Vercel Server Environment에만 저장.

## 4. Migration / Schema

Dashboard 수동 변경만으로 완료 처리 금지.
모든 Production DB 변경은 Migration으로 관리한다.

필수 Domain Capability:
- Profile / Church / Denomination / Profile Media / Hashtag
- Prayer Folder / Topic / Record
- Repentance / Draft / ShareCopy
- Promise / Action / Action Record / Reminder
- Journey / Mood / LifeEvent / Bible Reading / Saved Scripture
- Confession / Comment / Reaction / Hashtag / Report / Moderation
- AI Memory Consent / Required Audit Metadata

## 5. Auth / Onboarding

실제 구현:
- Google Login
- Naver Login
- Logout
- Session 유지/갱신
- OAuth Callback
- Onboarding Resume

가입 후 별도 Product Profile 생성.

Profile 최소:
- nickname
- introduction
- church_name
- denomination
- representative profile image
- community display setting

교회명/교단 기본 Private. 사용자가 선택한 경우만 Community에 노출.

Onboarding:
Auth → Terms → Profile → 교회명/교단 → Owner 확정 3문항 → Journey Home.

## 6. RLS / Security — P0

모든 사용자 데이터 Table에 RLS 적용.
RLS 없이 Production GO 금지.

Private Domain 기본 원칙:
`auth.uid() = owner_user_id`

최소 Test:
- Owner Read PASS
- Owner Update PASS
- Other User Read DENY
- Other User Update DENY
- Unauthenticated DENY

Storage도 RLS 적용.

## 7. Storage

Capability:
- Profile Image
- Profile Gallery 최대 30장
- Confession Image
- Voice Recording

Upload Rule:
- Size Limit
- MIME Limit
- UUID Filename
- Image Compression
- EXIF/Privacy 대응
- Delete Flow
- Public/Private Access 분리

## 8. Core Domain

### Journey
- Bottom Tab: 여정
- TODAY: 나의 말씀 / 이어갈 기도 / 오늘의 약속·실행 / 성경읽기
- Graph 5단계 Self Record
- No Input = Missing
- Calendar / Timeline / 나의 말씀 / 성경읽기표 / Search + Filter
- Spiritual Score 금지

### Prayer
- 기도 제목 | 기도문
- 나의 기도 | 중보기도 항상 노출
- 기도함 → 기도 제목 → 날짜별 기도 기록
- 실제 CRUD

### Repentance
- Default Private
- 돌아보기 / 깨닫기 / 돌이킴 약속 / 돌아가기
- Draft + 이어쓰기
- Final CTA: `회개 기록 마치기`
- Progress/Spiritual judgment 금지

### Promise / Action
- 기본 그룹: 나의 삶 / 사람과 관계 / 신앙생활
- Promise 1:N Action
- 실행기록 및 행동 이행률
- Action Failure ≠ Sin
- Retry / Modify / Reschedule / Record Only / Optional Repent

### Confession
- Types: 기도 / 고백 / 은혜 / 일상
- Photo + Comment + Reaction + Hashtag + Report
- Photo 최대 1장/post
- Reaction: 함께 기도해요 / 은혜받았어요 / 마음이 닿았어요
- 1 user/post = 1 reaction, 변경 가능
- AI 금지

## 9. Private Original / ShareCopy

P0 Architecture.

금지:
Private Original Row에 `public=true`만 붙여 공개.

필수:
Private Original → User-selected fields → ShareCopy → Preview → Publish

- Original 수정이 기존 ShareCopy 자동 수정 금지
- ShareCopy 삭제가 Original 삭제 금지
- Source 삭제 시 ShareCopy 자동 삭제 금지
- 사용자에게 기존 ShareCopy 처리 선택 제공

## 10. AI Boundary

Anthropic API는 Server-side only.
AI Memory Default OFF + Explicit Opt-in.

허용:
- Journey Search/Summary
- Prayer 제목/유사기록/요약/문장 refinement
- Promise/Action 구체화
- Repentance 정리/질문/Scripture Reference/Promise Candidate

금지:
- Confession AI
- God's Voice
- Prophet
- Pastor Substitute
- Spiritual Judge
- 죄/용서/구원/응답 판정
- 영적 점수/등급

## 11. Community Safety

- Report
- Block
- Moderator Hide/Delete
- Spam Protection
- Appeal/Review 가능 구조

RETURN 운영정책상 제한 대상 단체의 조직적 포교활동은 제한 가능.
Owner 예시: 통일교, 신천지.
단 사진 1장/교회명/신고 1건만으로 자동 제재 금지.

Minor Public Confession은 Legal/Policy 확정 전 제한, 기본 Private.

## 12. Scripture

현재 Production은 Reference 중심.
Full Text는 License 확인 전 적재 금지.

## 13. No Mock Completion

완료로 인정하지 않음:
- UI만 존재
- Mock JSON
- LocalStorage
- Fake Login
- Fake Upload
- Fake AI
- Hard-coded User/Data

완료는 실제 Supabase/Auth/Storage/DB Persistence 기준.

## 14. Minimum E2E

1. Google 가입 → Profile → Onboarding → Journey
2. Naver 가입 → 동일 Flow
3. Prayer CRUD → Logout/Login → 데이터 유지
4. Repentance Draft → 이어쓰기 → Private 저장
5. Private Original → ShareCopy → Confession → Original 수정 후 공개본 독립 유지
6. Promise → Action → 실행 기록 → 이행률
7. Profile/Gallery Upload/Delete
8. Confession Photo/Comment/Reaction/Report
9. User A → User B Private Prayer/Repentance 접근 DENY
10. Scripture Reference는 Full Text License 없이 정상 동작

## 15. Production Release Gate

반드시 Evidence 반환:
- Production URL
- GitHub Commit SHA
- Vercel Deployment Evidence
- Supabase Migration List
- RLS Policy List
- Auth Provider Test Result
- Storage Bucket/Policy
- E2E Test Result
- Security Check
- Known Issues
- HOLD
- Rollback Method

각 항목: PASS / FAIL / HOLD / NOT TESTED.

## 16. Current Handoff State

- Planning Lock: PASS
- Canonical Promotion: PASS
- Trace/Master Handoff: PASS
- Low-fi Execution Order: issued
- Production Build Order: issued
- Supabase Project: Owner-reported created / connection verification required
- Claude PM1: Owner reports instruction delivered
- Current next state: WAITING FOR CLAUDE PRODUCTION BUILD / REALITY CHECK REPORT

## 17. Final Return Format

```text
[RETURN PRODUCTION BUILD REPORT]

Repository:
Branch:
HEAD SHA:
Production URL:
Preview URL:
Canonical Compliance:
Auth - Google:
Auth - Naver:
Database / Migration:
RLS:
Storage:
Journey:
Prayer:
Repentance:
Promise / Action:
Confession:
AI:
Moderation:
E2E:
Security:
OPEN:
HOLD:
Known Issues:
Owner Action Required:
New Product Meaning Created: 0
Final Verdict: PRODUCTION READY / CONDITIONAL READY / NOT READY
```
