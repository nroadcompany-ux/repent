---
status: READY
version: 1.0
updated: 2026-09-06
owner_approval: PASS
planning_lock: PASS
canonical_promotion: PASS
---

# RETURN — Claude PM Low-fi HTML Execution Order

문서 ID: RETURN-CLAUDE-LOWFI-EXEC-2026-09-06
수신: Claude PM1
발신: THE WAY PM 운영실
상태: EXECUTION READY

## 1. 실행 목적

Owner 승인 및 Planning Lock이 완료된 RETURN의 Canonical Documentation을 기준으로 Low-fi HTML 전체 패키지를 제작한다.

이번 작업은 신규 Product 기획이 아니다.

**New Product Meaning Created = 0**

Canonical과 충돌하는 과거 Prototype, 과거 Nav, 과거 Working Draft를 재도입하지 않는다.

## 2. 실행 전 필독 Source

반드시 아래 순서대로 실제 GitHub `main`을 읽고 작업한다.

1. `docs/00-product-foundation.md`
2. `docs/01-ia.md`
3. `docs/02-user-flow.md`
4. `docs/03-screen-spec.md`
5. `docs/04-policy-business-rules.md`
6. `docs/05-data-model.md`
7. `docs/06-ai-vgl-guardrail.md`
8. `docs/07-privacy-security.md`
9. `docs/08-social-safety.md`
10. `docs/09-acceptance-criteria.md`
11. `docs/10-decision-open-hold-register.md`
12. `docs/TRACEABILITY-MASTER.md`
13. `docs/REPENT-MASTER-HANDOFF.md`
14. `docs/CLAUDE-PM-HANDOFF-2026-09-06.md`

충돌 시 신뢰 순서:

1. Owner Approved Canonical `docs/00~10`
2. `TRACEABILITY-MASTER.md`
3. `REPENT-MASTER-HANDOFF.md`
4. Claude Handoff
5. 기존 Prototype / 과거 화면

## 3. Main Navigation Lock

반드시 아래 5개 Tab을 유지한다.

**여정 | 기도 | 회개 | 약속 | 고백**

- Action 독립 Bottom Tab 금지
- Action은 Promise 내부 실행 기록
- Search 독립 Tab 금지
- Search는 Journey 내부

## 4. Low-fi 범위

### 4-1. Authentication / Onboarding
- Splash / Entry
- Login / Signup
- Google Social Login
- Naver Social Login
- Profile basic setup
- 교회명
- 교단
- 닉네임
- 대표사진
- 소개
- Profile Gallery 진입
- Hashtag
- 공개범위
- Onboarding 3 Questions
- Resume / Back / Cancel / Return 상태

### 4-2. Journey
최소:
- Journey Home
- RETURN Product Education Rolling Banner
- TODAY Compact 4-slot
  - 나의 말씀
  - 이어갈 기도
  - 오늘의 약속·실행
  - 성경읽기
- 나의 여정 Graph
- Calendar
- Timeline / Recent Records
- 나의 말씀
- 성경읽기표
- Journey Search + Filter
- 날짜별 Record Aggregation View

금지:
- 신앙 점수
- 하나님과의 거리 점수
- No-input 자동 보간
- 회개를 Daily 의무 Tile로 고정

### 4-3. Prayer
최소:
- Prayer Home
- `기도 제목 | 기도문`
- `나의 기도 | 중보기도` Secondary Segment 상시 노출
- 기도함
- 기도 제목 List
- Prayer Topic Detail
- 날짜별 기도 기록
- 기도문 List / Detail / Create / Edit
- AI 기록 도움 Trigger
- Promise로 남기기
- Share 진입

AI는 응답/미응답, 하나님의 뜻, 영적 상태를 판정하지 않는다.

### 4-4. Repentance
최소:
- Repentance Home / Recent
- New Repentance
- 돌아보기
- 깨닫기
- 돌이킴 약속
- 돌아가기
- Draft 임시저장
- 이어쓰기
- Preview / Review
- `회개 기록 마치기`
- 저장 후 Result
- 약속 보기
- 고백으로 나누기
- Journey Return

한글 Primary. 4R 영문은 내부/보조 수준만 허용.

금지:
- 회개 완료율
- 영적 점수
- 죄 판정
- 용서 판정
- 하나님의 음성 대체

### 4-5. Promise / Action
최소:
- Promise Home
- 진행 중 / 마무리됨 / 전체
- 기본 그룹
  - 나의 삶
  - 사람과 관계
  - 신앙생활
- Custom Group
- Promise List
- Promise Detail
- Fulfillment measurement
- Action List
- Action Add
- Action Record
- 실행 상태
- Reminder 설정
- Retry / Modify / Reschedule / Record Only / Optional Repent

Action Failure ≠ Sin.

