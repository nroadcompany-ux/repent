import Link from 'next/link'

import { AppHeader, HeaderAction } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { JourneyGraph, JourneyGraphEmpty } from '@/components/journey/journey-graph'
import { InfoRow, RowStack, SectionHeader } from '@/components/ui/surface'
import { JOURNEY_BANNER_LEGACY_COPY } from '@/domain/copy'
import { getJourneyHome, JOURNEY_GRAPH_DAYS } from '@/data/journey'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Journey Home — Figma 3:2 "RETURN Journey Home · Premium v0.2".
 *
 * Structure follows docs/01 Journey IA and the approved frame:
 *   Header → Education Banner → TODAY compact dashboard → 나의 여정 graph
 * TODAY carries exactly the four canonical slots (docs/03, AC-02):
 *   나의 말씀 / 이어갈 기도 / 오늘의 약속·실행 / 성경읽기.
 * 회개 is deliberately not a daily tile.
 */

const SLIDES: readonly EducationSlide[] = [
  {
    // The former Login hero. Owner decision 2026-09-06 moves the Primary brand
    // copy to 다시 하나님께, and keeps this line here, where its meaning belongs
    // (docs/01 Journey IA item 2 — Education Banner).
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

export default async function JourneyPage() {
  const { supabase, userId } = await requireUser()
  const home = await getJourneyHome(supabase, userId)

  return (
    <main>
      <AppHeader
        actions={
          <>
            <HeaderAction href="/journey/search">검색</HeaderAction>
            <HeaderAction href="/journey/calendar">달력</HeaderAction>
          </>
        }
      />

      <EducationBanner slides={SLIDES} />

      <div className="mt-7">
        <SectionHeader title="오늘" subtitle="오늘 이어갈 기록" actionLabel="전체 보기" actionHref="/journey/timeline" />
      </div>

      <div className="mt-[13px]">
        <RowStack>
          <InfoRow
            label="나의 말씀"
            value={home.scripture?.reference ?? '아직 담아둔 말씀이 없어요'}
            caption={home.scripture ? (home.scripture.memo ?? '오늘 붙잡은 말씀') : '말씀 담아두기'}
            href="/journey/scripture"
          />
          <InfoRow
            label="성경읽기"
            value={
              home.reading
                ? `${home.reading.book} ${home.reading.chapter}장`
                : '아직 기록이 없어요'
            }
            caption={
              home.reading ? `지금까지 ${home.reading.chaptersRead}장 읽음` : '읽은 장 기록하기'
            }
            href="/journey/bible"
          />
          <InfoRow
            label="기도"
            value={
              home.prayer.activeTopics > 0
                ? `${home.prayer.activeTopics}개 기도제목`
                : '기도제목을 시작해 보세요'
            }
            caption={home.prayer.next ? '이어 기도하기' : '첫 기도제목 만들기'}
            href={home.prayer.next ? `/prayer/topic/${home.prayer.next.id}` : '/prayer'}
          />
          <InfoRow
            label="약속 · 실천"
            value={
              home.promise.active > 0 ? `${home.promise.active}개 진행 중` : '약속을 시작해 보세요'
            }
            caption={
              home.promise.active > 0
                ? `오늘 ${home.promise.doneToday} / ${home.promise.targetToday}`
                : '첫 약속 만들기'
            }
            href="/promise"
          />
        </RowStack>
      </div>

      <div className="mt-8">
        <SectionHeader
          title="나의 여정"
          subtitle="최근 1개월 · 내 마음과 삶의 흐름"
          actionLabel="보기"
          actionHref="/journey/graph"
        />
      </div>

      <div className="mt-[11px]">
        {home.moods.length > 0 || home.lifeEvents.length > 0 ? (
          <JourneyGraph moods={home.moods} lifeEvents={home.lifeEvents} days={JOURNEY_GRAPH_DAYS} />
        ) : (
          <JourneyGraphEmpty />
        )}
      </div>

      {/* [OPEN — NO FIGMA SOURCE] The approved frame's header carries only
          검색 / 달력, so rather than add a third header action the settings
          entry sits here as a quiet footer link until an Owner-approved
          profile entry point exists. */}
      <div className="mt-9 px-title-gutter">
        <Link href="/settings" className="text-body-sm font-medium text-ink-muted">
          내 정보
        </Link>
      </div>
    </main>
  )
}
