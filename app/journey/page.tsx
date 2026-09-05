/**
 * SCR-RPT-JNY-001 — 여정 메인 / 시간범위.
 *
 * Today is rendered as a time range of the Journey, never as its own tab.
 * A day with no record produces no row at all (Missing Day = No Point), and no
 * aggregate on this screen is presented as a score or spiritual stage.
 */

import Link from 'next/link';
import { TIME_RANGES, type TimeRange } from '@/domain/journey/journey';
import { viewJourney } from '@/usecase/journey';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { RECORD_TYPE_LABELS, TIME_RANGE_LABELS } from '@/ui/labels';

function parseRange(raw: string | undefined): TimeRange {
  return TIME_RANGES.find((range) => range === raw) ?? 'today';
}

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range = parseRange(rawRange);

  const result = await viewJourney(createContext(), range);

  return (
    <>
      <ScreenHeader
        title="여정"
        subtitle="기록이 있는 날만 남습니다."
        screenId="SCR-RPT-JNY-001"
      />

      <main className="shell__main">
        <nav className="segmented" aria-label="시간 범위">
          {TIME_RANGES.map((item) => (
            <Link
              key={item}
              href={{ pathname: '/journey', query: { range: item } }}
              className="segmented__item"
              aria-current={item === range}
            >
              {TIME_RANGE_LABELS[item]}
            </Link>
          ))}
        </nav>

        {!result.ok ? (
          <ErrorState />
        ) : result.value.isEmpty ? (
          <EmptyState
            title="이 범위에는 기록이 없습니다."
            body="기록이 없는 날은 여정에 점으로 남지 않습니다."
          />
        ) : (
          <section className="section" aria-label="기록 목록">
            <ul>
              {result.value.points.map((point) => (
                <li key={point.day} className="timeline__day">
                  <span className="timeline__date">{point.day}</span>
                  <ul>
                    {point.markers.map((marker) => (
                      <li key={marker.recordId} className="timeline__marker">
                        <span className="timeline__type">
                          {RECORD_TYPE_LABELS[marker.recordType]}
                        </span>
                        {marker.title}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="section">
          <p className="section__title">여정 안에서</p>
          <div className="stack">
            <Link href="/journey/search" className="cta cta--secondary">
              검색 · 필터
            </Link>
            <Link href="/journey/turning-point" className="cta cta--secondary">
              터닝포인트 확인
            </Link>
            <Link href="/prayer" className="cta cta--secondary">
              기도 기록하기
            </Link>
          </div>
          <p className="note" style={{ marginTop: 'var(--space-3)' }}>
            검색은 여정 안에서만 동작하며, 본인의 기록만 대상으로 합니다.
          </p>
        </section>
      </main>
    </>
  );
}
