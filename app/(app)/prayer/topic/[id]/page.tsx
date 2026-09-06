import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, TextArea } from '@/components/ui/control'
import { formatFullDate, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { addPrayerRecord, closePrayerTopic, reopenPrayerTopic } from '../../actions'

export const dynamic = 'force-dynamic'

/**
 * Prayer Detail — 기도 제목 → 날짜별 기도 기록 (docs/01).
 *
 * Primary CTA is 오늘의 기도 남기기 (docs/03). The follow-on paths come from
 * docs/02: 이전 / 다음 / 목록 / 약속으로 남기기 / 나누기.
 * Nothing on this screen declares a prayer answered or unanswered (docs/04).
 */

const ERRORS: Record<string, string> = {
  empty: '기도 내용을 입력해 주세요.',
  save: '저장하지 못했어요. 입력하신 내용은 그대로 있습니다. 다시 시도해 주세요.',
  title: '기도제목을 입력해 주세요.',
}

export default async function PrayerTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { error } = await searchParams

  const { data: topic } = await supabase
    .from('prayer_topics')
    .select('id, title, kind, subject_name, body, closed_at, created_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!topic) notFound()

  const [{ data: records }, { data: siblings }] = await Promise.all([
    supabase
      .from('prayer_records')
      .select('id, prayed_on, body')
      .eq('topic_id', id)
      .eq('user_id', userId)
      .order('prayed_on', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('prayer_topics')
      .select('id, updated_at')
      .eq('user_id', userId)
      .eq('kind', topic.kind)
      .order('updated_at', { ascending: false }),
  ])

  const order = (siblings ?? []).map((row) => row.id)
  const position = order.indexOf(id)
  const previousId = position > 0 ? order[position - 1] : undefined
  const nextId = position >= 0 && position < order.length - 1 ? order[position + 1] : undefined

  return (
    <main>
      <PageHeader
        title={topic.title}
        backHref={`/prayer?surface=topics&kind=${topic.kind}`}
        actions={
          <Link href={`/prayer/topic/${id}/edit`} className="text-body font-medium text-accent">
            수정
          </Link>
        }
      />

      <div className="px-title-gutter pt-2">
        <div className="flex items-center gap-2">
          {topic.subject_name ? (
            <span className="text-caption rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
              {topic.subject_name}
            </span>
          ) : null}
          {topic.closed_at ? (
            <span className="text-caption rounded-chip bg-canvas px-[10px] py-[4px] font-medium text-ink-muted">
              마무리됨
            </span>
          ) : null}
        </div>

        {topic.body ? (
          <p className="text-body mt-4 whitespace-pre-wrap leading-[22px] text-ink">{topic.body}</p>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-4 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          {ERRORS[error] ?? '다시 시도해 주세요.'}
        </p>
      ) : null}

      {/* Primary CTA — docs/03 */}
      {!topic.closed_at ? (
        <form action={addPrayerRecord} className="mt-6 px-title-gutter">
          <input type="hidden" name="topic_id" value={id} />
          <input type="hidden" name="prayed_on" value={todayKst()} />
          <p className="text-caption mb-[6px] font-medium text-accent">오늘의 기도</p>
          <TextArea
            name="body"
            rows={4}
            maxLength={4000}
            placeholder="오늘 이 제목으로 어떻게 기도했는지 남겨보세요."
            required
          />
          <div className="mt-3">
            <Button type="submit">오늘의 기도 남기기</Button>
          </div>
        </form>
      ) : null}

      {/* Cross-domain paths — docs/02 Prayer Detail 후속 */}
      <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 px-title-gutter">
        <Link
          href={`/promise/new?source=prayer_topic&sourceId=${id}&title=${encodeURIComponent(topic.title)}`}
          className="text-body-sm font-medium text-accent"
        >
          약속으로 남기기
        </Link>
        <Link
          href={`/confession/write?source=prayer_topic&sourceId=${id}`}
          className="text-body-sm font-medium text-accent"
        >
          나누기
        </Link>
        <Link href="/prayer" className="text-body-sm font-medium text-ink-muted">
          목록
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-section px-title-gutter font-semibold text-ink">
          기도 기록 {(records ?? []).length}
        </h2>

        {(records ?? []).length === 0 ? (
          <p className="text-body-sm mt-3 px-title-gutter leading-[18px] text-ink-muted">
            아직 남긴 기도가 없어요. 오늘 한 줄이면 충분합니다.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-row-gap px-gutter">
            {(records ?? []).map((record) => (
              <li key={record.id} className="rounded-row bg-surface px-4 py-4">
                <p className="text-caption font-medium text-accent">
                  {formatFullDate(record.prayed_on)}
                </p>
                <p className="text-body mt-2 whitespace-pre-wrap leading-[22px] text-ink">
                  {record.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex items-center justify-between px-title-gutter">
        {previousId ? (
          <Link href={`/prayer/topic/${previousId}`} className="text-body-sm font-medium text-ink-muted">
            ‹ 이전
          </Link>
        ) : (
          <span />
        )}
        {nextId ? (
          <Link href={`/prayer/topic/${nextId}`} className="text-body-sm font-medium text-ink-muted">
            다음 ›
          </Link>
        ) : (
          <span />
        )}
      </div>

      <div className="mt-8 px-title-gutter">
        <form action={topic.closed_at ? reopenPrayerTopic : closePrayerTopic}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="quiet">
            {topic.closed_at ? '다시 기도 이어가기' : '이 기도제목 마무리하기'}
          </Button>
        </form>
        <p className="text-caption mt-3 text-center leading-[17px] text-ink-faint">
          마무리는 기록을 정리하는 것일 뿐, 응답 여부를 뜻하지 않습니다.
        </p>
      </div>
    </main>
  )
}