### 4-6. Confession
최소:
- Feed
- Type Filter: 기도 / 고백 / 은혜 / 일상
- Post Detail
- Write
- Photo Upload: MVP 게시물당 최대 1장
- Hashtag
- Privacy / Share Setting
- Preview
- Publish
- Reaction 3종
  - 함께 기도해요
  - 은혜받았어요
  - 마음이 닿았어요
- 1인 1Reaction / 변경 가능
- Comment
- Report
- Community Profile Detail

Confession에는 AI를 넣지 않는다.

### 4-7. Profile / Community
최소:
- My Profile
- Edit Profile
- 대표사진
- Profile Gallery 최대 30장
- Gallery Category
  - 교회 생활
  - 예배·모임
  - 봉사·섬김
  - 일상
  - 기타
- Hashtag
- 공개범위
- Other User Community Profile
- Church / Denomination 표시 여부
- Report / Block Entry

사진은 교인 인증 수단이 아니다.

### 4-8. Moderation / Safety UX
User-side 최소:
- Report reason
- Report submitted
- Block confirmation
- 이용 주의사항
- Community 이용 제한 안내

Admin 상세 운영화면은 별도 Production/Admin Scope로 분리 표시 가능하나 새 기능을 발명하지 않는다.

## 5. 공통 Screen Contract

각 화면은 최소 아래 7개를 설계 근거로 가진다.

1. Entry
2. Primary CTA
3. Secondary CTA
4. Empty
5. Error
6. Return Target
7. Data Owner

Low-fi 결과물 문서에도 각 주요 화면별 7요소를 표 또는 주석으로 남긴다.

## 6. Cross-domain Contract

Core Loop:

`기도 → 회개 → 약속 → 실행 → 여정`

강제 Wizard가 아니다. Direct Path 허용.

Community Loop:

`Private Original → User-selected ShareCopy → Preview → 고백 Publish → Reaction / Comment`

Journey는 Aggregation / Navigation Owner이고 각 Domain 원본 Owner가 아니다.

## 7. Privacy / Share Lock

Private Original과 공개 ShareCopy를 동일 Row의 public flag 하나로 구현한 것처럼 표현하지 않는다.

공유 UX는 반드시:

`Private Original → 공유 필드 선택 → ShareCopy Draft → Preview → Publish`

민감 필드는 Default OFF.

## 8. AI Guardrail

AI 허용:
- Journey: Search / Summary 보조
- Prayer: 제목 정리 / 유사 기록 / 요약 / 문장 다듬기
- Promise: 약속·실행 구체화
- Repentance: 글 정리 / 성찰 질문 / Scripture Reference / Promise Candidate

AI 금지:
- Confession
- God's Voice
- Prophet
- Pastor Substitute
- Spiritual Judge
- 최종 성경 해석자
- 영적 Score / Verdict

AI Memory는 기본 OFF + 사용자 Opt-in.

## 9. Scripture

현재는 Reference 중심.

Full Text License 확보 전 번역본 전체 본문을 Low-fi에서 Production 확정처럼 사용하지 않는다.

## 10. 디자인 수준

이번 결과물은 **Low-fi HTML**이다.

목적:
- 정보구조
- 화면 밀도
- 사용 흐름
- CTA 우선순위
- Mobile UX
- Cross-flow

검수.

따라서:
- 과도한 Visual Styling 금지
- Brand Final Design 금지
- Figma Final 작업 금지
- 임의의 컬러/일러스트/게임화 추가 금지

단, Owner가 Mobile에서 실제 Flow를 판단할 수 있을 정도의 클릭/이동은 구현한다.

## 11. 산출물 필수

반환물:

1. Low-fi HTML 전체 패키지
2. 실행 가능한 Review URL 또는 명확한 실행 방법
3. Screen Inventory 전체 목록
4. Main Tab별 화면 수
5. Cross-domain Flow Map
6. Owner Review Checklist
7. Canonical → Screen Trace
8. OPEN / HOLD 목록
9. 미구현 Placeholder 목록
10. 변경한 파일 목록
11. Commit SHA 또는 실제 Artifact Evidence

## 12. Owner Review Gate

이 결과물은 즉시 Production 구현 승인이 아니다.

Gate:

Low-fi HTML
→ Owner Mobile Review
→ Correction
→ Owner Visual + UX PASS
→ Final Figma
→ Build Gate
→ Production Implementation

Owner PASS 전 실제 Production 기능 구현을 확장하지 않는다.

## 13. 완료 판정

PASS 조건:
- 5 Main Tab 모두 존재
- Auth / Onboarding 존재
- Profile / Community 존재
- 모든 Core Flow 클릭 검수 가능
- Canonical 위반 0
- New Product Meaning 0
- 주요 화면 Screen Contract trace 가능
- OPEN/HOLD가 명시됨

완료 회신 형식:

- Status:
- Review URL:
- Commit SHA:
- Screen Count:
- Main Tab Coverage:
- Cross-flow Coverage:
- Canonical Deviations:
- OPEN/HOLD:
- Owner Review Points:
- New Product Meaning Created: 0
