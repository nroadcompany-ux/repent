import { AppHeader, HeaderIconAction } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { JourneyGraph, JourneyGraphEmpty } from '@/components/journey/journey-graph'
import { JourneyQuickActions } from '@/components/journey/quick-actions'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { RecordList, RecordRow, SectionHeader } from '@/components/ui/surface'
import { JOURNEY_BANNER_LEGACY_COPY } from '@/domain/copy'
import {
  getJourneyHome,
  journeyPeriod,
  JOURNEY_PERIODS,
  JOURNEY_PERIOD_DAYS,
  JOURNEY_PERIOD_LABELS,
} from '@/data/journey'
import { formatFullDate } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Journey home (Figma 118:2).
 *
 * The screen is a way in, not a summary. The old 오늘 rows restated 나의 말씀 /
 * 기도 / 약속 that each domain already owns and shows better; in their place
 * 나의 기록 offers the four things a member actually opens from here, and the
 * rest of the screen belongs to the one thing only Journey can show — the
 * graph, and what was last written into it.
 */

const SLIDES: readonly EducationSlide[] = [
  {
    headline: [...JOURNEY_BANNER_LEGACY_COPY],
    body: ['기도와 말씀, 돌아봄과 약속이', '시간 속에서 하나의 이야기로 이어집니다.'],
  },
  {
    headline: ['남긴 기록은', '언제든 다시 찾습니다'],
    body: ['달력과 검색으로 그날의 기도와', '약속을 그대로 되짚어볼 수 있어요.'],
  },
  {
    headline: ['공개는 언제나', '내가 고르는 만큼만'],
    body: ['기도와 회개는 기본이 비공개이고,', '나눌 항목은 직접 골라 담습니다.'],
  },
]

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { period: periodParam } = await searchParams

  const period = journeyPeriod(periodParam)
  const days = JOURNEY_PERIOD_DAYS[period]
  const home = await getJourneyHome(supabase, userId, days)

  return (
    <main>
      {/*
        Owner Visual Migration step 11, from Figma 118:2. 달력 leaves the header
        because it is now the fourth 나의 기록 quick action and is still listed
        under 여정 in the full menu, so no route became unreachable.
      */}
      <AppHeader
        sticky
        actions={
          <>
            <HeaderIconAction href="/journey/search" label="검색" icon="search" />
            <HeaderIconAction href="/journey/menu" label="전체 메뉴" icon="menu" />
          </>
        }
      />

      <EducationBanner slides={SLIDES} />

      <div className="mt-5">
        <SectionHeader title="나의 기록" subtitle="말씀을 읽고, 적고, 하루를 돌아보세요." />
      </div>

      <div className="mt-[9px]">
        <JourneyQuickActions />
      </div>

      <div className="mt-7">
        <SectionHeader title="나의 여정" actionLabel="전체보기" actionHref="/journey/graph" />
      </div>

      <div className="mt-3 px-title-gutter">
        <SegmentedLinks
          size="sm"
          label="여정 기간"
          active={period}
          options={JOURNEY_PERIODS.map((value) => ({
            value,
            label: JOURNEY_PERIOD_LABELS[value],
            href: value === 'month' ? '/journey' : `/journey?period=${value}`,
          }))}
        />
      </div>

      <div className="mt-2">
        {home.moods.length > 0 || home.lifeEvents.length > 0 ? (
          <JourneyGraph moods={home.moods} lifeEvents={home.lifeEvents} days={days} />
        ) : (
          <JourneyGraphEmpty
            birthDate={home.anchors.birthDate}
            returnStartedOn={home.anchors.returnStartedOn}
          />
        )}
      </div>

      <div className="mt-7">
        <SectionHeader title="최근 여정 기록" actionLabel="전체보기" actionHref="/journey/timeline" />
      </div>

      <div className="mt-3">
        {home.recentEvents.length === 0 ? (
          <p className="text-body-sm mx-gutter rounded-card bg-surface px-4 py-5 leading-[21px] text-ink-muted">
            아직 남긴 여정 기록이 없어요. 오늘 있었던 일 한 가지부터 적어보세요.
          </p>
        ) : (
          <RecordList>
            {home.recentEvents.map((event) => (
              <RecordRow
                key={event.id}
                meta={formatFullDate(event.date)}
                title={event.title}
                caption={event.body}
                href={`/journey/graph?date=${event.date}`}
              />
            ))}
          </RecordList>
        )}
      </div>
    </main>
  )
}
