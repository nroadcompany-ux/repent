import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import {
  REPENTANCE_FLOW,
  repentanceStep,
  repentanceStepIndex,
} from '@/domain/repentance'
import { requireUser } from '@/lib/supabase/server'
import { saveRepentanceStep } from '../../actions'

export const dynamic = 'force-dynamic'

export default async function RepentanceWritePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { step: stepParam, error } = await searchParams

  const { data: record } = await supabase
    .from('repentances')
    .select('id, title, looking_back, realization, returning_note, state, recorded_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!record) notFound()

  const step = repentanceStep(stepParam ?? 'looking_back')
  const index = repentanceStepIndex(step.key)
  const isFirst = index === 0
  const isLast = index === REPENTANCE_FLOW.length - 1
  const value = record[step.column] ?? ''
  const today = new Date().toISOString().slice(0, 10)
  const recordDate = record.recorded_at?.slice(0, 10) ?? today

  return (
    <main>
      <PageHeader title="회개하기" backHref="/repentance" />

      <ol className="flex gap-2 px-title-gutter pt-1" aria-label="회개 기록 단계">
        {REPENTANCE_FLOW.map((flowStep, flowIndex) => (
          <li
            key={flowStep.key}
            aria-current={flowStep.key === step.key ? 'step' : undefined}
            className={`text-caption font-medium ${
              flowIndex === index ? 'text-accent' : 'text-ink-faint'
            }`}
          >
            {flowStep.label}
          </li>
        ))}
      </ol>

      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-4 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
        >
          저장하지 못했어요. 적으신 내용은 화면에 그대로 있습니다. 다시 시도해 주세요.
        </p>
      ) : null}

      <form action={saveRepentanceStep} className="px-title-gutter pt-6">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="step" value={step.key} />

        <h1 className="text-hero font-semibold text-ink">
          {step.heading[0]}
          <br />
          {step.heading[1]}
        </h1>
        <p className="text-body-sm mt-3 leading-[21px] text-ink-muted">{step.guide}</p>

        {step.key === 'looking_back' ? (
          <div className="mt-7 flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="recorded_on">날짜</FieldLabel>
              <TextField
                id="recorded_on"
                name="recorded_on"
                type="date"
                max={today}
                defaultValue={recordDate}
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="title">이 기록의 제목 (선택)</FieldLabel>
              <TextField
                id="title"
                name="title"
                defaultValue={record.title}
                maxLength={80}
                placeholder="예: 화를 내고 후회한 일"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <FieldLabel htmlFor={step.column}>
            {step.label}
            {step.optional ? ' (선택)' : ''}
          </FieldLabel>
          <TextArea
            id={step.column}
            name={step.column}
            rows={9}
            maxLength={8000}
            defaultValue={value}
            placeholder={step.placeholder}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {isLast ? (
            <Button type="submit" name="intent" value="finish">
              회개 기록 마치기
            </Button>
          ) : (
            <Button type="submit" name="intent" value="next">
              다음
            </Button>
          )}

          <div className="flex gap-3">
            {!isFirst ? (
              <Button type="submit" name="intent" value="back" variant="quiet">
                이전
              </Button>
            ) : null}
            <Button type="submit" name="intent" value="draft" variant="secondary">
              임시저장
            </Button>
          </div>
        </div>

        <p className="text-caption mt-6 text-center leading-[20px] text-ink-faint">
          이 기록은 나만 볼 수 있습니다.
          <br />
          RETURN은 회개가 충분한지, 용서받았는지 판단하지 않습니다.
        </p>
      </form>
    </main>
  )
}
