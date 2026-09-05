/**
 * Product Lock regression — a source scan.
 *
 * The per-domain tests prove the locked behaviour. This suite is the safety net
 * for the other direction: it fails if a forbidden concept is reintroduced
 * anywhere under src/ or app/, even in code no test happens to call.
 *
 * Comments are stripped before scanning, so documenting a prohibition ("there is
 * no anonymous option") is allowed while implementing one is not.
 *
 * Source: docs/final/09-data-state-permission.md §5, docs/final/05 §9,
 * docs/REPENT-MASTER-HANDOFF.md §4–§5.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  FORBIDDEN_METRICS,
  FORBIDDEN_STATES,
} from '../../src/domain/shared/product-lock';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Production code plus the UX validation prototypes under public/prototype —
 * a prototype is not canonical, but it must not reintroduce a locked-out
 * concept either, since Owner review happens on it.
 */
const SCANNED_DIRS = ['src', 'app', 'public/prototype'];

/** The lock definitions themselves must name the forbidden values, so skip them. */
const EXCLUDED_FILES = ['src/domain/shared/product-lock.ts'];

interface SourceFile {
  readonly path: string;
  readonly code: string;
}

function stripComments(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function collectSourceFiles(dir: string, acc: SourceFile[] = []): SourceFile[] {
  for (const entry of readdirSync(join(ROOT, dir))) {
    const relPath = `${dir}/${entry}`;
    const absPath = join(ROOT, relPath);

    if (statSync(absPath).isDirectory()) {
      collectSourceFiles(relPath, acc);
      continue;
    }

    if (!/\.(ts|tsx|js|html)$/.test(entry)) continue;
    if (entry.endsWith('.test.ts') || entry.endsWith('.test.tsx')) continue;
    if (EXCLUDED_FILES.includes(relPath)) continue;

    acc.push({ path: relPath, code: stripComments(readFileSync(absPath, 'utf8')) });
  }

  return acc;
}

const sourceFiles = SCANNED_DIRS.flatMap((dir) => collectSourceFiles(dir));

function offenders(pattern: RegExp): string[] {
  return sourceFiles
    .filter((file) => pattern.test(file.code))
    .map((file) => relative('.', file.path));
}

describe('product lock regression scan', () => {
  it('scans a non-trivial number of source files', () => {
    expect(sourceFiles.length).toBeGreaterThan(20);
  });

  it('no forbidden state exists as an identifier or literal', () => {
    for (const state of FORBIDDEN_STATES) {
      expect({ state, files: offenders(new RegExp(`\\b${state}\\b`)) }).toEqual({
        state,
        files: [],
      });
    }
  });

  it('no forbidden score or metric exists', () => {
    for (const metric of FORBIDDEN_METRICS) {
      expect({ metric, files: offenders(new RegExp(metric, 'i')) }).toEqual({
        metric,
        files: [],
      });
    }

    expect(offenders(/faith[_-]?score/i)).toEqual([]);
    expect(offenders(/spiritual[_-]?(maturity|score|judgment)/i)).toEqual([]);
  });

  it('Prayer Response Tracking is absent', () => {
    expect(offenders(/prayer[_-]?response/i)).toEqual([]);
    expect(offenders(/response[_-]?rate/i)).toEqual([]);
    expect(offenders(/\bisAnswered\b|\banswered\s*[:=]/i)).toEqual([]);
  });

  it('Action failure cause taxonomy is absent', () => {
    expect(offenders(/failure[_-]?(cause|reason|taxonomy)/i)).toEqual([]);
    expect(offenders(/whyFailed|why_failed/i)).toEqual([]);
  });

  it('Repentance has no fixed step, progress or completion wording', () => {
    expect(offenders(/회개\s*완료/)).toEqual([]);
    expect(offenders(/repentance[_-]?(step|progress|percent)/i)).toEqual([]);
    expect(offenders(/stepNumber|totalSteps|progressPercent/i)).toEqual([]);
  });

  it('Confession has no anonymous publishing', () => {
    expect(offenders(/anonymous/i)).toEqual([]);
  });

  it('the social surface has no ranking or popularity ordering', () => {
    expect(offenders(/popularity|인기순|랭킹|leaderboard/i)).toEqual([]);
    expect(offenders(/\brankBy|sortByRank|reactionCount\b/i)).toEqual([]);
  });

  it('Journey has no social / 함께 surface', () => {
    expect(offenders(/journey[_-]?(social|together|shared)/i)).toEqual([]);
  });

  it('Promise has no streak', () => {
    expect(offenders(/\bstreak\b/i)).toEqual([]);
  });

  it('no auto-repent path exists', () => {
    expect(offenders(/auto[_-]?repent/i)).toEqual([]);
  });
});
