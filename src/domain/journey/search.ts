/**
 * Journey search / filter.
 *
 * Source: docs/final/05-ia-menu-architecture.md §2 and §9.1–9.2,
 * docs/final/08 SCR-RPT-SEA-001.
 *
 * Locked rule: search is a feature INSIDE Journey. There is no independent search
 * bottom tab, and search never leaves the owner's own records.
 */

import type { Id } from '../shared/identity';
import type { JourneyMarker, RecordType, TimeRange } from './journey';
import { isWithinWindow, resolveDayWindow } from './journey';

export interface JourneySearchQuery {
  readonly range: TimeRange;
  readonly recordTypes?: readonly RecordType[];
  readonly keyword?: string;
  readonly lifeEventId?: Id;
  readonly seasonId?: Id;
  readonly storyArcId?: Id;
}

export const EMPTY_SEARCH_QUERY: JourneySearchQuery = { range: 'all' };

export function isEmptyQuery(query: JourneySearchQuery): boolean {
  return (
    query.range === 'all' &&
    (query.recordTypes === undefined || query.recordTypes.length === 0) &&
    !query.keyword?.trim() &&
    query.lifeEventId === undefined &&
    query.seasonId === undefined &&
    query.storyArcId === undefined
  );
}

/**
 * Applies the query to the owner's own markers. Ordering is chronological
 * (newest first) — never by popularity, reaction count or any spiritual signal.
 */
export function applyJourneySearch(
  markers: readonly JourneyMarker[],
  query: JourneySearchQuery,
  now: Date,
): JourneyMarker[] {
  const window = resolveDayWindow(query.range, now);
  const keyword = query.keyword?.trim().toLowerCase();

  return markers
    .filter((marker) => {
      if (!isWithinWindow(marker.day, window)) return false;

      if (query.recordTypes && query.recordTypes.length > 0) {
        if (!query.recordTypes.includes(marker.recordType)) return false;
      }

      if (keyword && !marker.title.toLowerCase().includes(keyword)) return false;

      if (query.lifeEventId && marker.lifeEventId !== query.lifeEventId) return false;
      if (query.seasonId && marker.seasonId !== query.seasonId) return false;
      if (query.storyArcId && marker.storyArcId !== query.storyArcId) return false;

      return true;
    })
    .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
}
