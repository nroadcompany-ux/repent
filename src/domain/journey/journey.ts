/**
 * Journey domain — the user's personal time axis.
 *
 * Source: docs/final/05-ia-menu-architecture.md §2, docs/final/08 SCR-RPT-JNY-001.
 *
 * Locked rules encoded here:
 * - Today is a coordinate on the Journey, never a separate tab.
 * - Missing Day = No Point. No interpolation between records.
 * - Journey is individual only: no social/"함께" surface.
 * - Time range / marker density is never interpreted as a faith score or
 *   spiritual stage.
 */

import type { Id } from '../shared/identity';

/** Journey time views. "today" is a coordinate of Journey, not a nav tab. */
export const TIME_RANGES = ['today', 'week', 'month', 'year', 'all'] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

/** Record kinds that can appear as a marker on the Journey. */
export const RECORD_TYPES = [
  'prayer',
  'promise',
  'action',
  'repentance',
  'confession',
] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

/** A marker is a reference to an existing owned record — never a copy of it. */
export interface JourneyMarker {
  readonly recordId: Id;
  readonly recordType: RecordType;
  /** Calendar day of the record, ISO `YYYY-MM-DD` in the user's local calendar. */
  readonly day: string;
  readonly title: string;
  readonly lifeEventId?: Id;
  readonly seasonId?: Id;
  readonly storyArcId?: Id;
}

/**
 * A point on the life curve. A point exists only for a day that actually has at
 * least one record — a day with no record produces no point at all.
 */
export interface JourneyPoint {
  readonly day: string;
  readonly markers: readonly JourneyMarker[];
}

/**
 * Groups markers into points, one per day that has records.
 *
 * Missing Day = No Point: days without records are simply absent from the result,
 * and no value is interpolated across the gap.
 */
export function buildJourneyPoints(markers: readonly JourneyMarker[]): JourneyPoint[] {
  const byDay = new Map<string, JourneyMarker[]>();

  for (const marker of markers) {
    const existing = byDay.get(marker.day);
    if (existing) {
      existing.push(marker);
    } else {
      byDay.set(marker.day, [marker]);
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([day, dayMarkers]) => ({ day, markers: dayMarkers }));
}

/** Inclusive day window used to filter the time axis. */
export interface DayWindow {
  readonly fromDay: string;
  readonly toDay: string;
}

function toDay(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Resolves a time range into a day window. "all" has no lower bound, expressed as
 * an empty-string fromDay so plain string comparison still works.
 */
export function resolveDayWindow(range: TimeRange, now: Date): DayWindow {
  const today = toDay(now);

  switch (range) {
    case 'today':
      return { fromDay: today, toDay: today };
    case 'week':
      return { fromDay: toDay(shiftDays(now, -6)), toDay: today };
    case 'month':
      return { fromDay: toDay(shiftDays(now, -29)), toDay: today };
    case 'year':
      return { fromDay: toDay(shiftDays(now, -364)), toDay: today };
    case 'all':
      return { fromDay: '', toDay: today };
  }
}

export function isWithinWindow(day: string, window: DayWindow): boolean {
  return day >= window.fromDay && day <= window.toDay;
}
