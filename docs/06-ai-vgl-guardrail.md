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
