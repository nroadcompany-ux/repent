# REPENT — Owner UX / Planning Delta Working Record

status: NON-CANONICAL / OWNER WORKING RECORD / DO NOT IMPLEMENT AS CANONICAL
updated: 2026-09-06
branch: claude/new-session-gwiqkv

## 0. 목적

현재 HTML Prototype `ux-v1-2` 검수 과정에서 기존 Canonical Planning 대비 Product/UX 의미가 크게 바뀌고 있다. 이 문서는 현재 Owner가 검토 중인 변경안을 잃지 않기 위한 Working Record다.

- `docs/final/01~10` 및 기존 `docs/00~10`을 아직 덮어쓰지 않는다.
- 아래 항목은 Owner PASS 전까지 CANDIDATE / REVIEW 상태다.
- App naming은 보류한다.
- Claude는 먼저 기존 기획 Source를 읽고 기존 의미와 충돌/중복/누락을 회신해야 한다.

## 1. 현재 Owner 방향 — 상위 구조

### Main Navigation Candidate
- 여정
- 기도
- 약속
- 회개
- 고백

### Action
- 독립 Main Tab 제거 후보.
- 약속 상세 내부에서 실행을 추가/기록/관리하는 구조 후보.

### Golden Loop Candidate
기도 → 약속 → 실행 → 돌아보기 → Optional Repentance → Optional ShareCopy/고백 → 모든 기록은 여정에 축적.

### UX 원칙
- 사용자가 어디서 왔는지 / 지금 무엇을 하는지 / 다음에 어디로 갈 수 있는지 보여준다.
- 강제 Funnel보다 Gentle Continuation.
- 각 Tab은 설명/안내/최근 맥락을 먼저 제공한다.
- 40~60대, 특히 여성 사용성을 우선 고려한다.
- Soft Purple + White + Black, Native-like rounded UI 방향.

## 2. Prayer IA Candidate — 현재 Owner 검토안

### 상단 숫자
- `이번 주 기도 / 전체 기록` 숫자 Dashboard는 가치 재검토.
- 기본 화면에서는 제거 후보.
- 대신 `최근 기도 + 이어하기`를 우선 노출하는 방향 검토.
- 숫자는 탐색용 Count로만 제한 검토.

### 3 Depth IA

Depth 1 — 기도 홈 / 기도함
- 기도함 목록
- 사용자 기도함 CRUD 후보
- 시스템 기본 기도함 후보명은 재검토 필요

Depth 2 — 기도 제목 목록
- 제목 직접 생성 / 수정 / 삭제 / 다른 기도함 이동
- 제목별 최근 기도일 등 최소 메타데이터
- `+ 기도 제목 추가`

Depth 3 — 기도 제목 상세
- 기도 제목 본문
- 같은 제목으로 남긴 날짜별 Prayer Record History
- `오늘 이 제목으로 기도하기`
- 하단 Optional Next:
  - 약속으로 남기기
  - 관련 기도 보기
  - 이전/다음 기도 제목 또는 이전/다음 기도 기록 이동
- 관련 기도는 MVP에서 AI 의미판단보다 같은 기도함/사용자 직접 연결/단순 관계 기반 우선 검토.

### 기본 기도함 이름 후보 — 아직 미확정
- 사람을 위한 기도
- 가족과 관계
- 몸과 마음
- 일과 필요한 것
- 교회와 섬김
- 나 자신

기존 `영혼을 위한 중보 / 가족 / 건강 / 재정과 일 / 교회와 사역 / 나 자신`은 재검토 대상.

### Prayer Reflection Prompt
- 기존 `이 기도의 마음 3개 + 강한 분별 질문`은 기본 노출 시 부담/정죄감 우려.
- 기본 화면에서는 접힌 `조금 더 깊이 돌아보기` 형태 후보.
- VGL Copy는 양자택일/동기 의심형보다 자기 성찰 초대형으로 완화 검토.

## 3. Repentance Candidate

기존 추상적 `돌아보기 → 고백하기 → 돌이킴`보다 실제 기록 행동을 구체화:

- 죄를 돌아보기
- 구체적으로 돌아보기
- 새롭게 깨달은 것 (선택)
- 돌이키기

