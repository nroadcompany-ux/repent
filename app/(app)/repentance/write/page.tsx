import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { REPENTANCE_WRITE_FLOW } from '@/domain/repentance'
import { todayKst } from '@/lib/date'
import { saveRepentanceStep } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * First step of a NEW repentance, before any row exists (Issue #21 §B).
 *
 * The old flow inserted a draft the moment 회개하기 was pressed, so opening
 * this screen and leaving created a row nobody wrote. Here the form posts with
 * an empty id and saveRepentanceStep inserts on that first save, then hands
 * over to the existing /repentance/[id]/write flow for the remaining steps.
 * Nothing about the stored record contract changes.
 */
export default function NewRepentancePage() {
  const step = REPENTANCE_WRITE_FLOW[0]!
  const today = todayKst()

  return (
    <main>
      <PageHeader title="회개하기" backHref="/repentance" />

      <ol className="flex gap-2 px-title-gutter pt-1" aria-label="회개 기록 단계">
        {REPENTANCE_WRITE_FLOW.map((flowStep, index) => (
          <li
            key={flowStep.key}
            aria-current={index === 0 ? 'step' : undefined}
            className={`text-caption font-medium ${index === 0 ? 'text-accent' : 'text-ink-faint'}`}
          >
            {flowStep.label}
          </li>
        ))}
      </ol>

      <form action={saveRepentanceStep} className="px-title-gutter pt-6">
        {/* Empty id: the row is created by this submission, not before it. */}
        <input type="hidden" name="id" value="" />
        <input type="hidden" name="step" value={step.key} />

        <h1 className="text-hero font-semibold text-ink">
          {step.heading[0]}
          <br />
          {step.heading[1]}
        </h1>
        <p className="text-body-sm mt-3 leading-[21px] text-ink-muted">{step.guide}</p>

        <div className="mt-7 flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="recorded_on">날짜</FieldLabel>
            <TextField
              id="recorded_on"
              name="recorded_on"
              type="date"
              max={today}
              defaultValue={today}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="title">이 기록의 제목 (선택)</FieldLabel>
            <TextField id="title" name="title" maxLength={80} placeholder="예: 화를 내고 후회한 일" />
          </div>
        </div>

        <div className="mt-6">
          <FieldLabel htmlFor={step.column}>{step.label}</FieldLabel>
          <TextArea
            id={step.column}
            name={step.column}
            rows={9}
            maxLength={8000}
            placeholder={step.placeholder}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button type="submit" name="intent" value="next">
            다음
          </Button>
          <Button type="submit" name="intent" value="draft" variant="secondary">
            임시저장
          </Button>
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
