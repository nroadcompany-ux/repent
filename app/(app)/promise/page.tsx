import Link from 'next/link'

import { AppHeader } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { KeepStrip } from './_components/keep-strip'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { EmptyState } from '@/components/ui/state'
import { SectionHeader } from '@/components/ui/surface'
import { PROMISE_ACTIVE_LABEL, PROMISE_CLOSE_LABEL } from '@/domain/product-lock'
import { addDays, dDayLabel, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Promise Home. docs/01: 진행 중 / 마무리됨 / 전체 + 기본 그룹 3종.
 * docs/03: Home Primary CTA is 새 약속.
 *
 * Each row carries the 3-day keep strip so the daily record can be made from
 * the list itself, which is what keeps the screen usable at 10 or 100 promises.
 */

const SLIDES: readonly EducationSlide[] = [
  {
    headline: ['약속은 기억할 때', '지켜지기 시작합니다'],
    body: ['하루 한 번 눌러 두는 것으로', '내가 어디쯤 왔는지 알 수 있어요.'],
  },
  {
    headline: ['지키지 못한 날도', '그냥 기록입니다'],
    body: ['RETURN은 빠진 날을 잘못으로', '표시하지 않습니다.'],
  },
]

type Filter = 'active' | 'closed' | 'all'

export default async function PromisePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; group?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const params = await searchParams

  const filter: Filter =
    params.filter === 'closed' ? 'closed' : params.filter === 'all' ? 'all' : 'active'
  const groupId = params.group ?? ''

  const today = todayKst()
  const strip = [today, addDays(today, -1), addDays(today, -2)]

  let query = supabase
    .from('promises')
    .select('id, title, group_id, due_date, daily_target, state, started_on')
    .eq('user_id', userId)

  if (filter !== 'all') query = query.eq('state', filter)
  if (groupId) query = query.eq('group_id', groupId)

  // The group list and the promise list do not depend on each other, so they
  // are batched rather than awaited one after the other.
  const [{ data: groups }, { data: promises }] = await Promise.all([
    supabase.from('promise_groups').select('id, name').eq('user_id', userId).order('sort_order'),
    query
      .order('state')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
  ])

  const promiseIds = (promises ?? []).map((promise) => promise.id)
  const checksByPromise = new Map<string, Map<string, number>>()

  if (promiseIds.length > 0) {
    const { data: checks } = await supabase
      .from('promise_checks')
      .select('promise_id, check_date, done_count')
      .eq('user_id', userId)
      .in('promise_id', promiseIds)
      .gte('check_date', strip[2] as string)
      .lte('check_date', today)

    for (const check of checks ?? []) {
      const existing = checksByPromise.get(check.promise_id) ?? new Map<string, number>()
      existing.set(check.check_date, check.done_count)
      checksByPromise.set(check.promise_id, existing)
    }
  }

  const groupName = new Map((groups ?? []).map((group) => [group.id, group.name]))
  const returnTo = `/promise?filter=${filter}${groupId ? `&group=${groupId}` : ''}`

  return (
    <main>
      <AppHeader />
      <EducationBanner slides={SLIDES} />

      <div className="mt-7 px-title-gutter">
        <SegmentedLinks
          active={filter}
          options={[
            { value: 'active', label: PROMISE_ACTIVE_LABEL, href: '/promise?filter=active' },
            { value: 'closed', label: PROMISE_CLOSE_LABEL, href: '/promise?filter=closed' },
            { value: 'all', label: '전체', href: '/promise?filter=all' },
          ]}
        />
      </div>

      {(groups ?? []).length > 0 ? (
        <div className="no-scrollbar mt-3 overflow-x-auto px-title-gutter">
          <SegmentedLinks
            size="sm"
            active={groupId}
            options={[
              { value: '', label: '모든 그룹', href: `/promise?filter=${filter}` },
              ...(groups ?? []).map((group) => ({
                value: group.id,
                label: group.name,
                href: `/promise?filter=${filter}&group=${group.id}`,
              })),
            ]}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <SectionHeader
          title="하나님과 나의 약속"
          subtitle={`${(promises ?? []).length}개`}
          actionLabel="새 약속"
          actionHref="/promise/new"
        />
      </div>

      <div className="mt-[13px]">
        {(promises ?? []).length === 0 ? (
          <EmptyState
            title={filter === 'closed' ? '마무리한 약속이 없어요' : '아직 약속이 없어요'}
            description="지금 지킬 수 있는 작은 한 가지부터 정해보세요."
            actionLabel="첫 약속 만들기"
            actionHref="/promise/new"
          />
        ) : (
          <ul className="flex flex-col gap-row-gap px-gutter">
            {(promises ?? []).map((promise) => (
              <li key={promise.id} className="rounded-row bg-surface px-4 py-3">
                <div className="flex items-start gap-3">
                  <Link href={`/promise/${promise.id}`} className="min-w-0 flex-1">
                    <p className="text-caption font-medium text-accent">
                      {promise.state === 'closed'
                        ? PROMISE_CLOSE_LABEL
                        : (groupName.get(promise.group_id ?? '') ?? '약속')}
                    </p>
                    <p className="text-value mt-[2px] truncate font-semibold text-ink">
                      {promise.title}
                    </p>
                    <p className="text-caption mt-[2px] truncate text-ink-muted">
                      {promise.due_date
                        ? `${dDayLabel(promise.due_date, today)} · ${promise.due_date}`
                        : '기한 없음'}
                      {promise.daily_target > 1 ? ` · 하루 ${promise.daily_target}번` : ''}
                    </p>
                  </Link>

                  {promise.state === 'active' ? (
                    <KeepStrip
                      promiseId={promise.id}
                      dailyTarget={promise.daily_target}
                      dates={strip}
                      counts={checksByPromise.get(promise.id) ?? new Map()}
                      returnTo={returnTo}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-caption mt-6 px-title-gutter text-center leading-[20px] text-ink-faint">
        기록하지 않은 날은 비어 있을 뿐, 잘못한 날이 아닙니다.
      </p>
    </main>
  )
}
