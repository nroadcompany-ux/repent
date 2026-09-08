import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/control'
import { PROMISE_CLOSE_LABEL } from '@/domain/product-lock'
import { PROVENANCE_LABELS, provenanceHref } from '@/domain/provenance'
import type { ShareSourceKind } from '@/lib/supabase/database.types'
import {
  isScheduled,
  keepRate as keepRateOf,
  recurrenceLabel,
  type PromiseWithRepeat as PromiseRecurrence,
} from '@/domain/promise'
import { dateRange, dDayLabel, formatMonthDay, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { KeepStrip } from '../_components/keep-strip'
import { closePromise, reopenPromise } from '../actions'

export const dynamic = 'force-dynamic'

type PromiseWithRepeat = PromiseRecurrence & {
  source_kind?: ShareSourceKind | null
  source_id?: string | null
  id: string
  title: string
  group_id: string | null
  background: string | null
  purpose: string | null
  daily_target: number
  state: 'active' | 'closed'
  closed_at: string | null
}

export default async function PromiseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; closed?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { error, closed } = await searchParams

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
  const keepRate = keepRateOf(done, target)
  const recentScheduled = scheduled.slice(-3).reverse()

  const provenanceNotice =
    promise.source_kind && promise.source_id
      ? {
          label: PROVENANCE_LABELS[promise.source_kind],
          href: provenanceHref(promise.source_kind, promise.source_id),
        }
      : null

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

      {/*
        0011 provenance. Only the fact and a link — never the source body, and
        only when the pointer resolves to a screen this member can open.
      */}
      {provenanceNotice ? (
        <section className="mx-gutter mt-2 rounded-card bg-surface px-4 py-3">
          <p className="text-caption leading-[19px] text-ink-muted">{provenanceNotice.label}</p>
          {provenanceNotice.href ? (
            <Link
              href={provenanceNotice.href}
              className="text-body-sm mt-[2px] inline-block font-medium text-accent"
            >
              시작이 된 기록 보기
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="mx-gutter mt-2 rounded-card bg-surface px-4 py-4">
        <p className="text-caption font-medium text-accent">약속 이행률</p>
        <p className="text-value mt-[2px] font-semibold text-ink">
          {done} / {target}회 · {keepRate}%
        </p>
        <p className="text-caption mt-[2px] leading-[19px] text-ink-muted">
          {/* [PRODUCT LOCK — NOT ADMIN] promise.keepRate.guardrail — docs/04
              PROMISE_KEEP_RATE_IS_BEHAVIOURAL_ONLY 를 진술하는 문장 */}
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

      {/*
        Owner decision 2026-09-08: no dead-end flow. Finishing a promise used to
        leave the member on a screen whose only remaining control was 다시
        이어가기 — undoing what they had just decided. The confirmation now says
        what happened and offers the way on, and the list link below is present
        in every state, closed or not, so the way back never depends on the
        header chevron alone.
      */}
      {closed && promise.state === 'closed' ? (
        <section className="mx-gutter mt-8 rounded-card bg-accent-tint px-4 py-4">
          <p className="text-body-sm font-semibold text-accent">약속을 마무리했어요.</p>
          <p className="text-caption mt-1 leading-[19px] text-accent">
            지금까지 지킨 기록은 그대로 남습니다.
          </p>
          <Link
            href={`/promise?filter=closed`}
            className="text-body-sm mt-3 inline-block font-semibold text-accent underline"
          >
            마무리한 약속 목록으로
          </Link>
        </section>
      ) : null}

      <div className="mt-9 px-title-gutter">
        <form action={promise.state === 'closed' ? reopenPromise : closePromise}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="quiet">
            {promise.state === 'closed' ? '다시 이어가기' : '이 약속 마무리하기'}
          </Button>
        </form>
      </div>

      <div className="mt-4 px-title-gutter">
        <Link href="/promise" className="text-body-sm block text-center font-medium text-ink-muted">
          약속 목록으로
        </Link>
      </div>
    </main>
  )
}
