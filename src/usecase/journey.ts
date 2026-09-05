/**
 * Journey use cases.
 *
 * Source: docs/final/08 SCR-RPT-JNY-001/002, SCR-RPT-SEA-001.
 *
 * Journey reads only the actor's own records. There is no shared/"함께" journey
 * view, and no aggregate is ever turned into a score or spiritual stage.
 */

import type { Result } from '../domain/shared/result';
import { err, ok } from '../domain/shared/result';
import type { DomainError } from '../domain/shared/errors';
import { notFound, permissionDenied } from '../domain/shared/errors';
import type { Id } from '../domain/shared/identity';
import type { JourneyPoint, JourneyMarker, TimeRange } from '../domain/journey/journey';
import { buildJourneyPoints, isWithinWindow, resolveDayWindow } from '../domain/journey/journey';
import type { JourneySearchQuery } from '../domain/journey/search';
import { applyJourneySearch } from '../domain/journey/search';
import type { TurningPoint } from '../domain/journey/turning-point';
import { canConfirmTurningPoint, confirmTurningPoint } from '../domain/journey/turning-point';
import type { UseCaseContext } from './context';

export interface JourneyView {
  readonly range: TimeRange;
  readonly points: readonly JourneyPoint[];
  readonly turningPoints: readonly TurningPoint[];
  /** True when the owner has no record in this range — an empty state, not a failure. */
  readonly isEmpty: boolean;
}

/** Reads the owner's own time axis for a range. */
export async function viewJourney(
  ctx: UseCaseContext,
  range: TimeRange,
): Promise<Result<JourneyView, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Journey is a private surface readable by its owner only'));
  }

  const markers = await ctx.repos.journey.listMarkers(ctx.actor.userId);
  const window = resolveDayWindow(range, ctx.clock.now());
  const inRange = markers.filter((marker) => isWithinWindow(marker.day, window));
  const points = buildJourneyPoints(inRange);

  const allTurningPoints = await ctx.repos.turningPoints.listByOwner(ctx.actor.userId);
  const turningPoints = allTurningPoints.filter((point) =>
    isWithinWindow(point.day, window),
  );

  return ok({ range, points, turningPoints, isEmpty: points.length === 0 });
}

export interface JourneySearchResult {
  readonly markers: readonly JourneyMarker[];
  readonly isEmpty: boolean;
}

/** Search lives inside Journey and never leaves the owner's own records. */
export async function searchJourney(
  ctx: UseCaseContext,
  query: JourneySearchQuery,
): Promise<Result<JourneySearchResult, DomainError>> {
  if (ctx.actor.role !== 'owner') {
    return err(permissionDenied('Journey search reads private sources'));
  }

  const markers = await ctx.repos.journey.listMarkers(ctx.actor.userId);
  const matched = applyJourneySearch(markers, query, ctx.clock.now());

  return ok({ markers: matched, isEmpty: matched.length === 0 });
}

/**
 * Confirms a turning point. AI may have proposed the candidate, but only the user
 * can move it to its final state.
 */
export async function confirmJourneyTurningPoint(
  ctx: UseCaseContext,
  turningPointId: Id,
): Promise<Result<TurningPoint, DomainError>> {
  const point = await ctx.repos.turningPoints.findById(turningPointId);
  if (!point) return err(notFound(`TurningPoint ${turningPointId} not found`));

  if (!canConfirmTurningPoint(ctx.actor, point)) {
    return err(permissionDenied('Only the owner can confirm a turning point'));
  }

  const confirmed = confirmTurningPoint(point, ctx.clock.now());
  await ctx.repos.turningPoints.save(confirmed);
  return ok(confirmed);
}
