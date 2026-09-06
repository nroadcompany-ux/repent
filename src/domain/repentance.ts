/**
 * Repentance flow definition.
 *
 * Canonical (docs/01, docs/02, AC-04): the Korean flow is
 *   돌아보기 → 깨닫기 → 돌이킴 약속 → 돌아가기
 * and 4R is an internal framework only, never the primary label.
 *
 * The prompts inside each step come from the Owner's Repentance UX Correction:
 *   1. 죄를 인식하기  2. 구체적인 행위 돌아보기
 *   3. 새롭게 깨달은 것 (Optional)  4. 돌이키기 위한 실천
 *
 * Every prompt is phrased as an invitation. None of them assigns guilt, asks
 * the member to rate themselves, or implies the record will be judged.
 */

export type RepentanceStepKey = 'looking_back' | 'realization' | 'turning_promise' | 'returning'

export type RepentanceStepSpec = {
  key: RepentanceStepKey
  /** Column on public.repentances. */
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
    placeholder:
      '· 마음에 걸리는 것\n· 구체적으로 어떤 일이 있었는지\n\n정리되지 않아도 괜찮아요. 떠오르는 대로 적어두셔도 됩니다.',
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

export function repentanceStep(key: string): RepentanceStepSpec {
  return REPENTANCE_FLOW.find((step) => step.key === key) ?? (REPENTANCE_FLOW[0] as RepentanceStepSpec)
}

export function repentanceStepIndex(key: string): number {
  const index = REPENTANCE_FLOW.findIndex((step) => step.key === key)
  return index < 0 ? 0 : index
}
