---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 06 AI VGL Guardrail

> 상태: OPEN — 작성 중 (아래는 Owner/PM 확정 Canonical Decision만 반영. 미확정 영역은 계속 OPEN)

## VGL for REPENT — Current Working Standard

AI는 다음이 아니다:
- God
- God's Voice
- Prophet
- Pastor Substitute
- Spiritual Judge

AR-01~AR-06 금지 (세부 항목 정의는 VGL 원본 문서 참조 — 본 문서에서 임의 재정의하지 않음).

## 관련 원칙 (LCI / Turning Point / Repent 화면 반영 확인)

- AI가 신앙 수준·회개의 충분함을 판정하지 않는다
- AI는 Turning Point를 확정하지 않고 후보만 제안한다
- 회개는 오직 하나님께 드리는 것이며 AI는 그 매개가 아니다

## G-07 — Community Rule ≠ Spiritual Judgment (2026-09-05, PM 지시 반영)

`runtime/config/gates.json`의 G-07은 `STRUCTURAL_PRODUCT_POLICY`로 분류돼
있다 — Text Validator(REPENT-VGL-VALIDATOR-v0.2)가 텍스트 패턴만으로
PASS/FAIL을 선언할 수 없고, 별도 Product/Community 정책 검토가 필요한
Gate이기 때문이다. 이 섹션은 그 경계의 신학적/원칙적 정의만 담는다 —
실제 정책 문구·AC·테스트는 각각 `08-social-safety.md`,
`09-acceptance-criteria.md`에 있다(중복 관리 금지, 이 문서는 원칙만).

**시스템(운영/커뮤니티 기능)이 판단할 수 있는 것**: 게시물의 공개 범위,
신고 처리, 콘텐츠 노출 여부, 운영 정책 위반 여부 — 전부 콘텐츠/행동
기준의 판단이다.

**시스템이 Moderation 결과로 판정하거나 표현하면 안 되는 것**: 사람의
회개 진정성, 죄의 최종 영적 상태, 하나님과의 관계 상태, 용서·구원 상태.
이건 이 문서 상단의 "AI는 God/Spiritual Judge가 아니다" 원칙이 Community
Moderation 기능에도 동일하게 적용된 것일 뿐이다 — 새로운 신학적 결정이
아니다.

Moderation Action(숨김·삭제·거부 등)이 실행됐다는 사실 자체를
"이 사람은 죄를 지었다/회개하지 않았다/용서받지 못했다" 같은 영적
판정으로 변환해 표현하는 것을 금지한다.

## Validator ≠ Full Governance (2026-09-05)

**REPENT-VGL-VALIDATOR-v0.2(Text Validator) 하나가 전체 Governance가
아니다.** Validator는 Runtime Output 텍스트만 보고 판정하는 한 개 층일
뿐이고, 전체 Governance는 최소 아래 5개 층으로 구성된다 — Validator
숫자(Canonical 65 Routing, Robustness Set 등)만으로 "Production 준비
완료"라고 말하지 않는다:

| 층 | 역할 | 현재 상태 |
|---|---|---|
| Text Validator (REPENT-VGL-VALIDATOR-v0.2) | BLOCK/REWRITE/SCRIPTURE_CHECK/HUMAN_REVIEW/ALLOW 텍스트 라우팅 | Canonical 65 = 65/65 (ENGINEERING PASS), Robustness = 52/54 |
| Human Review Queue | HUMAN_REVIEW 라우팅된 건을 사람이 검토 | 아래 섹션 참조 — Queue 자체는 Validator 밖 |
| Scripture Check Queue | SCRIPTURE_CHECK 라우팅된 건을 Source/License/Context 검증 | 아래 섹션 참조 |
| Structural Product Gate (G-07 등) | 텍스트가 아니라 Product/Community 정책으로만 판정 | `REQUIRES_PRODUCT_REVIEW` |
| Privacy/Consent·Minor Safety·Scripture License Gate | Owner/Legal 결정 필요 | `07-privacy-security.md`, `08-social-safety.md` 참조, 전부 HOLD |

Validator가 Canonical 65에서 65/65를 내도 **Human Review Queue 미구현,
Scripture Check Queue 미구현, Privacy/Consent 미결, G-07 CANDIDATE
상태**면 Production Release 판단과는 무관하다 — Validator PASS와
Governance PASS를 같은 것으로 보고하지 않는다.

## Human Review Router (Queue Specification 요약)

`HUMAN_REVIEW_ROUTER_FAMILIES`(`runtime/validators/validator.v0.2.mjs`)가
문맥 의존적 개인 신적 관계 진술(예: 위로일 수도, 부적절한 개인 신적
선언일 수도 있는 문장)을 HUMAN_REVIEW로 보낸다. 이 라우팅 자체는
Validator 안에서 실행·확인됐지만(Canonical 65 HUMAN_REVIEW Routing =
2/2), **그 뒤에 사람이 실제로 검토하는 Queue 시스템은 아직 없다** —
Notion `REPENT PM Working Hub`에 명시된 원칙만 확정 상태:

- **Auto approval = FORBIDDEN** — HUMAN_REVIEW로 라우팅된 건은 시스템이
  자동으로 ALLOW/BLOCK 확정하지 않는다
- **SLA(Candidate, 미확정)**: P0 4시간 이내 1차 검토 / P1 1영업일

Queue 구현에 필요한 최소 필드(아직 미구현 — Candidate 스키마):
`case_id`, `runtime_id`, `input_text`, `matched_rule`(HR-* family id),
`routed_at`, `severity`(P0/P1), `reviewer`, `review_status`
(pending/approved/rejected/escalated), `decision_at`, `decision_reason`.

## Scripture Check Router (Queue Specification 요약)

`SCRIPTURE_ROUTER_FAMILIES`가 (a) 명시적 성경 인용, (b) 출처 없는 일반
신앙 진술을 SCRIPTURE_CHECK로 보낸다(Canonical 65 Routing = 1/1). Phase A
에서는 Scripture Retrieval 자체가 OFF라 이 라우팅이 걸리면 항상 사람
검토로 가야 하며 시스템이 확정 해석으로 바꾸지 않는다. Notion
`REPENT PM Working Hub`의 Scripture Check Gate 검증 필드(확정, 재정의
아님):

`Canonical Verse ID → Translation → Source → Context → Approved Corpus
→ License Status → Product Usage Permission → Recommendation Category →
Interpretation Status`

Recommendation Category 3종(확정): `Directly Relevant Scripture` /
`Theme-related Scripture` / `Reflection Candidate`.

**우리말성경 Full Text License 자체는 여전히 미확보(HOLD)** —
`07-privacy-security.md`/`10-decision-open-hold-register.md` 참조. 이
Queue 필드 정의는 라이선스 확보와 별개로 미리 준비해둔 것뿐이다.
