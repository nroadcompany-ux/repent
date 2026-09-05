---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 00 Product Foundation

> 상태: OPEN — 작성 중 (아래는 Owner/PM 확정 Canonical Decision만 반영. 미확정 영역은 계속 OPEN)

## Canonical Baseline

- Source: REPENT Product Foundation v1.0 LOCK
- Repository: `nroadcompany-ux/repent` / Branch: `main`

## Main Nav (Owner Lock)

여정 | 약속 | 실행 | 회개 | 고백

## Vertical Way (Owner Lock)

Direction → Promise → Action → Today → Now

## 확정 용어 (Owner Lock)

- LifeEvent = 삶의 사건
- Season = 시기
- StoryArc = 이야기 흐름

## AI 원칙

AI는 God / God's Voice / Prophet / Pastor Substitute / Spiritual Judge가 아니다. 상세 가드레일은 `06-ai-vgl-guardrail.md` 참조.

## [Requirement Matrix] (2026-09-05, Owner/PM 확정 Planning 반영 — Canonicalization Batch)

**범위**: 이 표는 새 요구사항을 만드는 것이 아니라, 이미 PM/Owner가
확정·승인한 Domain별 결정(`docs/04-policy-business-rules.md`,
`docs/06-ai-vgl-guardrail.md`, Master Handoff 등)을 Requirement 형식
(WHY/WHO/WHAT/EXPECTED RESULT/NON-GOAL)으로 정리한 것이다. Story/
Task/AC 연결은 `09-acceptance-criteria.md`의 "PRODUCT FUNCTIONAL
TRACE" 섹션 참조.

| Domain | WHY | WHO | WHAT | EXPECTED RESULT | NON-GOAL | STATUS |
|---|---|---|---|---|---|---|
| Journey | 삶과 신앙 기록을 시간 위에서 돌아보기 위해 | User | 시간축 위에서 기록을 남기고 조회 | 사용자가 자신의 삶/신앙 흐름을 시간 순으로 확인할 수 있다 | Faith Score / 하나님과 거리 / Spiritual KPI 생성 | CURRENT |
| Prayer | 하나님께 개인적으로 기도를 드리기 위해 | User | 개인 Prayer Record 작성 | 기도 내용이 저장되고, **Prayer Only로 종료 가능**하다 | Response Tracking(Answered/Pending/Rate), AI/System의 응답 판정 | CURRENT |
| Promise | 사용자가 스스로 결단을 기록하기 위해 | User | 결단(약속)을 기록, **1개 Promise에 여러 Action 연결(1:N)** | 결단이 기록되고 이후 실행(Action)과 연결된다 | Streak, Miss = Sin 판정 | CURRENT |
| Action | 결단을 실제 삶의 행동으로 옮기기 위해 | User | 행동 기록, 실패 시 후속 선택(Follow-up Choice)만 제시 | 실행 여부와 후속 선택(Retry/Modify/Reschedule/Record Only/Optional Repent)이 기록된다 | Failure Cause Taxonomy(원인 분류·질문), 영적 원인 분석 | CURRENT |
| Repentance | 하나님 앞에서 돌아보고 고백하기 위해 | User | **Optional Progressive Flow**로 돌아보기→고백 진행 | 회개 기록이 남고 "회개 기록 마치기"로 종료된다 | 고정 Step/진행률/점수, 진정성·충분성 판정 | CURRENT |
| Confession | 개인 기록을 선택적으로 타인과 나누기 위해 | User | 공개설정 선택 후 Direct 작성 또는 ShareCopy로 공유 | 선택한 공개범위(3옵션)로 콘텐츠가 게시된다 | Anonymous 게시 | CURRENT |
| Scripture | 상황에 참고할 말씀을 제시하기 위해 | User(열람) / System(제시) | 성경 구절을 **Reflection Reference**로 제시 | 사용자가 참고용으로 말씀을 확인한다 | Revelation/Confirmation Engine(하나님이 이 말씀을 확정해 주셨다는 선언) | CURRENT |
| AI/VGL | AI가 안전한 범위 안에서 사용자의 성찰을 돕기 위해 | System(AI) | 판단을 대신하지 않는 **Reflection Assist** 제공 | 사용자가 스스로 판단하도록 돕는 응답이 제공된다 | Spiritual Authority(신적 음성·뜻·판정·계시/예언) 행사 | CURRENT |

## System-Level Capabilities (2026-09-05, Owner Final Decision — Notion TEMP Decision Queue Q1~Q12)

Main/Cross-cutting Domain이 아니라 시스템 전반에 걸친 캐패빌리티.
세부 Story/Task/AC는 `09-acceptance-criteria.md`, Feature 상태는
`01-ia.md` 참조 — 여기서는 WHY/WHAT만 요약한다.

| 항목 | WHY | WHAT | STATUS |
|---|---|---|---|
| Onboarding | 가입 직후 부담 없이 첫 기록을 시작하게 하기 위해 | 3개 진입 질문 제공(오늘 하나님께 듣고 싶은 말씀 / 하나님께 마음을 드리는지 / 하나님과 약속한 것) — 5개 메뉴 전체 Tutorial 강제 안 함 | CURRENT |
| Search | Journey 기록을 빠르게 다시 찾기 위해 | Journey 내부 Search+Filter(기간/기록종류/키워드/LifeEvent/Season/StoryArc) — 독립 Bottom Tab 아님 | CURRENT |
| Notification | 사용자가 스스로 설정한 리마인더만 받게 하기 위해 | Promise/Action 사용자 설정 Reminder만 제공 | CURRENT |
| Account Delete | 탈퇴 시 개인 기록과 공유본을 사용자 의사대로 정리하기 위해 | Private Source 삭제 절차 + ShareCopy 유지/삭제 사용자 선택 | CURRENT |
| Export | 사용자가 자신의 기록을 가져갈 수 있게 하기 위해 | Product Planning에는 포함, MVP 구현 우선순위는 후순위 | CURRENT(우선순위 낮음) |
| AI Memory | AI가 사용자 동의 없이 민감 기록을 재사용하지 않게 하기 위해 | Default OFF, Explicit Opt-in 후에만 사용, 중지/삭제 가능 | CURRENT |

(그 외 세부 항목은 추후 업데이트)
