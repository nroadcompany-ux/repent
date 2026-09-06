---
status: LOCKED_WITH_HOLD
version: 1.0.0
updated: 2026-09-06
owner_approval: 2026-09-06
---

# 07 Privacy Security

> Owner Approved Product Privacy Rules. Legal retention/minor details remain HOLD.

## Default Privacy

Private Domain records are owner-only by default:
- Prayer
- Repentance Original
- Promise
- Action
- Journey
- private Profile fields

## Confession / ShareCopy

공개는 사용자의 명시적 행위로만 발생한다.

Share flow:
`Private Original → 공유 필드 선택 → ShareCopy Draft → Preview → Publish`

Sensitive fields는 Default OFF.

- Source와 ShareCopy는 별도 객체.
- Source 수정이 기존 ShareCopy에 자동 반영되지 않는다.
- ShareCopy 삭제가 Source 삭제로 이어지지 않는다.
- Source 삭제 시 기존 ShareCopy는 자동삭제하지 않고 사용자 선택을 제공한다.

## Community Identity

- Community는 닉네임 중심 Display를 기본으로 한다.
- 교회명/교단 자동 노출 금지.
- Profile 공개범위는 사용자 선택.
- 이름 가리기와 시스템 내부 식별은 분리한다.

## Profile Media

- 대표 프로필 사진 1장
- Profile Gallery 최대 30장
- 교회 활동/예배·모임/봉사·섬김/일상 등 Category 사용 가능
- 사진은 교인 인증 수단이 아니다.
- 타인 얼굴/미성년자/개인정보 노출 대응 필요.

## AI Privacy

- AI Memory Default OFF
- Explicit Opt-in 후에만 과거 기록 Context 사용
- Prayer/Repentance는 Sensitive Context
- 사용자가 AI Memory를 중지/해제할 수 있어야 한다.

## Security Baseline

- Production에서는 Row Level Security 전면 적용
- Client secret/API key 노출 금지
- Storage에도 Access Policy 적용
- Private Source와 Public ShareCopy를 `public` flag 하나로만 구분하는 설계 금지

## HOLD

- Account Delete 최종 보존기간
- Minor 공개/보호 세부정책
- Export 구현 상세
