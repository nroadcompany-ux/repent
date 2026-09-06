import Link from 'next/link'

import { PageHeader } from '@/components/layout/app-header'
import { EmptyState } from '@/components/ui/state'
import { listRecords, RECORD_KIND_LABELS, RECORD_KINDS, type RecordKind } from '@/data/records'
import { formatFullDate } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * 삶의 여정 Timeline / Recent Records (docs/01 Journey IA item 6).
 * Every domain's records in one reverse-chronological list, grouped by day.
 */
export default async function JourneyTimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { kind } = await searchParams

  const activeKind = (RECORD_KINDS as readonly string[]).includes(kind ?? '')
    ? (kind as RecordKind)
    : undefined

  const records = await listRecords(supabase, userId, {
    kinds: activeKind ? [activeKind] : undefined,
    limit: 120,
  })

  const byDate = new Map<string, typeof records>()
  for (const record of records) {
    const list = byDate.get(record.date) ?? []
    list.push(record)
    byDate.set(record.date, list)
  }

  return (
    <main>
      <PageHeader title="삶의 여정" backHref="/journey" />

      <div className="no-scrollbar overflow-x-auto px-title-gutter pt-1">
        <div className="flex gap-2">
          <Link
            href="/journey/timeline"
            className={`text-caption inline-flex h-[30px] shrink-0 items-center rounded-chip px-3 font-medium ${
              activeKind ? 'border border-line bg-surface text-ink-muted' : 'bg-accent text-white'
            }`}
          >
            전체
          </Link>
          {RECORD_KINDS.map((recordKind) => (
            <Link
              key={recordKind}
              href={`/journey/timeline?kind=${recordKind}`}
              className={`text-caption inline-flex h-[30px] shrink-0 items-center rounded-chip px-3 font-medium ${
                activeKind === recordKind
                  ? 'bg-accent text-white'
                  : 'border border-line bg-surface text-ink-muted'
              }`}
            >
              {RECORD_KIND_LABELS[recordKind]}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {records.length === 0 ? (
          <EmptyState
            title="아직 남긴 기록이 없어요"
            description="기도든 약속이든, 오늘 하나만 남겨두면 여기에서 다시 만날 수 있어요."
            actionLabel="여정으로 돌아가기"
            actionHref="/journey"
          />
        ) : (
          <div className="flex flex-col gap-6">
            {Array.from(byDate.entries()).map(([date, dayRecords]) => (
              <section key={date}>
                <h2 className="text-caption px-title-gutter font-medium text-ink-muted">
                  {formatFullDate(date)}
                </h2>
                <ul className="mt-2 flex flex-col gap-row-gap px-gutter">
                  {dayRecords.map((record) => (
                    <li key={`${record.kind}-${record.id}`}>
                      <Link href={record.href} className="block rounded-row bg-surface px-4 py-4">
                        <p className="text-caption font-medium text-accent">
                          {RECORD_KIND_LABELS[record.kind]}
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
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
