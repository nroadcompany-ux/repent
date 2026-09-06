import Link from 'next/link'

import { AppHeader, HeaderAction } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { JourneyGraph, JourneyGraphEmpty } from '@/components/journey/journey-graph'
import { InfoRow, RowStack, SectionHeader } from '@/components/ui/surface'
import { JOURNEY_BANNER_LEGACY_COPY } from '@/domain/copy'
import { getJourneyHome, JOURNEY_GRAPH_DAYS } from '@/data/journey'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

function ExamplePill() {
  return (
    <span className="text-caption mr-1 inline-flex rounded-chip bg-accent-tint px-2 py-[2px] align-middle font-medium text-accent">
      예시
    </span>
  )
}

export default async function JourneyPage() {
  const { supabase, userId } = await requireUser()
  const home = await getJourneyHome(supabase, userId)

  return (
    <main>
      <AppHeader
        sticky
        actions={
          <>
            <HeaderAction href="/journey/search">검색</HeaderAction>
            <HeaderAction href="/journey/calendar">달력</HeaderAction>
            <Link href="/journey/menu" aria-label="메뉴" className="text-body font-medium text-ink-muted">
              ☰
            </Link>
          </>
        }
      />

      <EducationBanner slides={SLIDES} />

      <div className="mt-5">
        <SectionHeader title="오늘" subtitle="오늘 이어갈 기록" actionLabel="전체 보기" actionHref="/journey/timeline" />
      </div>

      <div className="mt-[11px]">
        <RowStack>
          <InfoRow
            label="나의 말씀"
            value={
              home.scripture?.reference ?? (
                <>
                  <ExamplePill />“두려워하지 말라 내가 너와 함께 함이라”
                </>
              )
            }
            caption={home.scripture ? (home.scripture.memo ?? '오늘 붙잡은 말씀') : '오늘 마음에 남은 말씀을 담아보세요'}
            href="/journey/scripture"
          />
          <InfoRow
            label="기도"
            value={
              home.prayer.activeTopics > 0 ? (
                `${home.prayer.activeTopics}개 기도제목`
              ) : (
                <>
                  <ExamplePill />가족의 건강과 평안을 위해 기도
                </>
              )
            }
            caption={home.prayer.next ? '이어 기도하기' : '오늘의 기도제목을 남겨보세요'}
            href={home.prayer.next ? `/prayer/topic/${home.prayer.next.id}` : '/prayer'}
          />
          <InfoRow
            label="약속 · 실천"
            value={
              home.promise.active > 0 ? (
                `${home.promise.active}개 진행 중`
              ) : (
                <>
                  <ExamplePill />오늘은 먼저 사과하기
                </>
              )
            }
            caption={
              home.promise.active > 0
                ? `오늘 ${home.promise.doneToday} / ${home.promise.targetToday}`
                : '말씀을 삶에서 한 가지 실천해보세요'
            }
            href="/promise"
          />
        </RowStack>
      </div>

      <div className="mt-6">
        <SectionHeader
          title="나의 여정"
          subtitle="최근 1개월 · 내 마음과 삶의 흐름"
          actionLabel="보기"
          actionHref="/journey/graph"
        />
      </div>

      <div className="mt-[9px]">
        {home.moods.length > 0 || home.lifeEvents.length > 0 ? (
          <JourneyGraph moods={home.moods} lifeEvents={home.lifeEvents} days={JOURNEY_GRAPH_DAYS} />
        ) : (
          <JourneyGraphEmpty
            birthDate={home.anchors.birthDate}
            returnStartedOn={home.anchors.returnStartedOn}
          />
        )}
      </div>

      <div className="mt-8">
        <SectionHeader title="성경읽기" subtitle="읽은 장을 차곡차곡 기록해요" actionLabel="보기" actionHref="/journey/bible" />
      </div>
      <div className="mt-[11px]">
        <RowStack>
          <InfoRow
            label="성경읽기"
            value={
              home.reading ? (
                `${home.reading.book} ${home.reading.chapter}장`
              ) : (
                <>
                  <ExamplePill />요한복음 15장
                </>
              )
            }
            caption={home.reading ? `지금까지 ${home.reading.chaptersRead}장 읽음` : '오늘 읽은 장을 기록해보세요'}
            href="/journey/bible"
          />
        </RowStack>
      </div>

      <div className="mt-8 px-title-gutter">
        <Link href="/settings" className="text-body-sm font-medium text-ink-muted">
          내 정보
        </Link>
      </div>
    </main>
  )
}
