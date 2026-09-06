import Link from 'next/link'

import { PageHeader } from '@/components/layout/app-header'
import { Button, TextField } from '@/components/ui/control'
import { EmptyState } from '@/components/ui/state'
import { listRecords, RECORD_KIND_LABELS, RECORD_KINDS, type RecordKind } from '@/data/records'
import { formatMonthDay } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Search + Filter. docs/01 and AC-02 place these inside Journey — search is
 * never its own bottom tab. It only ever reaches the member's own records,
 * because every query runs under their RLS session.
 */
export default async function JourneySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; from?: string; to?: string; domain?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const params = await searchParams

  const query = (params.q ?? '').trim()
  const kindParam = params.kind ?? params.domain
  const activeKind = (RECORD_KINDS as readonly string[]).includes(kindParam ?? '')
    ? (kindParam as RecordKind)
    : undefined

  const records =
    query || activeKind || params.from || params.to
      ? await listRecords(supabase, userId, {
          query: query || undefined,
          kinds: activeKind ? [activeKind] : undefined,
          from: params.from || undefined,
          to: params.to || undefined,
          limit: 100,
        })
      : []

  const hasCriteria = Boolean(query || activeKind || params.from || params.to)

  return (
    <main>
      <PageHeader title="검색" backHref="/journey" />

      <form method="GET" className="px-title-gutter pt-2">
        <TextField name="q" defaultValue={query} placeholder="기도, 회개, 약속에서 찾기" />

        <div className="mt-3 flex gap-2">
          <TextField name="from" type="date" defaultValue={params.from ?? ''} aria-label="시작일" />
          <TextField name="to" type="date" defaultValue={params.to ?? ''} aria-label="종료일" />
        </div>

        <div className="no-scrollbar mt-3 overflow-x-auto">
          <div className="flex gap-2">
            <label className="text-caption inline-flex h-[30px] shrink-0 cursor-pointer items-center rounded-chip border border-line bg-surface px-3 font-medium text-ink-muted has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-white">
              <input type="radio" name="kind" value="" defaultChecked={!activeKind} className="sr-only" />
              전체
            </label>
            {RECORD_KINDS.map((recordKind) => (
              <label
                key={recordKind}
                className="text-caption inline-flex h-[30px] shrink-0 cursor-pointer items-center rounded-chip border border-line bg-surface px-3 font-medium text-ink-muted has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="kind"
                  value={recordKind}
                  defaultChecked={activeKind === recordKind}
                  className="sr-only"
                />
                {RECORD_KIND_LABELS[recordKind]}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Button type="submit">찾기</Button>
        </div>
      </form>

      <div className="mt-7">
        {!hasCriteria ? (
          <p className="text-body-sm px-title-gutter leading-[18px] text-ink-muted">
            찾고 싶은 말이나 기간을 정해보세요. 내가 남긴 기록만 검색됩니다.
          </p>
        ) : records.length === 0 ? (
          <EmptyState
            title="찾는 기록이 없어요"
            description="다른 말이나 기간으로 다시 찾아보세요."
          />
        ) : (
          <ul className="flex flex-col gap-row-gap px-gutter">
            {records.map((record) => (
              <li key={`${record.kind}-${record.id}`}>
                <Link href={record.href} className="block rounded-row bg-surface px-4 py-4">
                  <p className="text-caption font-medium text-accent">
                    {RECORD_KIND_LABELS[record.kind]} · {formatMonthDay(record.date)}
                  </p>
                  <p className="text-value mt-[2px] truncate font-semibold text-ink">
                    {record.title}
                  </p>
                  {record.summary ? (
                    <p className="text-caption mt-[2px] line-clamp-2 text-ink-muted">
                      {record.summary}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
