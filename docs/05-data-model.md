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

(그 외 세부 스키마는 추후 업데이트)
