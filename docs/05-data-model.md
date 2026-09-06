---
status: LOCKED_WITH_HOLD
version: 1.0.0
updated: 2026-09-06
owner_approval: 2026-09-06
---

# 05 Data Model

> Canonical Logical Data Contract. Physical schema/enum 명칭은 Development Documentation 단계에서 확정한다.

## Domain Ownership

- Account/Profile: 사용자 계정 및 Profile
- Prayer: 기도함 / 기도 제목 / 날짜별 기도 기록 / 기도문
- Repentance: Private repentance source / Draft / ShareCopy reference
- Promise: Promise 원본
- Action: Promise 1:N 실행 및 실행 기록
- Journey: Aggregation / Navigation / Mood / Calendar / Life Event reference
- Scripture: Verse canonical reference / Reading progress
- Confession: Public/Shared community object / Comment / Reaction / Hashtag / Report

Journey는 각 Domain 원본을 복제하는 Owner가 아니다.

## Logical Entity Set

### Account / Profile
- users / auth identity
- profiles
- church_name
- denomination
- representative_profile_image
- profile_media (Gallery 최대 30장)
- profile_hashtags
- profile_visibility

### Prayer
- prayer_folders
- prayer_topics
- prayer_records
- prayer_texts / prayer documents

### Repentance
- repentances
- repentance_drafts 또는 동등 Draft State
- repentance_share_links / ShareCopy relation

### Promise / Action
- promises
- actions
- action_records
- reminders

### Journey
- mood_records
- life_events
- journey_references / aggregation index
- bible_reading_progress
- saved_scripture_references

### Scripture
- verses (Canonical Reference)
- verse_texts (License 확보 후)

### Confession / Community
- confession_posts
- confession_comments
- confession_reactions
- hashtags
- post_hashtags
- reports
- moderation_actions

### AI / Privacy
- ai_memory_consent
- 최소 AI usage/audit metadata (필요 범위)

## ShareCopy Rule

`Private Original → User-selected fields → ShareCopy Draft → Preview → Publish`

- Source와 ShareCopy는 별도 객체다.
- Source 수정이 기존 ShareCopy에 자동 반영되지 않는다.
- ShareCopy 삭제가 Source 삭제로 이어지지 않는다.
- Source 삭제 시 기존 ShareCopy 자동삭제 금지. 사용자에게 처리 선택 제공.

## Confession Reaction

- 1 user : 1 reaction / post
- 사용자는 Reaction 변경 가능
- Reaction type: 함께 기도해요 / 은혜받았어요 / 마음이 닿았어요

## State Rule

사용자-facing 의미는 Canonical Lock.
물리 Enum (`DRAFT`, `RECORDED`, `ARCHIVED` 등)은 개발문서 단계에서 확정한다.

영적 상태 Enum 금지:
`ANSWERED / FORGIVEN / SAVED / REPENTED / FAITHFUL / SPIRITUALLY_FAILED`