번호/진행률은 화면에 노출하지 않는 방향.

예시 VGL:
- "오늘 어떤 죄를 돌아보게 되었나요? 오늘 일이 아니어도 됩니다. 오래 마음에 남아 있던 기억이나 사건도 지금 꺼낼 수 있어요."
- "그 죄와 관련해 어떤 말이나 행동, 태도를 돌아보게 되었나요?"
- "이 일을 돌아보며 무엇을 새롭게 깨닫게 되었나요?"
- "앞으로 어떻게 돌이키고 싶나요?"

Final CTA는 `회개 기록 마치기` 유지.
회개 충분성/용서/진정성 판정 금지 유지.

## 4. Promise / Action Candidate

- Promise 화면은 `하나님과 나의 약속` 방향 검토.
- Action은 약속 내부 하위 기록.
- `마무리됨`은 Full-width CTA가 아니라 Compact Status/Badge.
- 약속→실행→돌아보기→Optional Repentance 연결.
- 실패 원인 Taxonomy / Auto Repent / Miss=Sin 금지 유지.

### Tracker 과잉 우려
Prototype에 추가된 일일 체크표, 목표횟수, D-day, 퍼센트 등은 습관관리/달성률 앱처럼 보일 수 있어 재검토 필요.
특히 `% 달성률`은 Canonical Product Meaning과 Faith/Performance interpretation 경계에서 재검토 대상.

## 5. Journey Candidate

- Journey는 단순 기록 목록이 아니라 삶의 시간축/탐색 지도 역할.
- Life event / Turning Point / Prayer-Promise-Action-Repentance-Confession Marker 연결.
- `신앙` 높낮이 계열은 Faith Score 오해 위험으로 HOLD/재검토.
- 사건을 선으로 연결한 그래프는 `성장/하락`으로 오해되지 않도록 별도 검토.
- 최근 기록 범위 점 Marker는 Missing Day = No Point, interpolation 금지 유지.

## 6. Confession Candidate

- Feed-first / Composer-second 유지 후보.
- Type: 기도 / 고백 / 은혜 / 일상.
- Privacy: 나만 보기 / 이름 가림 / 이름 공개.
- 공감 1종 유지.
- 댓글 / 사진 / 음성은 기존 Canonical에 없으므로 MVP 승격 전 별도 Owner Decision 필요.

## 7. Cross-flow / Continuity Candidate

각 저장 Flow는 다음을 명확히 한다:
- Entry Context
- Current Task
- Optional Next Action
- Return Target
- Journey Marker

중요 연결:
- 기도 → 약속
- 약속 → 실행
- 실행 → 돌아보기
- 돌아보기 → Optional Repentance
- 회개 → Optional ShareCopy → 고백
- 기도문 → Optional ShareCopy → 고백 (기도문 Capability 자체는 별도 Candidate)
- 모든 기록 → Journey

Draft State는 이동 후 돌아와도 유지해야 한다.

## 8. 별도 Candidate / HOLD 검토

아래는 Prototype에서 나왔지만 기존 Canonical 확정과 구분해서 재검토:
- 기도문(대표기도 준비)
- 음성 기록
- 고백 댓글
- 사진 1장
- 기도함 기본 6분류
- Prayer Discernment Prompt 상세
- 신앙 높낮이 그래프
- Promise 일일 체크/횟수/기한/비율
- First Entry: 3 질문 vs Coachmark/Contextual Guidance

## 9. Naming

사용자-facing App Name은 보류.
현재 `REPENT`는 내부 Project/Repository Codename으로 유지 가능.
후보 탐색은 별도 Naming Session에서 진행.

## 10. 다음 검증 절차

1. Claude가 실제 기존 Source를 읽는다.
2. 기존 Product Meaning / IA / Flow / Policy / Story / Data를 Source별로 회수한다.
3. 이 Working Record와 비교하여 SAME / DELTA / CONFLICT / NEW CANDIDATE / HOLD로 분류한다.
4. Owner에게 Decision Table을 반환한다.
5. Owner PASS 전 Canonical Docs/Figma/Production 수정 금지.

New Theology Rule Created = 0
Canonical Promotion = 0
