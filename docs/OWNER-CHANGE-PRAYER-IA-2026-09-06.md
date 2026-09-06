# Prayer IA Owner Change — 2026-09-06

Status: CANDIDATE / CODED — Canonical sync pending Owner visual approval

Owner request reflected in this branch:
- Make the distinction between 기도제목 and 기도문 clear.
- Make 나의 기도 and 중보기도 understandable.
- Do not present two different classification axes at the same hierarchy.
- First choose 기록 종류: 기도제목 / 기도문.
- Inside 기도제목 only, choose 대상 기준: 나의 기도 / 중보기도.
- Add UI-only sample lists to empty prayer and prayer-folder surfaces, marked `예시` and excluded from DB/search/calendar/count/statistics.

Implementation note:
- 기도문에는 나의 기도 / 중보기도 분류를 강제로 적용하지 않는다.
- 기존 PrayerKind와 PrayerText 데이터 구조는 유지한다.
