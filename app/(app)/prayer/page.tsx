import Link from 'next/link'

import { AppHeader, HeaderAction } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { InfoRow, RowStack, SectionHeader } from '@/components/ui/surface'
import { formatMonthDay } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SLIDES: readonly EducationSlide[] = [
  {
    headline: ['기도는 쌓여서', '한 사람의 기록이 됩니다'],
    body: ['기도 제목을 두고 날마다 남기면', '그 흐름을 그대로 볼 수 있어요.'],
  },
  {
    headline: ['미리 적어둔 기도문은', '언제든 꺼내 씁니다'],
    body: ['주일예배와 소모임 대표기도를', '준비해 두고 복사해 나눌 수 있어요.'],
  },
]

type Surface = 'topics' | 'texts'
type Kind = 'mine' | 'intercession'

function ExamplePill() {
  return (
    <span className="text-caption mr-1 inline-flex rounded-chip bg-accent-tint px-2 py-[2px] align-middle font-medium text-accent">
      예시
    </span>
  )
}

export default async function PrayerPage({
  searchParams,
}: {
  searchParams: Promise<{ surface?: string; kind?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const params = await searchParams

  const surface: Surface = params.surface === 'texts' ? 'texts' : 'topics'
  const kind: Kind = params.kind === 'intercession' ? 'intercession' : 'mine'

  const [{ data: topics }, { data: texts }] = await Promise.all([
    supabase
      .from('prayer_topics')
      .select('id, title, kind, subject_name, closed_at, updated_at')
      .eq('user_id', userId)
      .eq('kind', kind)
      .order('closed_at', { ascending: true, nullsFirst: true })
      .order('updated_at', { ascending: false }),
    supabase
      .from('prayer_texts')
      .select('id, title, occasion, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
  ])

  const topicIds = (topics ?? []).map((topic) => topic.id)
  const lastPrayedByTopic = new Map<string, string>()
  if (topicIds.length > 0) {
    const { data: records } = await supabase
      .from('prayer_records')
      .select('topic_id, prayed_on')
      .eq('user_id', userId)
      .in('topic_id', topicIds)
      .order('prayed_on', { ascending: false })
    for (const record of records ?? []) {
      if (!lastPrayedByTopic.has(record.topic_id)) lastPrayedByTopic.set(record.topic_id, record.prayed_on)
    }
  }

  return (
    <main>
      <AppHeader actions={<HeaderAction href="/journey/search?domain=prayer">검색</HeaderAction>} />
      <EducationBanner slides={SLIDES} />

      <div className="mt-7 px-title-gutter">
        <p className="text-caption mb-2 font-medium text-ink-muted">무엇을 기록하시나요?</p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/prayer?surface=topics"
            className={`rounded-row border px-4 py-4 ${surface === 'topics' ? 'border-accent bg-accent-tint' : 'border-line bg-surface'}`}
          >
            <p className={`text-value font-semibold ${surface === 'topics' ? 'text-accent' : 'text-ink'}`}>기도제목</p>
            <p className="text-caption mt-1 leading-[18px] text-ink-muted">계속 기억하며 기도할 내용</p>
          </Link>
          <Link
            href="/prayer?surface=texts"
            className={`rounded-row border px-4 py-4 ${surface === 'texts' ? 'border-accent bg-accent-tint' : 'border-line bg-surface'}`}
          >
            <p className={`text-value font-semibold ${surface === 'texts' ? 'text-accent' : 'text-ink'}`}>기도문</p>
            <p className="text-caption mt-1 leading-[18px] text-ink-muted">실제로 적어두는 기도 내용</p>
          </Link>
        </div>
      </div>

      {surface === 'topics' ? (
        <>
          <div className="mt-6 px-title-gutter">
            <p className="text-caption mb-2 font-medium text-ink-muted">누구를 위한 기도인가요?</p>
            <SegmentedLinks
              size="sm"
              active={kind}
              options={[
                { value: 'mine', label: '나의 기도', href: '/prayer?surface=topics&kind=mine' },
                { value: 'intercession', label: '중보기도', href: '/prayer?surface=topics&kind=intercession' },
              ]}
            />
            <p className="text-caption mt-2 leading-[19px] text-ink-faint">
              {kind === 'mine'
                ? '나의 기도는 내가 하나님께 드리는 기도입니다.'
                : '중보기도는 다른 사람을 위해 하나님께 드리는 기도입니다.'}
            </p>
          </div>

          <div className="mt-6">
            <SectionHeader
              title={kind === 'mine' ? '나의 기도제목' : '중보 기도제목'}
              subtitle={`${(topics ?? []).length}개`}
              actionLabel="새 기도제목"
              actionHref={`/prayer/topic/new?kind=${kind}`}
            />
          </div>

          <div className="mt-[13px]">
            {(topics ?? []).length === 0 ? (
              <RowStack>
                <InfoRow
                  label={kind === 'mine' ? '나의 기도' : '중보기도'}
                  value={
                    <>
                      <ExamplePill />
                      {kind === 'mine' ? '가족의 건강과 평안을 위해 기도' : '아픈 친구의 회복을 위해 기도'}
                    </>
                  }
                  caption="이런 식으로 기도제목을 남길 수 있어요"
                />
                <InfoRow
                  label={kind === 'mine' ? '나의 기도' : '중보기도'}
                  value={
                    <>
                      <ExamplePill />
                      {kind === 'mine' ? '오늘 마음이 조급하지 않도록 기도' : '친구가 치료 과정에서 지치지 않도록 기도'}
                    </>
                  }
                  caption="예시는 실제 기록이나 개수에 포함되지 않아요"
                />
              </RowStack>
            ) : (
              <RowStack>
                {(topics ?? []).map((topic) => {
                  const lastPrayed = lastPrayedByTopic.get(topic.id)
                  return (
                    <InfoRow
                      key={topic.id}
                      label={topic.closed_at ? '마무리됨' : (topic.subject_name ?? '기도제목')}
                      value={topic.title}
                      caption={lastPrayed ? `최근 기도 ${formatMonthDay(lastPrayed)}` : '아직 기도 기록이 없어요'}
                      href={`/prayer/topic/${topic.id}`}
                    />
                  )
                })}
              </RowStack>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mt-6">
            <SectionHeader title="기도문" subtitle="미리 적어두고 다시 꺼내 쓰는 기도" actionLabel="새 기도문" actionHref="/prayer/text/new" />
          </div>
          <div className="mt-[13px]">
            {(texts ?? []).length === 0 ? (
              <RowStack>
                <InfoRow
                  label="기도문"
                  value={<><ExamplePill />주일예배 대표기도</>}
                  caption="예: 감사와 교회를 위한 기도문"
                />
                <InfoRow
                  label="기도문"
                  value={<><ExamplePill />가족을 위한 저녁 기도</>}
                  caption="예시는 실제 기록에 포함되지 않아요"
                />
              </RowStack>
            ) : (
              <RowStack>
                {(texts ?? []).map((prayerText) => (
                  <InfoRow
                    key={prayerText.id}
                    label={prayerText.occasion ?? '기도문'}
                    value={prayerText.title}
                    caption={`수정 ${formatMonthDay(prayerText.updated_at.slice(0, 10))}`}
                    href={`/prayer/text/${prayerText.id}`}
                  />
                ))}
              </RowStack>
            )}
          </div>
        </>
      )}

      <div className="mt-8 px-title-gutter">
        <Link href="/prayer/folders" className="text-body-sm font-medium text-accent">
          기도함 관리
        </Link>
        <p className="text-caption mt-1 text-ink-faint">기도함은 여러 기도제목을 주제별로 묶어두는 공간입니다.</p>
      </div>
    </main>
  )
}
