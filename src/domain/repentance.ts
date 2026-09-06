/**
 * Repentance writing flow — Owner simplification 2026-09-06.
 *
 * The four abstract labels were difficult to understand on mobile, so new
 * records use three plain-language steps. Existing DB columns are preserved so
 * historical records remain readable; `turning_promise` is legacy data and is
 * no longer a required writing step.
 */

export type RepentanceStepKey = 'looking_back' | 'realization' | 'returning'

export type RepentanceStepSpec = {
  key: RepentanceStepKey
  column: 'looking_back' | 'realization' | 'returning_note'
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
