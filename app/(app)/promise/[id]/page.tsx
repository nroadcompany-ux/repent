import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { KeepStrip } from '../_components/keep-strip'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { ACTION_OUTCOME_LABELS, PROMISE_CLOSE_LABEL } from '@/domain/product-lock'
import { addDays, dateRange, dDayLabel, formatMonthDay, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { closePromise, createAction, recordAction, reopenPromise } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * Promise Detail. docs/03: Primary CTA is 실행 기록 추가; secondary surfaces are
 * 그룹 / Reminder / Review / 마무리. docs/01 puts Action and its records inside
 * this screen — Action is never a tab of its own.
 *
 * The keep rate shown here is a behavioural measurement of what the member
 * chose to record (docs/04 "이행률은 행동 측정치만 허용"). It is labelled as
 * such, is never called a score, and a low number carries no verdict.
 */

const ERRORS: Record<string, string> = {
  save: '저장하지 못했어요. 입력하신 내용은 그대로 있습니다. 다시 시도해 주세요.',
  action_title: '실행 내용을 입력해 주세요.',
  check: '기록하지 못했어요. 다시 시도해 주세요.',
}

export default async function PromiseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { error } = await searchParams

  const { data: promise } = await supabase
    .from('promises')
    .select(
      'id, title, group_id, background, purpose, started_on, due_date, daily_target, state, closed_at',
    )
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!promise) notFound()

  const today = todayKst()
  const strip = [today, addDays(today, -1), addDays(today, -2)]

  const [{ data: group }, { data: checks }, { data: actions }] = await Promise.all([
    promise.group_id
      ? supabase.from('promise_groups').select('name').eq('id', promise.group_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('promise_checks')
      .select('check_date, done_count')
      .eq('promise_id', id)
      .eq('user_id', userId)
      .order('check_date', { ascending: false }),
    supabase
      .from('actions')
      .select('id, title, planned_for, created_at')
      .eq('promise_id', id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const actionIds = (actions ?? []).map((action) => action.id)
  const { data: actionRecords } = actionIds.length
    ? await supabase
        .from('action_records')
        .select('id, action_id, outcome, note, recorded_on')
        .eq('user_id', userId)
        .in('action_id', actionIds)
        .order('recorded_on', { ascending: false })
    : { data: [] }

  const checkMap = new Map((checks ?? []).map((check) => [check.check_date, check.done_count]))

  // Behavioural keep rate over the window the member actually committed to.
  const windowEnd = promise.due_date && promise.due_date < today ? promise.due_date : today
  const days = dateRange(promise.started_on, windowEnd)
  const target = days.length * promise.daily_target
  const done = (checks ?? []).reduce((sum, check) => sum + check.done_count, 0)
  const keepRate = target > 0 ? Math.round((Math.min(done, target) / target) * 100) : 0

  // Recent history, newest first, grouped by month so a long promise stays scannable.
  const history = days.slice().reverse().slice(0, 30)
  const recordsByAction = new Map<string, typeof actionRecords>()
  for (const record of actionRecords ?? []) {
    const list = recordsByAction.get(record.action_id) ?? []
    list.push(record)
    recordsByAction.set(record.action_id, list)
  }

  return (
    <main>
      <PageHeader
        title={promise.title}
        backHref="/promise"
        actions={
          <Link href={`/promise/${id}/edit`} className="text-body font-medium text-accent">
            수정
          </Link>
        }
      />

      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          {ERRORS[error] ?? '다시 시도해 주세요.'}
        </p>
      ) : null}

      <div className="px-title-gutter pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
            {group?.name ?? '그룹 없음'}
          </span>
          {promise.state === 'closed' ? (
            <span className="text-caption rounded-chip bg-canvas px-[10px] py-[4px] font-medium text-ink-muted">
              {PROMISE_CLOSE_LABEL}
            </span>
          ) : null}
          {promise.due_date ? (
            <span className="text-caption rounded-chip bg-canvas px-[10px] py-[4px] font-medium text-ink-muted">
              {dDayLabel(promise.due_date, today)}
            </span>
          ) : null}
          {promise.daily_target > 1 ? (
            <span className="text-caption rounded-chip bg-canvas px-[10px] py-[4px] font-medium text-ink-muted">
              하루 {promise.daily_target}번
            </span>
          ) : null}
        </div>
      </div>

      {promise.state === 'active' ? (
        <section className="mx-gutter mt-5 rounded-card bg-surface px-4 py-4">
          <p className="text-caption font-medium text-accent">오늘 · 어제 · 그제</p>
          <div className="mt-3">
            <KeepStrip
              promiseId={id}
              dailyTarget={promise.daily_target}
              dates={strip}
              counts={checkMap}
              returnTo={`/promise/${id}`}
            />
          </div>
        </section>
      ) : null}

      <section className="mx-gutter mt-2 rounded-card bg-surface px-4 py-4">
        <p className="text-caption font-medium text-accent">지금까지의 기록</p>
        <p className="text-value mt-[2px] font-semibold text-ink">
          {done} / {target}회 · {keepRate}%
        </p>
        <p className="text-caption mt-[2px] leading-[16px] text-ink-muted">
          {promise.started_on}부터 지금까지 내가 남긴 기록입니다. 신앙을 재는 숫자가 아닙니다.
        </p>
      </section>

      {promise.background || promise.purpose ? (
        <section className="mx-gutter mt-2 rounded-card bg-surface px-4 py-4">
          {promise.background ? (
            <>
              <p className="text-caption font-medium text-accent">약속의 배경</p>
              <p className="text-body mt-1 whitespace-pre-wrap leading-[22px] text-ink">
                {promise.background}
              </p>
            </>
          ) : null}
          {promise.purpose ? (
            <>
              <p className="text-caption mt-4 font-medium text-accent">약속의 목적</p>
              <p className="text-body mt-1 whitespace-pre-wrap leading-[22px] text-ink">
                {promise.purpose}
              </p>
            </>
          ) : null}
        </section>
      ) : null}

      {/* Primary CTA — 실행 기록 추가 (docs/03) */}
      <section className="mt-7 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">실행</h2>
        <form action={createAction} className="mt-3">
          <input type="hidden" name="promise_id" value={id} />
          <FieldLabel htmlFor="action_title">무엇을 실행하시겠어요</FieldLabel>
          <TextField
            id="action_title"
            name="title"
            maxLength={100}
            placeholder="예: 이번 주 수요일 아침에 읽기"
            required
          />
          <div className="mt-3">
            <FieldLabel htmlFor="planned_for">언제 (선택)</FieldLabel>
            <TextField id="planned_for" name="planned_for" type="date" />
          </div>
          <div className="mt-4">
            <Button type="submit">실행 기록 추가</Button>
          </div>
        </form>
      </section>

      {(actions ?? []).length > 0 ? (
        <ul className="mt-5 flex flex-col gap-row-gap px-gutter">
          {(actions ?? []).map((action) => {
            const records = recordsByAction.get(action.id) ?? []
            return (
              <li key={action.id} className="rounded-row bg-surface px-4 py-4">
                <p className="text-value font-semibold text-ink">{action.title}</p>
                {action.planned_for ? (
                  <p className="text-caption mt-[2px] text-ink-muted">
                    {formatMonthDay(action.planned_for)} 예정
                  </p>
                ) : null}

                <form action={recordAction} className="mt-3">
                  <input type="hidden" name="action_id" value={action.id} />
                  <input type="hidden" name="promise_id" value={id} />
                  <TextArea name="note" rows={2} maxLength={2000} placeholder="어떻게 됐는지 한 줄로 남겨보세요." />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(
                      Object.entries(ACTION_OUTCOME_LABELS) as Array<
                        [keyof typeof ACTION_OUTCOME_LABELS, string]
                      >
                    ).map(([outcome, label]) => (
                      <button
                        key={outcome}
                        type="submit"
                        name="outcome"
                        value={outcome}
                        className="text-caption rounded-chip border border-line bg-surface px-3 py-[6px] font-medium text-ink-muted"
                      >
                        {label}
                      </button>
                    ))}
                    {/* Optional Repent — offered, never required (docs/04). */}
                    <button
                      type="submit"
                      name="then"
                      value="repent"
                      className="text-caption rounded-chip bg-accent-tint px-3 py-[6px] font-medium text-accent"
                    >
                      기록하고 돌아보기
                    </button>
                  </div>
                </form>

                {records.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-3">
                    {records.map((record) => (
                      <li key={record.id} className="text-caption text-ink-muted">
                        <span className="font-medium text-accent">
                          {ACTION_OUTCOME_LABELS[record.outcome]}
                        </span>{' '}
                        · {formatMonthDay(record.recorded_on)}
                        {record.note ? (
                          <span className="mt-[2px] block whitespace-pre-wrap text-ink">
                            {record.note}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <section className="mt-8 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">지난 기록</h2>
        <div className="mt-3 flex flex-wrap gap-[6px]">
          {history.map((date) => {
            const count = checkMap.get(date) ?? 0
            const complete = count >= promise.daily_target
            return (
              <span
                key={date}
                title={`${date} · ${count}/${promise.daily_target}`}
                className={`text-caption flex h-[30px] w-[42px] items-center justify-center rounded-control border ${
                  complete
                    ? 'border-accent bg-accent text-white'
                    : count > 0
                      ? 'border-accent bg-accent-tint text-accent'
                      : 'border-line bg-surface text-ink-faint'
                }`}
              >
                {formatMonthDay(date).replace('월 ', '/').replace('일', '')}
              </span>
            )
          })}
        </div>
      </section>

      <div className="mt-9 px-title-gutter">
        <form action={promise.state === 'closed' ? reopenPromise : closePromise}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="quiet">
            {promise.state === 'closed' ? '다시 이어가기' : '이 약속 마무리하기'}
          </Button>
        </form>
      </div>
    </main>
  )
}
