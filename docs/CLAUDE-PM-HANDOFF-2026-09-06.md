# RETURN — Claude PM Handoff

Document ID: RETURN-CLAUDE-PM-HANDOFF-2026-09-06
Status: READY FOR LOW-FI HTML
Owner Approval: 2026-09-06

## 1. Mandatory Source Order

1. GitHub Remote
2. Actual Figma Node
3. Notion Current
4. Canonical Artifact
5. Latest Owner Decision
6. Past-session completion claim

Do not trust old prototype or past-session prose over current `main` canonical docs.

## 2. Canonical Files to Read First

Read in order:
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

## 3. Product Lock

Bottom Nav:
`여정 | 기도 | 회개 | 약속 | 고백`

Action is nested under Promise.
Search is inside Journey.

Core loop:
`기도 → 회개 → 약속 → 실행 → 여정`

Do not force the loop.

## 4. Low-fi HTML Assignment

Create a mobile-first Low-fi HTML package for Owner visual/UX review.

Scope must cover at minimum:
- Authentication / Onboarding
- Journey Home + Calendar + Graph + Search/Filter
- Prayer Home / Topic / Detail / Prayer Text
- Repentance Write / Draft / Review
- Promise Home / Detail / Action Record
- Confession Feed / Write / Detail / Comment / Reaction
- Profile Detail / Gallery / Hashtag
- Report / Community Safety minimum flow

Every Main Tab must reflect the 7-element screen contract:
Entry / Primary CTA / Secondary CTA / Empty / Error / Return Target / Data Owner.

## 5. Locked UX Decisions

Journey TODAY:
- 나의 말씀
- 이어갈 기도
- 오늘의 약속·실행
- 성경읽기

Prayer:
- 기도 제목 | 기도문
- 나의 기도 | 중보기도 always visible

Repentance:
- 돌아보기 / 깨닫기 / 돌이킴 약속 / 돌아가기
- Draft + 이어쓰기
- Final CTA `회개 기록 마치기`

Promise:
- 나의 삶 / 사람과 관계 / 신앙생활
- Action nested
- `마무리됨`

Confession:
- 기도 / 고백 / 은혜 / 일상
- Photo max 1 per post
- Comments included
- 3 reactions
- 1 reaction per user per post, changeable
- NO AI

Profile:
- Naver / Google login
- 교회명 / 교단
- profile photo
- Gallery max 30
- Hashtag
- church/denomination not auto-public

## 6. Forbidden Product Drift

Do not create:
- independent Action tab
- independent Search tab
- spiritual score
- obedience score
- repentance completion %
- answered-prayer verdict
- forgiveness/salvation verdict
- God voice simulation
- Confession AI
- popularity ranking / spiritual ranking

Do not reintroduce superseded decisions.

## 7. Visual Review Gate

This assignment is LOW-FI only.

Do NOT:
- finalize Figma
- build production backend
- bind real OAuth
- create production DB
- implement AI API

First deliverable:
- Low-fi HTML
- mobile review URL or local artifact
- screen inventory
- changed/assumed items list
- OPEN/HOLD list

Owner visual + UX PASS is required before Final Figma / Build Gate.

## 8. HOLD — Do Not Invent

- Account Delete final retention period
- Export detail
- Minor legal detail
- Report taxonomy final legal wording
- physical state enum
- Scripture full-text license
- sermon/YouTube layer
- Church Verification detail
- Voice Premium detail
- Production Architecture detail

If needed, mark HOLD. Do not create new Product Meaning.

## 9. Required Return Format

Return:
- Files changed
- URL/path
- Screen count
- Canonical trace used
- New Product Meaning Created = 0
- HOLD/OPEN
- Owner review points
