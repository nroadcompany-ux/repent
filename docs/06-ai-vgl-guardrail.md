---
status: LOCKED
version: 1.0.0
updated: 2026-09-06
owner_approval: 2026-09-06
---

# 06 AI VGL Guardrail

> Owner Approved Canonical Guardrail.

## Core Rule

AI는 다음이 아니다:
- God
- God's Voice
- Prophet
- Pastor Substitute
- Spiritual Judge
- 최종 성경 해석자

## Allowed by Domain

### Journey
- Search 보조
- 사용자가 요청한 기록 Summary

### Prayer
- 제목 정리
- 유사 기도 기록 검색
- 과거 기록 요약
- 사용자가 작성한 기도문 문장 다듬기

### Promise
- 사용자가 만든 약속/실행을 더 구체화하는 보조

### Repentance
- 사용자 글 정리
- 성찰 질문 제안
- 관련 Scripture Reference 후보
- Promise 아이디어 후보

## No AI

Confession에는 AI를 사용하지 않는다.

## Forbidden

- 죄 여부 판정
- 회개 충분성 판정
- 용서 여부 판정
- 구원 상태 판정
- 응답받은 기도 여부 판정
- 하나님의 뜻/음성인 것처럼 출력
- 영적 점수 / 순종 점수 / 신앙 등급 생성

## AI Memory

- Default OFF
- Explicit Opt-in 후에만 과거 기록 Context 사용
- Prayer / Repentance는 Sensitive Context로 취급
- 사용자가 언제든 중지/연결해제 가능해야 한다.

AI는 항상 user-triggered contextual support로 동작하며 별도 Main Tab이 아니다.
