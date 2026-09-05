/**
 * SCR-RPT-SEA-001 — 여정 검색 / 필터.
 *
 * Search is a feature inside Journey (docs/final/05 §9.2), reached from the
 * Journey screen — never a bottom tab. Results cover the owner's own records only
 * and are ordered chronologically.
 */

import Link from 'next/link';
import { RECORD_TYPES, TIME_RANGES, type RecordType, type TimeRange } from '@/domain/journey/journey';
import type { JourneySearchQuery } from '@/domain/journey/search';
import { isEmptyQuery } from '@/domain/journey/search';
import { searchJourney } from '@/usecase/journey';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { RECORD_TYPE_LABELS, TIME_RANGE_LABELS } from '@/ui/labels';

function parseRange(raw: string | undefined): TimeRange {
  return TIME_RANGES.find((range) => range === raw) ?? 'all';
}

function parseRecordType(raw: string | undefined): RecordType | undefined {
  return RECORD_TYPES.find((type) => type === raw);
}

export default async function JourneySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; type?: string; keyword?: string }>;
}) {
  const params = await searchParams;
  const recordType = parseRecordType(params.type);

  const query: JourneySearchQuery = {
    range: parseRange(params.range),
    ...(recordType ? { recordTypes: [recordType] } : {}),
    ...(params.keyword ? { keyword: params.keyword } : {}),
  };

  const untouched = isEmptyQuery(query) && !params.range && !params.type && !params.keyword;
  const result = untouched ? undefined : await searchJourney(createContext(), query);

  return (
    <>
      <ScreenHeader title="검색" subtitle="여정 안에서 내 기록 찾기" screenId="SCR-RPT-SEA-001" />

      <main className="shell__main">
        <form className="stack" method="get" action="/journey/search">
          <input
            type="search"
            name="keyword"
            placeholder="키워드"
            defaultValue={params.keyword ?? ''}
            aria-label="키워드"
            style={{
              minHeight: 'var(--touch-target)',
              padding: '0 var(--space-3)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
            }}
          />

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="section__title">기간</legend>
            <div className="segmented">
              {TIME_RANGES.map((range) => (
                <label key={range} className="segmented__item">
                  <input
                    type="radio"
                    name="range"
                    value={range}
                    defaultChecked={query.range === range}
                    style={{ marginRight: 'var(--space-2)' }}
                  />
                  {TIME_RANGE_LABELS[range]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="section__title">기록 종류</legend>
            <div className="segmented">
              <label className="segmented__item">
                <input
                  type="radio"
                  name="type"
                  value=""
                  defaultChecked={!recordType}
                  style={{ marginRight: 'var(--space-2)' }}
                />
                전체
              </label>
              {RECORD_TYPES.map((type) => (
                <label key={type} className="segmented__item">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    defaultChecked={recordType === type}
                    style={{ marginRight: 'var(--space-2)' }}
                  />
                  {RECORD_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="cta">
            검색
          </button>
        </form>

        <section className="section" aria-label="검색 결과">
          {result === undefined ? (
            <p className="note">조건을 선택하고 검색해 주세요.</p>
          ) : !result.ok ? (
            <ErrorState title="검색하지 못했습니다." />
          ) : result.value.isEmpty ? (
            <EmptyState title="검색 결과가 없습니다." />
          ) : (
            <ul>
              {result.value.markers.map((marker) => (
                <li key={marker.recordId} className="timeline__day">
                  <span className="timeline__date">{marker.day}</span>
                  <span>
                    <span className="timeline__type">
                      {RECORD_TYPE_LABELS[marker.recordType]}
                    </span>
                    {marker.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <Link href="/journey" className="cta cta--secondary">
            여정으로 돌아가기
          </Link>
        </section>
      </main>
    </>
  );
}
