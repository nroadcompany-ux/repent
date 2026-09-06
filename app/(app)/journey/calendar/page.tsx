import Link from 'next/link'

import { PageHeader } from '@/components/layout/app-header'
import { listRecords, RECORD_KIND_LABELS } from '@/data/records'
import { formatFullDate, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Journey Calendar (docs/01 item 5, AC-02 "Calendar에서 Core Record를 날짜
 * 기준으로 재탐색할 수 있다").
 *
 * A day with no record is simply blank. Nothing marks it as missed.
 */

const WEEKDAY_HEADS = ['일', '월', '화', '수', '목', '금', '토'] as const

function monthBounds(month: string): { first: string; last: string; year: number; monthIndex: number } {
  const [yearRaw, monthRaw] = month.split('-')
  const year = Number(yearRaw)
  const monthIndex = Number(monthRaw) - 1
  const first = new Date(Date.UTC(year, monthIndex, 1))
  const last = new Date(Date.UTC(year, monthIndex + 1, 0))
  return {
    first: first.toISOString().slice(0, 10),
    last: last.toISOString().slice(0, 10),
    year,
    monthIndex,
  }
}

function shiftMonth(month: string, delta: number): string {
  const [yearRaw, monthRaw] = month.split('-')
  const date = new Date(Date.UTC(Number(yearRaw), Number(monthRaw) - 1 + delta, 1))
  return date.toISOString().slice(0, 7)
}

export default async function JourneyCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; date?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const params = await searchParams

  const today = todayKst()
  const month = /^\d{4}-\d{2}$/.test(params.month ?? '') ? (params.month as string) : today.slice(0, 7)
  const { first, last, year, monthIndex } = monthBounds(month)

  const records = await listRecords(supabase, userId, { from: first, to: last, limit: 500 })

  const byDate = new Map<string, typeof records>()
  for (const record of records) {
    const list = byDate.get(record.date) ?? []
    list.push(record)
    byDate.set(record.date, list)
  }

  const leadingBlanks = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay()
  const dayCount = Number(last.slice(8, 10))
  const cells: Array<string | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`),
  ]

  const selected = params.date && byDate.has(params.date) ? params.date : null
  const selectedRecords = selected ? (byDate.get(selected) ?? []) : []

  return (
    <main>
      <PageHeader title="달력" backHref="/journey" />

      <div className="flex items-center justify-between px-title-gutter pt-2">
        <Link
          href={`/journey/calendar?month=${shiftMonth(month, -1)}`}
          className="text-body-sm font-medium text-ink-muted"
        >
          ‹ 이전 달
        </Link>
        <p className="text-value font-semibold text-ink">
          {year}년 {monthIndex + 1}월
        </p>
        <Link
          href={`/journey/calendar?month=${shiftMonth(month, 1)}`}
          className="text-body-sm font-medium text-ink-muted"
        >
          다음 달 ›
        </Link>
      </div>

      <div className="mx-gutter mt-5 rounded-card bg-surface px-3 py-4">
        <div className="grid grid-cols-7">
          {WEEKDAY_HEADS.map((head) => (
            <div key={head} className="text-caption pb-2 text-center font-medium text-ink-faint">
              {head}
            </div>
          ))}

          {cells.map((date, index) => {
            if (!date) return <div key={`blank-${index}`} />
            const dayRecords = byDate.get(date) ?? []
            const isToday = date === today
            return (
              <Link
                key={date}
                href={`/journey/calendar?month=${month}&date=${date}`}
                className="flex h-[44px] flex-col items-center justify-center"
              >
                <span
                  className={`text-body-sm flex size-[26px] items-center justify-center rounded-full ${
                    selected === date
                      ? 'bg-accent font-semibold text-white'
                      : isToday
                        ? 'bg-accent-tint font-semibold text-accent'
                        : 'text-ink'
                  }`}
                >
                  {Number(date.slice(8, 10))}
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-[3px] size-[4px] rounded-full ${
                    dayRecords.length > 0 ? 'bg-accent' : 'bg-transparent'
                  }`}
                />
              </Link>
            )
          })}
        </div>
      </div>

      <section className="mt-7">
        <h2 className="text-section px-title-gutter font-semibold text-ink">
          {selected ? formatFullDate(selected) : '날짜를 골라보세요'}
        </h2>

        {selected ? (
          selectedRecords.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-row-gap px-gutter">
              {selectedRecords.map((record) => (
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
          ) : (
            <p className="text-body-sm mt-3 px-title-gutter leading-[21px] text-ink-muted">
              이 날은 남긴 기록이 없어요.
            </p>
          )
        ) : (
          <p className="text-body-sm mt-3 px-title-gutter leading-[21px] text-ink-muted">
            점이 찍힌 날에는 기록이 있습니다.
          </p>
        )}
      </section>
    </main>
  )
}
