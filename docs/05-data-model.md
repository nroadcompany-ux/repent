---
status: OPEN
version: 0.7.2.1
updated: 2026-09-05
---

# 05 Data Model

> 상태: OPEN — 작성 중 (아래는 Owner/PM 확정 Canonical Decision만 반영. 미확정 영역은 계속 OPEN)

## 확정 용어 (Owner Lock)

| 내부 Data Model | 사용자-facing |
|---|---|
| LifeEvent | 삶의 사건 |
| Season | 시기 (중첩 허용 — 하나의 기간이 복수의 시기에 속할 수 있음) |
| StoryArc | 이야기 흐름 (하나의 기도·약속이 복수의 StoryArc에 Reference로 연결 가능, 원본 복제 없음) |

## Confession 데이터 규칙

- Direct Confession = Live Reference — 직접 작성한 고백은 수정 시 Journey에 최신 내용이 즉시 반영되고, 삭제 시 Journey에서도 제거된다
- Private Source → ShareCopy = Snapshot — 공유 시 스냅샷(ShareCopy)이 생성되며, Source 수정이 기존 공개본에 자동 반영되지 않는다
- Share Delete ≠ Source Delete — 공유본 삭제가 원본 삭제로 이어지지 않는다. 원본 삭제는 별도의 명시적 행위 필요

## Sharing 3원칙 (2026-09-05, Owner/PM 확정 — 위 규칙의 정식화)

- Source Edit ≠ ShareCopy Auto Edit
- **Source Delete ≠ ShareCopy Auto Delete** (신규 — 원본을 삭제해도
  이미 만들어진 ShareCopy는 자동 삭제되지 않는다)
- ShareCopy Delete ≠ Source Delete

### Source Delete 절차 (2026-09-05, Owner 확정 — Q11)

Source를 삭제할 때 시스템이 자동으로 ShareCopy를 지우거나 자동으로
남기지 않는다 — **기존 ShareCopy 목록을 사용자에게 제시하고, 함께
삭제할지 여부를 사용자가 직접 선택**한다(CANDIDATE였던 "Source Delete
이후 ShareCopy Reference 처리 방식"이 이 절차로 확정됨 —
`10-decision-open-hold-register.md` 참조).

## Core Entity (2026-09-05, Owner/PM 확정 — Canonicalization Batch)

User, LifeEvent, Season, StoryArc, TurningPoint, Prayer, Promise,
Action, RepentanceRecord, Confession, ShareCopy, ScriptureReference

## Relations

- **Promise 1:N Action** — 하나의 Promise에 여러 Action이 연결 가능
- **Prayer**: Reflection / Scripture / Promise / Action에 대한
  선택적(optional) 참조를 가질 수 있음
- **RepentanceRecord**: Scripture / Promise / Action에 대한 선택적
  (optional) 참조를 가질 수 있음
- **ShareCopy**: Snapshot(스냅샷) + Source Reference(원본 참조, 단
  Source 삭제·수정과 독립 — 위 Sharing 3원칙 참조)
- **StoryArc**: 여러 레코드가 참조(Reference)로 연결 가능(원본 복제
  없음 — 위 "확정 용어" 섹션과 동일 원칙)
- **TurningPoint**: Owner = User Confirm(사용자가 직접 확정) — AI는
  후보만 제안 가능하고 Owner가 될 수 없음

**AI는 어떤 Entity에 대해서도 Record Owner가 될 수 없다.**

## CRUD Matrix / Visibility / Owner (Draft — 세부 필드는 추후 확정)

