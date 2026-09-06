import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/control'
import { PROMISE_CLOSE_LABEL } from '@/domain/product-lock'
import { dateRange, dDayLabel, formatMonthDay, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { KeepStrip } from '../_components/keep-strip'
import { closePromise, reopenPromise } from '../actions'

export const dynamic = 'force-dynamic'

type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
type PromiseWithRepeat = {
  id: string
  title: string
  group_id: string | null
  background: string | null
  purpose: string | null
  started_on: string
  due_date: string | null
  daily_target: number
  state: 'active' | 'closed'
  closed_at: string | null
  repeat_type?: RepeatType
  repeat_weekdays?: number[]
}

function jsDay(date: string): number {
  return new Date(`${date}T12:00:00+09:00`).getDay()
}

function isScheduled(date: string, promise: PromiseWithRepeat): boolean {
  if (date < promise.started_on) return false
  if (promise.due_date && date > promise.due_date) return false
  const type = promise.repeat_type ?? 'none'
  if (type === 'none') return date === promise.started_on
  if (type === 'daily') return true
  if (type === 'weekly') {
    const weekdays = promise.repeat_weekdays?.length ? promise.repeat_weekdays : [jsDay(promise.started_on)]
    return weekdays.includes(jsDay(date))
  }
  if (type === 'monthly') return date.slice(8, 10) === promise.started_on.slice(8, 10)
  return date.slice(5, 10) === promise.started_on.slice(5, 10)
}

function recurrenceLabel(promise: PromiseWithRepeat): string {
  const type = promise.repeat_type ?? 'none'
  if (type === 'none') return '한 번'
  if (type === 'daily') return '매일'
  if (type === 'monthly') return `매월 ${Number(promise.started_on.slice(8, 10))}일`
  if (type === 'yearly') return `매년 ${Number(promise.started_on.slice(5, 7))}월 ${Number(promise.started_on.slice(8, 10))}일`
  const names = ['일', '월', '화', '수', '목', '금', '토']
  const days = (promise.repeat_weekdays?.length ? promise.repeat_weekdays : [jsDay(promise.started_on)])
    .map((day) => names[day])
    .join('·')
  return `매주 ${days}`
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

  const { data: rawPromise } = await supabase
    .from('promises')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!rawPromise) notFound()
  const promise = rawPromise as unknown as PromiseWithRepeat
  const today = todayKst()
  const windowEnd = promise.due_date && promise.due_date < today ? promise.due_date : today
  const scheduled = dateRange(promise.started_on, windowEnd).filter((date) => isScheduled(date, promise))

  const [{ data: group }, { data: checks }, { data: legacyActions }] = await Promise.all([
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

  const checkMap = new Map((checks ?? []).map((check) => [check.check_date, check.done_count]))
  const scheduledSet = new Set(scheduled)
  const done = (checks ?? []).reduce(
    (sum, check) => sum + (scheduledSet.has(check.check_date) && check.done_count > 0 ? 1 : 0),
    0,
  )
  const target = scheduled.length
  const keepRate = target > 0 ? Math.round((done / target) * 100) : 0
  const recentScheduled = scheduled.slice(-3).reverse()

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
        <p role="alert" className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger">
          기록하지 못했어요. 다시 시도해 주세요.
        </p>
      ) : null}

      <div className="px-title-gutter pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
            {group?.name ?? '그룹 없음'}
          </span>
          <span className="text-caption rounded-chip bg-canvas px-[10px] py-[4px] font-medium text-ink-muted">
            {recurrenceLabel(promise)}
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
        </div>
        <p className="text-caption mt-2 text-ink-muted">
          {promise.started_on} 시작{promise.due_date ? ` · ${promise.due_date} 종료` : ' · 종료일 없음'}
        </p>
      </div>

      {promise.state === 'active' && recentScheduled.length > 0 ? (
        <section className="mx-gutter mt-5 rounded-card bg-surface px-4 py-4">
          <p className="text-caption font-medium text-accent">약속 이행 기록</p>
          <p className="text-caption mt-1 text-ink-muted">약속 자체가 실행할 일입니다. 같은 내용을 다시 적지 않아도 돼요.</p>
          <div className="mt-3">
            <KeepStrip
              promiseId={id}
              dailyTarget={1}
              dates={recentScheduled}
              counts={checkMap}
              returnTo={`/promise/${id}`}
            />
          </div>
        </section>
      ) : null}

      <section className="mx-gutter mt-2 rounded-card bg-surface px-4 py-4">
        <p className="text-caption font-medium text-accent">약속 이행률</p>
        <p className="text-value mt-[2px] font-semibold text-ink">
          {done} / {target}회 · {keepRate}%
        </p>
        <p className="text-caption mt-[2px] leading-[19px] text-ink-muted">
          예정된 날 중 내가 직접 지켰다고 남긴 기록입니다. 신앙을 재는 숫자가 아닙니다.
        </p>
      </section>

      {promise.background || promise.purpose ? (
        <section className="mx-gutter mt-2 rounded-card bg-surface px-4 py-4">
          {promise.background ? (
            <>
              <p className="text-caption font-medium text-accent">약속의 배경</p>
              <p className="text-body mt-1 whitespace-pre-wrap leading-[25px] text-ink">{promise.background}</p>
            </>
          ) : null}
          {promise.purpose ? (
            <>
              <p className="text-caption mt-4 font-medium text-accent">약속의 목적</p>
              <p className="text-body mt-1 whitespace-pre-wrap leading-[25px] text-ink">{promise.purpose}</p>
            </>
          ) : null}
        </section>
      ) : null}

      {(legacyActions ?? []).length > 0 ? (
        <details className="mx-gutter mt-4 rounded-card bg-surface px-4 py-4">
          <summary className="text-body-sm cursor-pointer font-medium text-ink-muted">이전 방식의 실행 기록 {(legacyActions ?? []).length}개</summary>
          <ul className="mt-3 flex flex-col gap-2">
            {(legacyActions ?? []).map((action) => (
              <li key={action.id} className="text-caption text-ink-muted">
                {action.title}{action.planned_for ? ` · ${formatMonthDay(action.planned_for)}` : ''}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <section className="mt-8 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">지난 이행 기록</h2>
        <div className="mt-3 flex flex-wrap gap-[6px]">
          {scheduled.slice().reverse().slice(0, 30).map((date) => {
            const complete = (checkMap.get(date) ?? 0) > 0
            return (
              <span
                key={date}
                title={date}
                className={`text-caption flex h-[30px] w-[42px] items-center justify-center rounded-control border ${
                  complete ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-faint'
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
