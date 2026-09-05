---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 08 Social Safety

> 상태: OPEN — 작성 중 (아래 Community Moderation Policy 섹션만 Owner/PM
> 지시 반영 — 나머지 Social Safety 영역은 계속 OPEN)

## Community Moderation Policy (G-07 Evidence A)

**출처**: PM 세션 채팅 지시 — `REPENT PARALLEL P0 / G-07 PRODUCT POLICY
EVIDENCE` (2026-09-05). 새 Product Meaning이 아니라 기존 VGL 경계
(`06-ai-vgl-guardrail.md` G-07 섹션)를 실제 운영 문구 기준으로 구체화한
것.

### 시스템이 할 수 있는 것

- 게시물 공개 범위 판단
- 신고 접수·검토
- 운영 정책(콘텐츠 기준) 위반 여부 판단
- 콘텐츠 노출/비노출 처리

### 시스템이 하면 안 되는 것

Moderation Action(숨김·삭제·거부·검토)을 사람의 다음 상태에 대한 판정으로
표현하는 것:
- 회개의 진정성
- 죄의 최종 영적 상태
- 하나님과의 관계 상태
- 용서·구원 상태

### 허용 문구 예시 (콘텐츠/행동 기준)

- "이 게시물은 커뮤니티 운영 기준에 따라 숨김 처리되었습니다."
- "신고된 콘텐츠를 검토 중입니다."
- "이 게시물은 공개 기준을 충족하지 않아 게시되지 않았습니다."

### 금지 문구 예시 (영적 판정으로의 변환)

- "이 고백은 진정한 회개가 아닙니다."
- "당신은 아직 제대로 회개하지 않았습니다."
- "이 죄는 하나님께 용서받지 못했습니다."
- "이 사용자는 신앙적으로 문제가 있습니다."

Moderation Action의 사유(신고 사유, 정책 위반 사유)와 영적 판정은 항상
분리한다 — 같은 메시지 안에 정책 문구와 영적 판정 문구가 섞이는 것도
금지(`tests/g07/`의 BOUNDARY 사례 참조, Output Wording Test 결과는
`09-acceptance-criteria.md`).

**상태 참조(2026-09-05)**: 이 정책을 근거로 만든 AC-G07-01~05는
`09-acceptance-criteria.md`에서 CANDIDATE → **CURRENT / CANONICAL
PRODUCT POLICY AC**로 PM 승인됐다(`10-decision-open-hold-register.md`
G-07 행 참조). 이 문서(정책 원문) 자체의 내용은 변경되지 않았다 — 상태
전환은 AC 문서 쪽에서만 일어났다.

### Spiritual Judgment Boundary — 3단계 판정 (2026-09-05)

`tests/g07/wording-check.mjs`가 실제 구현한 3단계 그대로, 이 문서의
Canonical 정의로 삼는다:

| 판정 | 의미 | 예 |
|---|---|---|
| ALLOW | 콘텐츠/행동 기준 어휘만 존재 | "커뮤니티 운영 기준에 따라 숨김 처리" |
| BLOCK | 영적 판정 어휘가 존재 | "신앙적으로 문제가 있습니다" |
| BOUNDARY | 정책 어휘와 영적 판정 어휘가 한 메시지에 공존 | "운영 기준에 따라 숨김 처리 + 진정한 회개가 아니라서" |

BOUNDARY는 ALLOW도 BLOCK도 아니다 — Moderation 메시지 작성 시 정책
사유만 남기고 영적 판정 문구를 제거해야 ALLOW가 된다(둘 중 하나를
없애는 것이지 자동으로 어느 한쪽으로 판정되는 게 아님).

## Community Reaction (2026-09-05, Owner 확정 — Q7)

- **MVP = 공감(1종)만** 제공
- **금지**: 인기순 노출, 랭킹, 영적 비교(reaction 수로 신앙 수준을
  암시), **Reaction 기반 Faith Signal**(reaction 수를 신앙 지표로
  환산·표시)

## Report Taxonomy (2026-09-05, Owner 확정 — Q8)

**4종**만 사용한다:
1. 개인정보 노출
2. 괴롭힘·혐오
3. 스팸·광고
4. 기타 안전 문제

**금지**: "신앙이 잘못됨", "회개가 부족함" 등 **Spiritual Judgment
신고사유** — 신고 사유는 항상 콘텐츠/행동 기준이어야 한다(위
Community Moderation Policy·AC-G07-04 "신고 사유와 Spiritual
Judgment를 분리한다"와 동일 원칙).

## Minor Safety — OPEN/HOLD 구분 (2026-09-05)

**이 섹션은 미결 상태를 명확히 기록하는 것이지, 정책을 확정하는 것이
아니다.** Notion `REPENT PM Working Hub`(Foundation Lock 관련 여러
라운드)에 반복적으로 명시된 상태를 그대로 옮긴다 — 이 세션에서 새로
결정한 것 없음:

- **Status = HOLD** (Production Backend Blocking)
- 확정된 것: 없음(Minor-sensitive Context는 Runtime Directive에서도
  "Privacy/Consent/Safety/License Gate 전 사용 금지" 대상으로 명시)
- 미확정: 미성년 사용자 식별 방법, 미성년 대상 Confession 공개 제한
  여부, 미성년 대상 Sensitive Memory 처리, 보호자 동의 흐름
- **이 세션에서 결론 내지 않음** — Owner/Legal 판단이 필요한 영역이라
  임의로 OPEN 항목을 HOLD로, 혹은 HOLD 항목을 확정으로 바꾸지 않았다
- Production Release는 이 항목이 Owner에 의해 해소되기 전까지 계속
  HOLD(`10-decision-open-hold-register.md` 참조)

### Minor Confession Sharing (2026-09-05, Owner 확정 — Q9, **여전히 HOLD**)

**Default 자체는 확정됐다 — Public 공유 허용 여부만 HOLD로 남는다**:

- **Default = Private**(미성년 사용자의 Confession은 기본적으로
  비공개) — 이 Default는 확정
- **Public Confession = Age/Protection/Legal Policy 확정 전까지
  HOLD** — 미성년 사용자가 Confession을 Public(이름 공개/이름 가리고
  나누기 포함 공유 범위)으로 게시하는 것을 허용할지는 여전히 결정되지
  않음
- **민감한 죄·회개·상담성 내용은 더 엄격한 제한이 필요**하다는 방향만
  확정 — 구체적 제한 기준(연령 확인 방법, 내용 판정 방법 등)은 여전히
  미정
- 위 "확정된 것: 없음" 서술은 이 세션 이전 상태였고, **이번 라운드로
  'Default=Private'라는 최소한의 확정은 생겼다** — 그 외 미성년 식별
  방법·보호자 동의 흐름 등은 여전히 미확정(Owner/Legal 판단 필요)

(그 외 Social Safety 영역 — 신고 처리 SLA 등은 추후 업데이트)
