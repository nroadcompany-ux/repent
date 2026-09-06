/**
 * Repentance flow definitions.
 *
 * REPENTANCE_FLOW preserves the legacy/canonical four-field record contract so
 * existing detail/share surfaces and regression tests remain compatible.
 * REPENTANCE_WRITE_FLOW is the Owner-approved 2026-09-06 mobile writing UX for
 * new records: three plain-language steps, no separate turning-promise step.
 */

export type RepentanceStepKey = 'looking_back' | 'realization' | 'turning_promise' | 'returning'

export type RepentanceStepSpec = {
  key: RepentanceStepKey
  column: 'looking_back' | 'realization' | 'turning_promise' | 'returning_note'
  label: string
  heading: [string, string]
  guide: string
  placeholder: string
  optional: boolean
}

export const REPENTANCE_FLOW: readonly RepentanceStepSpec[] = [
  {
    key: 'looking_back',
    column: 'looking_back',
    label: '돌아보기',
    heading: ['무엇을', '돌아보고 계신가요?'],
    guide: '지금 마음에 걸리는 것과, 실제로 있었던 일을 그대로 적어보세요.',
    placeholder: '정리되지 않아도 괜찮아요. 떠오르는 대로 적어두셔도 됩니다.',
    optional: false,
  },
  {
    key: 'realization',
    column: 'realization',
    label: '깨닫기',
    heading: ['그 안에서', '새롭게 보인 것이 있나요?'],
    guide: '없으면 비워두고 넘어가도 괜찮습니다.',
    placeholder: '돌아보는 동안 새롭게 알게 된 것이 있다면 적어보세요.',
    optional: true,
  },
  {
    key: 'turning_promise',
    column: 'turning_promise',
    label: '돌이킴 약속',
    heading: ['돌이키기 위해', '무엇을 해보시겠어요?'],
    guide: '크지 않아도 됩니다. 실제로 할 수 있는 한 가지면 충분해요.',
    placeholder: '예: 이번 주에 먼저 연락해서 사과하기',
    optional: false,
  },
  {
    key: 'returning',
    column: 'returning_note',
    label: '돌아가기',
    heading: ['마지막으로', '남기고 싶은 말이 있나요?'],
    guide: '기도로 남겨도 좋고, 비워두어도 괜찮습니다.',
    placeholder: '오늘 이 자리를 마무리하며 남기고 싶은 말을 적어보세요.',
    optional: true,
  },
] as const

export type RepentanceWriteStepKey = 'looking_back' | 'realization' | 'returning'
export type RepentanceWriteStepSpec = {
  key: RepentanceWriteStepKey
  column: 'looking_back' | 'realization' | 'returning_note'
  label: string
  heading: [string, string]
  guide: string
  placeholder: string
  optional: boolean
}

export const REPENTANCE_WRITE_FLOW: readonly RepentanceWriteStepSpec[] = [
  {
    key: 'looking_back',
    column: 'looking_back',
    label: '있었던 일',
    heading: ['무슨 일이', '있었나요?'],
    guide: '마음에 걸리는 일과 실제로 있었던 일을 그대로 적어보세요.',
    placeholder: '정리하려 애쓰지 않아도 됩니다. 있었던 일과 마음을 떠오르는 대로 적어보세요.',
    optional: false,
  },
  {
    key: 'realization',
    column: 'realization',
    label: '깨달은 것',
    heading: ['돌아보며', '무엇을 깨달았나요?'],
    guide: '새롭게 보인 것이 없다면 비워두고 넘어가도 괜찮습니다.',
    placeholder: '내 마음과 행동에서 새롭게 알게 된 것이 있다면 적어보세요.',
    optional: true,
  },
  {
    key: 'returning',
    column: 'returning_note',
    label: '돌아가기',
    heading: ['하나님께', '어떻게 돌아가고 싶나요?'],
    guide: '기도로 남겨도 좋고, 앞으로 하고 싶은 한 가지를 적어도 좋습니다.',
    placeholder: '하나님께 드리고 싶은 말이나 다시 시작하고 싶은 한 가지를 적어보세요.',
    optional: true,
  },
] as const

export function repentanceStep(key: string): RepentanceStepSpec {
  return REPENTANCE_FLOW.find((step) => step.key === key) ?? (REPENTANCE_FLOW[0] as RepentanceStepSpec)
}

export function repentanceStepIndex(key: string): number {
  const index = REPENTANCE_FLOW.findIndex((step) => step.key === key)
  return index < 0 ? 0 : index
}

export function repentanceWriteStep(key: string): RepentanceWriteStepSpec {
  return REPENTANCE_WRITE_FLOW.find((step) => step.key === key) ?? (REPENTANCE_WRITE_FLOW[0] as RepentanceWriteStepSpec)
}

export function repentanceWriteStepIndex(key: string): number {
  const index = REPENTANCE_WRITE_FLOW.findIndex((step) => step.key === key)
  return index < 0 ? 0 : index
}