| Entity | Owner | Visibility(기본) | CRUD 방향 |
|---|---|---|---|
| User | 본인 | Private | 본인만 CRUD |
| LifeEvent | 작성 User | Private | User가 CRUD, Season/StoryArc가 Reference로 참조(복제 없음) |
| Season | 작성 User | Private | User가 CRUD, 중첩 허용 |
| StoryArc | 작성 User | Private | User가 CRUD, 여러 레코드가 Reference로 연결 |
| TurningPoint | **User(Confirm)** | Private | User가 Create/Confirm, AI는 후보 제안만(Create/Owner 불가) |
| Prayer | 작성 User | Private(Prayer Only 시 비공개 유지) | User가 CRUD, 공유 시 ShareCopy 경유(직접 Public 전환 아님) |
| Promise | 작성 User | Private | User가 CRUD, Action 1:N 연결 |
| Action | 작성 User | Private | User가 CRUD, Promise에 종속 |
| RepentanceRecord | 작성 User | Private | User가 CRUD, 공유 시 ShareCopy 경유 |
| Confession | 작성 User | Privacy 3옵션(나만/이름가리고/이름공개) | User가 CRUD(Direct=Live Reference) |
| ShareCopy | 원본 작성 User | Privacy 3옵션 상속(Confession 경유) | User가 Create(Preview 후)·Delete, Update 없음(Snapshot 고정) |
| ScriptureReference | System(제시) / 참조 대상은 Approved Corpus | Public(구절 자체는 열람용) | System이 Read/제시, User는 Read만(License 확보 전 Full Text는 HOLD) |

## Permission Boundary

Role: **Owner / Viewer / Moderator / System / AI**

- **Owner**: 본인 레코드에 대해 CRUD 전권
- **Viewer**: Confession/ShareCopy 중 공개 범위(3옵션)에 해당하는
  콘텐츠만 Read
- **Moderator**: **공유된 Post/ShareCopy만** 운영 검토 가능
- **System**: 자동화 로직(예: Missing Day 무점 처리) — Record Owner
  아님
- **AI**: Reflection Assist만 수행, **어떤 Record의 Owner도 될 수
  없음**, Private Source 자동 열람 권한 없음

**P0 (2026-09-05 확정)**: Moderator는 신고된 공유 콘텐츠가 있다는
이유만으로 그 콘텐츠의 원본(Private Prayer Source / Private
RepentanceRecord Source)에 접근할 수 없다. Moderator가 볼 수 있는
것은 공유된 Post/ShareCopy 그 자체뿐이다.

## Lifecycle State — SYSTEM STATE만 정의

Lifecycle State는 **시스템 상태**만 정의한다(영적 상태 아님). **아래
Enum 이름 자체는 CANDIDATE다** — Product Meaning(무엇을 하면 안
되는지)만 CURRENT이고, 정확한 이름은 PM/Owner가 추후 확정한다:

| Entity | Candidate Enum |
|---|---|
| Prayer | DRAFT / RECORDED / ARCHIVED |
| RepentanceRecord | DRAFT / RECORDED / ARCHIVED |
| Promise | ACTIVE / CLOSED / ARCHIVED |
| Action | PLANNED / DONE / RETRY / MODIFIED / RESCHEDULED / RECORDED_ONLY |
| Confession / ShareCopy | DRAFT / PUBLISHED / HIDDEN / REMOVED |

**Enum 확정 절차(2026-09-05, Owner 확정 — Q12)**: 위 표의 "Product
Meaning"(무엇을 하면 안 되는지, 몇 가지 상태가 필요한지)은 **LOCK**
이다. **정확한 Enum 이름 자체는 Development Documentation 단계에서
확정**하며, 지금 이 단계에서 이름을 확정하지 않는 것 자체가 Owner의
결정이다(Claude의 임의 유보가 아님). User-facing 표현은 이미 Lock된
것을 그대로 쓴다(예: Promise 종료 = "마무리됨" — `04-policy-business-rules.md`
참조, Internal Enum 이름과 무관하게 고정).

### Forbidden State (모든 Entity 공통 — 영적 상태값 생성 금지)

`ANSWERED` / `FORGIVEN` / `SAVED` / `REPENTED` / `FAITHFUL` /
`SPIRITUALLY_FAILED` — 이런 이름의 상태값을 어떤 Entity에도 만들지
않는다(Enum 이름·필드명·상수명 전부 포함).

(그 외 세부 스키마는 추후 업데이트)
