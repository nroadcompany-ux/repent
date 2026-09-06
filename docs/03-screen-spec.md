---
status: LOCKED
version: 1.0.0
updated: 2026-09-06
owner_approval: 2026-09-06
---

# 03 Screen Spec

> Owner Approved / Planning Locked. 각 Main Tab은 Entry / Primary CTA / Secondary CTA / Empty / Error / Return Target / Data Owner를 가진다.

## Journey

- Entry: Bottom Tab / Cross-domain Return / Search Result
- Primary CTA: 오늘 기록하기 또는 현재 상황 기반 다음 행동 1개
- Secondary: Search, Filter, Calendar, 나의 말씀, 성경읽기
- Empty: 기록 없음 안내 + 첫 기록 유도
- Error: 로딩 실패 시 재시도, 기존 기록 손실 표현 금지
- Return: Journey Home
- Data Owner: Aggregation/Navigation only

TODAY 기본 4-slot:
- 나의 말씀
- 이어갈 기도
- 오늘의 약속·실행
- 성경읽기

회개를 Daily 의무 Tile로 고정하지 않는다.

## Prayer

- Entry: Bottom Tab / Journey / Cross-link
- Primary CTA: 오늘의 기도 남기기
- Secondary: 기도 제목 | 기도문, 나의 기도 | 중보기도
- Empty: 첫 기도 제목/기도문 작성 유도
- Error: 저장/불러오기 재시도
- Return: Prayer Home 또는 진입 원점
- Data Owner: Prayer

## Repentance

- Entry: Bottom Tab / Optional Repent / User direct
- Primary CTA: 회개 기록 마치기
- Secondary: 임시저장 / 이어쓰기 / 말씀과 함께 돌아보기
- Empty: 판단 없는 시작 안내
- Error: Draft 보존 우선
- Return: Repentance Home / Journey / Promise
- Data Owner: Repentance

Progress %, 회개 완료율, 영적 점수 금지.

## Promise

- Entry: Bottom Tab / Prayer / Repentance / Journey
- Home Primary CTA: 새 약속
- Detail Primary CTA: 실행 기록 추가
- Secondary: 그룹, Reminder, Review, 마무리
- Empty: 첫 약속 만들기
- Error: 저장 실패 시 사용자 입력 보존
- Return: Promise Home / Journey
- Data Owner: Promise + nested Action

기본 그룹:
- 나의 삶
- 사람과 관계
- 신앙생활

## Confession

- Entry: Bottom Tab / ShareCopy Publish / Profile public posts
- Primary CTA: 고백 나누기
- Secondary: Type, Photo, Hashtag, Comment, Reaction, Report
- Empty: 공개 강요 없는 안내
- Error: Draft 보존 및 재시도
- Return: Feed / 진입 원점
- Data Owner: Confession Community

MVP:
- 게시물 Photo 최대 1장
- Comment 포함
- Reaction 3종
- 1인 1Reaction, 변경 가능
- AI 없음

Reaction:
- 함께 기도해요
- 은혜받았어요
- 마음이 닿았어요

## Common UX Rule

- Main Home은 설명보다 `현재 상태 + 다음 행동 1개` 우선
- Main Tab당 Primary CTA 1개 우선
- Cross-link는 Detail 하단 중심
- RETURN Education Rolling Banner는 Common Component이며 Page별 Copy를 사용한다.
