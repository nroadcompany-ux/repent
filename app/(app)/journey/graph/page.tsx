import { PageHeader } from '@/components/layout/app-header'
import { JourneyGraph, JourneyGraphEmpty } from '@/components/journey/journey-graph'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { MOOD_LABELS } from '@/domain/product-lock'
import { addDays, formatFullDate, formatMonthDay, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { deleteLifeEvent, deleteMood, saveLifeEvent, saveMood } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * 나의 여정 — the full graph surface.
 *
 * Two layers, kept visibly separate because they mean different things:
 *   · 마음 기록  five-step self record, one point per recorded day, never joined
 *   · 삶의 사건  the member's own life events, joined by a line
 *
 * docs/04 forbids converting either into 신앙 수준, 하나님과의 거리, or an
 * 영적 상태, so the copy on this screen never frames a low point as a spiritual
 * problem, and no faith or finance scoring layer exists.
 */

const RANGES = [
  { value: '30', label: '1개월' },
  { value: '90', label: '3개월' },
  { value: '365', label: '1년' },
] as const

export default async function JourneyGraphPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; date?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { range: rangeParam, date: dateParam, error } = await searchParams

  const days = RANGES.some((range) => range.value === rangeParam) ? Number(rangeParam) : 30
  const today = todayKst()
  const from = addDays(today, -(days - 1))
  const focusDate = dateParam && dateParam <= today ? dateParam : today

  const [{ data: moods }, { data: events }, { data: focusMood }] = await Promise.all([
    supabase
      .from('mood_records')
      .select('recorded_on, level, note')
      .eq('user_id', userId)
      .gte('recorded_on', from)
      .lte('recorded_on', today)
      .order('recorded_on'),
    supabase
      .from('life_events')
      .select('id, occurred_on, title, body, category, significance')
      .eq('user_id', userId)
      .gte('occurred_on', from)
      .lte('occurred_on', today)
      .order('occurred_on', { ascending: false }),
    supabase
      .from('mood_records')
      .select('level, note')
      .eq('user_id', userId)
      .eq('recorded_on', focusDate)
      .maybeSingle(),
  ])

  const graphMoods = (moods ?? []).map((mood) => ({ date: mood.recorded_on, level: mood.level }))
  const graphEvents = (events ?? []).map((event) => ({
    id: event.id,
    date: event.occurred_on,
    title: event.title,
    significance: event.significance,
  }))

  return (
    <main>
      <PageHeader title="나의 여정" backHref="/journey" />

      <div className="px-title-gutter pt-1">
        <SegmentedLinks
          size="sm"
          active={String(days)}
          options={RANGES.map((range) => ({
            value: range.value,
            label: range.label,
            href: `/journey/graph?range=${range.value}`,
          }))}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-4 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          저장하지 못했어요. 다시 시도해 주세요.
        </p>
      ) : null}

      <div className="mt-5">
        {graphMoods.length > 0 || graphEvents.length > 0 ? (
          <JourneyGraph
            moods={graphMoods}
            lifeEvents={graphEvents}
            days={days}
            href={`/journey/graph?range=${days}`}
          />
        ) : (
          <JourneyGraphEmpty />
        )}
      </div>

      <p className="text-caption mt-3 px-title-gutter leading-[17px] text-ink-faint">
        점은 내가 기록한 날에만 찍힙니다. 기록하지 않은 날은 비어 있을 뿐이고, 그 사이를 이어 그리지
        않습니다. 선으로 잇는 것은 삶의 사건 층뿐입니다.
      </p>

      {/* 마음 기록 */}
      <section className="mt-8 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">오늘의 마음</h2>
        <p className="text-body-sm mt-1 leading-[18px] text-ink-muted">
          {formatFullDate(focusDate)}
        </p>

        <form action={saveMood} className="mt-4">
          <input type="hidden" name="recorded_on" value={focusDate} />
          <input type="hidden" name="return_to" value={`/journey/graph?range=${days}`} />

          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="submit"
                name="level"
                value={level}
                aria-pressed={focusMood?.level === level}
                className={`text-body-sm h-[36px] rounded-chip px-3 font-medium ${
                  focusMood?.level === level
                    ? 'bg-accent text-white'
                    : 'border border-line bg-surface text-ink-muted'
                }`}
              >
                {MOOD_LABELS[level]}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <TextArea
              name="note"
              rows={2}
              maxLength={1000}
              defaultValue={focusMood?.note ?? ''}
              placeholder="한 줄 남겨두기 (선택)"
            />
          </div>
        </form>

        {focusMood ? (
          <form action={deleteMood} className="mt-2">
            <input type="hidden" name="recorded_on" value={focusDate} />
            <input type="hidden" name="return_to" value={`/journey/graph?range=${days}`} />
            <button type="submit" className="text-caption font-medium text-ink-muted">
              이 날 기록 지우기
            </button>
          </form>
        ) : null}
      </section>

      {/* 삶의 사건 */}
      <section className="mt-9 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">삶의 사건</h2>
        <p className="text-body-sm mt-1 leading-[18px] text-ink-muted">
          기억해두고 싶은 일을 남겨두면 흐름 위에 함께 보입니다.
        </p>

        <form action={saveLifeEvent} className="mt-4">
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="title">무슨 일이 있었나요</FieldLabel>
              <TextField id="title" name="title" maxLength={100} required />
            </div>
            <div>
              <FieldLabel htmlFor="occurred_on">언제</FieldLabel>
              <TextField id="occurred_on" name="occurred_on" type="date" defaultValue={today} />
            </div>
            <div>
              <FieldLabel htmlFor="significance">나에게 어떤 일이었나요</FieldLabel>
              <select
                id="significance"
                name="significance"
                defaultValue="0"
                className="h-control w-full rounded-control border border-line bg-surface px-4 text-value text-ink outline-none focus:border-accent"
              >
                <option value="-5">아주 힘들었던 일</option>
                <option value="-3">힘들었던 일</option>
                <option value="0">그저 그런 일</option>
                <option value="3">좋았던 일</option>
                <option value="5">아주 좋았던 일</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="body">자세히 (선택)</FieldLabel>
              <TextArea id="body" name="body" rows={4} maxLength={4000} />
            </div>
          </div>
          <div className="mt-5">
            <Button type="submit">사건 남기기</Button>
          </div>
        </form>
      </section>

      {(events ?? []).length > 0 ? (
        <ul className="mt-6 flex flex-col gap-row-gap px-gutter">
          {(events ?? []).map((event) => (
            <li key={event.id} className="rounded-row bg-surface px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-caption font-medium text-accent">
                    {formatMonthDay(event.occurred_on)}
                    {event.category ? ` · ${event.category}` : ''}
                  </p>
                  <p className="text-value mt-[2px] font-semibold text-ink">{event.title}</p>
                  {event.body ? (
                    <p className="text-body-sm mt-2 whitespace-pre-wrap leading-[19px] text-ink-muted">
                      {event.body}
                    </p>
                  ) : null}
                </div>
                <form action={deleteLifeEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <button type="submit" className="text-caption shrink-0 font-medium text-ink-faint">
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}
