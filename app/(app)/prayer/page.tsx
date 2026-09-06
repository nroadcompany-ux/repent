import Link from 'next/link'

import { AppHeader, HeaderAction } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { EmptyState } from '@/components/ui/state'
import { InfoRow, RowStack, SectionHeader } from '@/components/ui/surface'
import { formatMonthDay } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Prayer Home. docs/01 Prayer IA:
 *   Primary surface   기도 제목 | 기도문
 *   Secondary segment 나의 기도 | 중보기도  — always visible inside 기도 제목
 *   Hierarchy         기도함 → 기도 제목 → 날짜별 기도 기록
 *
 * docs/04: the system never marks a prayer answered or unanswered, so no
 * surface here reports on outcome — only on what the member recorded.
 */

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

  // Latest record date per topic, so a row can say when it was last prayed.
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
      if (!lastPrayedByTopic.has(record.topic_id)) {
        lastPrayedByTopic.set(record.topic_id, record.prayed_on)
      }
    }
  }

  return (
    <main>
      <AppHeader
        actions={<HeaderAction href="/journey/search?domain=prayer">검색</HeaderAction>}
      />

      <EducationBanner slides={SLIDES} />

      <div className="mt-7 px-title-gutter">
        <SegmentedLinks
          active={surface}
          options={[
            { value: 'topics', label: '기도 제목', href: '/prayer?surface=topics' },
            { value: 'texts', label: '기도문', href: '/prayer?surface=texts' },
          ]}
        />
      </div>

      {surface === 'topics' ? (
        <>
          {/* docs/04: 나의 기도 | 중보기도 Secondary Segment를 항상 노출한다. */}
          <div className="mt-3 px-title-gutter">
            <SegmentedLinks
              size="sm"
              active={kind}
              options={[
                { value: 'mine', label: '나의 기도', href: '/prayer?surface=topics&kind=mine' },
                {
                  value: 'intercession',
                  label: '중보기도',
                  href: '/prayer?surface=topics&kind=intercession',
                },
              ]}
            />
          </div>

          <div className="mt-6">
            <SectionHeader
              title={kind === 'mine' ? '나의 기도' : '중보기도'}
              subtitle={`${(topics ?? []).length}개`}
              actionLabel="새 기도제목"
              actionHref={`/prayer/topic/new?kind=${kind}`}
            />
          </div>

          <div className="mt-[13px]">
            {(topics ?? []).length === 0 ? (
              <EmptyState
                title={kind === 'mine' ? '아직 기도제목이 없어요' : '아직 중보기도가 없어요'}
                description="지금 마음에 있는 한 가지부터 적어두면 충분합니다."
                actionLabel="첫 기도제목 만들기"
                actionHref={`/prayer/topic/new?kind=${kind}`}
              />
            ) : (
              <RowStack>
                {(topics ?? []).map((topic) => {
                  const lastPrayed = lastPrayedByTopic.get(topic.id)
                  return (
                    <InfoRow
                      key={topic.id}
                      label={topic.closed_at ? '마무리됨' : (topic.subject_name ?? '기도제목')}
                      value={topic.title}
                      caption={
                        lastPrayed
                          ? `최근 기도 ${formatMonthDay(lastPrayed)}`
                          : '아직 기도 기록이 없어요'
                      }
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
            <SectionHeader
              title="기도문"
              subtitle="미리 준비해 두는 기도"
              actionLabel="새 기도문"
              actionHref="/prayer/text/new"
            />
          </div>

          <div className="mt-[13px]">
            {(texts ?? []).length === 0 ? (
              <EmptyState
                title="아직 기도문이 없어요"
                description="주일예배나 소모임 대표기도를 미리 적어두면 그대로 꺼내 쓸 수 있어요."
                actionLabel="첫 기도문 쓰기"
                actionHref="/prayer/text/new"
              />
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
      </div>
    </main>
  )
}
