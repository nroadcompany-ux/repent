# REPENT — HTML UX Validation Prototype (ux-v1-2)

**상태: NON-CANONICAL / UX VALIDATION ONLY / OWNER REVIEW용**

이 폴더는 Owner UX 개편안을 브라우저에서 실제로 눌러보며 검증하기 위한
HTML 프로토타입이다. 구현 산출물이 아니다.

- Canonical Product Meaning은 여전히 `docs/final/01~10`이다.
- 이 프로토타입은 Final Documentation을 대체하지 않는다.
- Figma Visual Lock을 교체하지 않는다.
- Production App(`app/`, `src/`)은 이 프로토타입을 근거로 수정하지 않는다.
- Owner PASS 전에는 어떤 내용도 Canonical로 승격하지 않는다.

## 위치가 `public/` 아래인 이유

Next.js는 `public/`만 정적 파일로 서빙한다. Preview URL을 확보하려면 이 경로여야
하며, 경로 안에 `prototype/ux-v1-2`를 그대로 유지했다. Production 라우트(`app/`)와
도메인 코드(`src/`)에는 전혀 연결되지 않는다.

## 파일

| 파일 | 역할 |
|---|---|
| `index.html` | 14개 화면 전체 (해시 라우팅) |
| `styles.css` | Soft Lavender 시안 토큰 + 컴포넌트 |
| `app.js` | 화면 전환, 데모 상태 토글 (최소 JS) |

## 검증 대상 Owner UX Delta (모두 CANDIDATE)

1. Main Nav 5개 후보 — 여정 / 기도 / 약속 / 회개 / 고백 (Action 독립 탭 제거)
2. Action을 Promise 내부에서 추가·관리
3. First Entry — Intro → 3개 질문 → 첫 기록 → Journey
4. **3개 질문마다 "왜 묻는지" 목적 설명** — 답을 왜 써야 하는지 화면에서 바로 보이게
5. **인생 그래프** — 좌우 스크롤 생애 타임라인. 사건 점을 곡선으로 잇고, 아래에 사건
   목록, 사건을 누르면 `그날의 생각` / `지금 돌아보면`이 열린다. 예시 데이터는 40세
   여성 기준(유년기·청소년기·대학/청년·결혼·이후 13개 사건)
6. Journey 기록 마커 (기도/약속/실행/회개/고백, 점만)
5. Prayer / Promise / Repentance 상단 Record Count 대시보드 + 최근 맥락 한 줄
6. Reflection Bridge (실행 실패 → 자동 회개 아님)
7. Repentance 4영역 구체화 — 죄를 돌아보기 → 구체적으로 돌아보기 →
   새롭게 깨달은 것(선택) → 돌이키기, + 선택 말씀/약속/실행 연결
8. Repentance 대상 확장 — 과거 기억까지 사용자가 직접 꺼내 기록
9. Confession Feed-first (Threads 참고)
10. Soft Lavender Visual
11. Floating Rounded Bottom Nav

## Cross-Flow Continuity

모든 화면이 **Entry Context / Next Optional Action / Return Target** 셋을 갖는다.

| 연결 | 방식 |
|---|---|
| 기도 → 약속 | 저장 후 브릿지 화면. `여기서 마치기`도 동등하게 제공 |
| 약속 → 실행 | 약속 상세 안에서 바로 입력. 실행은 약속의 하위 기록으로 표시 |
| 실행 → 돌아보기 | 저장 직후 `오늘 이 약속을 어떻게 살아냈나요?`. 성공/실패를 묻지 않음 |
| 돌아보기 → 회개 | 4개 선택지 중 하나. 자동 전환 없음 |
| 회개 → 고백 | 마친 뒤 `일부만 골라 나누기`. 자동 공유 없음 |
| 모든 기록 → 여정 | 저장 시 토스트로 `여정에 남았어요 · 여정에서 보기` |
| Return Contract | 이어서 들어온 화면 상단에 출처를 작게 유지하고, 저장 후 원래 맥락으로 돌아가는 CTA 제공 |

전체 한 바퀴는 상단 `전체 흐름 처음부터` 버튼으로 언제든 다시 시작할 수 있다.

## 유지된 Product Lock

Prayer Response Tracking 없음 · Action Failure ≠ Sin · Failure Cause 질문 없음 ·
Auto Repent 없음 · Repentance Fixed Step / Progress % / Score 없음 ·
`회개 완료` 문구 없음 (Final CTA는 `회개 기록 마치기`) · Faith / Spiritual Score 없음 ·
익명 게시 없음 (공개 범위 3옵션) · 인기순 / 랭킹 / 영적 비교 없음 ·
Missing Day = No Point, 보간 없음(기록 마커 레이어).

상단 카운트는 **단순 기록 수**이며 응답률·점수가 아니다.

## ⚠️ Canonical Lock과 충돌하는 CANDIDATE

Owner가 직접 지시한 항목 중 현재 Canonical Lock과 충돌하는 것이 있다.
Owner PASS 전까지 `docs/final/*`는 그대로 두며, 아래를 판단 대상으로 올린다.

| 항목 | Canonical Lock | 이 프로토타입 |
|---|---|---|
| 인생 그래프의 선 | `docs/final/05` — Interpolation 금지, 성장 그래프처럼 보이게 금지 | 생애 사건 점을 곡선으로 연결 |
| Main Nav | `여정 / 약속 / 실행 / 회개 / 고백` | `여정 / 기도 / 약속 / 회개 / 고백` (실행 탭 제거) |
| Repentance 구성 | Optional Progressive Flow, Fixed Step 금지 | 4개 영역으로 구체화 (번호·진행률은 노출하지 않음) |

인생 그래프에는 다음 방어선을 두었다.

- y축에 **수치·눈금·점수 라벨이 없다.** 높낮이는 사용자가 직접 표시한 `그때의 마음`이다.
- 화면에 "신앙의 수준이나 점수가 아니며, 앱이 판단하지 않습니다"를 명시했다.
- 선으로 잇는 것은 **생애 사건 레이어**뿐이다. 기도·회개 등 **기록 마커 레이어는 여전히
  점만** 찍고 보간하지 않는다(별도 영역으로 분리).
- 사건과 높낮이는 전부 사용자 입력이며 AI가 생성하거나 평가하지 않는다.
