/**
 * User-facing labels.
 *
 * Wording that is product-locked (Promise close, Repentance final CTA, privacy
 * options, confession types) is re-exported from the domain rather than retyped,
 * so a single source stays authoritative.
 */

import type { RecordType, TimeRange } from '../domain/journey/journey';
import type { FollowUpChoice } from '../domain/action/action';

export const RECORD_TYPE_LABELS: Readonly<Record<RecordType, string>> = {
  prayer: '기도',
  promise: '약속',
  action: '실행',
  repentance: '회개',
  confession: '고백',
};

export const TIME_RANGE_LABELS: Readonly<Record<TimeRange, string>> = {
  today: '오늘',
  week: '주',
  month: '월',
  year: '해',
  all: '전체',
};

/**
 * The 5 follow-up choices. Note there is no "실패 이유" option — a failure cause
 * taxonomy is forbidden (docs/final/05 §5).
 */
export const FOLLOW_UP_LABELS: Readonly<Record<FollowUpChoice, string>> = {
  retry: '다시 하기',
  modify: '내용 수정',
  reschedule: '일정 조정',
  record_only: '기록만 남기기',
  optional_repent: '회개 기록으로 이동',
};
