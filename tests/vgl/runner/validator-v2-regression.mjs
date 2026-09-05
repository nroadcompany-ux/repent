#!/usr/bin/env node
// REPENT-VGL-VALIDATOR-v0.2 — Canonical 65 Regression + Robustness Set
//
// Canonical 65는 Regression 측정에만 쓴다 — 이 스크립트는 case별 literal
// 문자열이나 AC ID별 예외를 두지 않는다. Validator(runtime/validators/
// validator.v0.2.mjs)는 이 스크립트를 전혀 참조하지 않고 독립적으로
// 존재하며, 여기서는 그 결과를 65건 전체에 대해 집계만 한다.
//
// Robustness Set(NON-CANONICAL)은 별도로 측정해 암기가 아니라 일반화를
// 검증한다. 두 지표를 하나의 Accuracy로 합치지 않는다(PM 지시 8번).

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classify } from '../../../runtime/validators/validator.v0.2.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

async function main() {
  // ── Canonical 65 ──────────────────────────────────────────────────
  const official = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'tests/vgl/fixtures/ac-cases.official.json'), 'utf8')
  );

  const canonicalRows = official.cases.map((c) => {
    const actual = classify(c.test_sentence, { scriptureRetrievalOn: false });
    return {
      ac_id: c.ac_id,
      expected: c.expected_verdict,
      actual: actual.verdict,
      correct: actual.verdict === c.expected_verdict,
      matched: actual.matchedRules.map((m) => m.id),
    };
  });

  const total = canonicalRows.length;
  const routedCorrectly = canonicalRows.filter((r) => r.correct).length;
  const misrouted = total - routedCorrectly;

  const blockCases = canonicalRows.filter((r) => r.expected === 'BLOCK');
  const blockFalseNegative = blockCases.filter((r) => r.actual !== 'BLOCK').length;
  const nonBlockCases = canonicalRows.filter((r) => r.expected !== 'BLOCK');
  const blockFalsePositive = nonBlockCases.filter((r) => r.actual === 'BLOCK').length;

  const rewriteCases = canonicalRows.filter((r) => r.expected === 'REWRITE');
  const rewriteCoverage = rewriteCases.length
    ? `${rewriteCases.filter((r) => r.actual === 'REWRITE').length}/${rewriteCases.length}`
    : '0/0';

  const humanReviewCases = canonicalRows.filter((r) => r.expected === 'HUMAN_REVIEW');
  const humanReviewRouting = humanReviewCases.length
    ? `${humanReviewCases.filter((r) => r.actual === 'HUMAN_REVIEW').length}/${humanReviewCases.length}`
    : '0/0';

  const scriptureCases = canonicalRows.filter((r) => r.expected === 'SCRIPTURE_CHECK');
  const scriptureRouting = scriptureCases.length
    ? `${scriptureCases.filter((r) => r.actual === 'SCRIPTURE_CHECK').length}/${scriptureCases.length}`
    : '0/0';

  // ── Robustness Set (NON-CANONICAL) ───────────────────────────────
  const robustness = JSON.parse(
    await readFile(
      path.join(REPO_ROOT, 'tests/vgl/fixtures/robustness/paraphrase-challenge-set.json'),
      'utf8'
    )
  );

  const robustnessRows = robustness.items.map((it) => {
    const actual = classify(it.text, { scriptureRetrievalOn: false });
    return {
      id: it.id,
      category: it.category,
      type: it.type,
      expected: it.expected_verdict,
      actual: actual.verdict,
      correct: actual.verdict === it.expected_verdict,
    };
  });
  const robustnessTotal = robustnessRows.length;
  const robustnessCorrect = robustnessRows.filter((r) => r.correct).length;
  const robustnessIncorrect = robustnessTotal - robustnessCorrect;

  const report = {
    canonical_65: {
      total,
      routed_correctly: routedCorrectly,
      misrouted,
      block_false_negative: blockFalseNegative,
      block_false_positive: blockFalsePositive,
      rewrite_coverage: rewriteCoverage,
      human_review_routing: humanReviewRouting,
      scripture_check_routing: scriptureRouting,
    },
    robustness_set: {
      status: 'NON-CANONICAL / ENGINEERING TEST ONLY',
      total: robustnessTotal,
      correct: robustnessCorrect,
      incorrect: robustnessIncorrect,
    },
    g07: {
      status: 'STRUCTURAL_PRODUCT_POLICY',
      note: 'NOT TEXT-VALIDATED — Text Validator PASS/FAIL 계산에 포함하지 않음. 별도 Evidence(Moderation Policy/Community AC/Output Wording Test) 필요.',
    },
  };

  console.log(JSON.stringify(report, null, 2));

  console.log('\n--- Canonical 65 misroutes ---');
  for (const r of canonicalRows.filter((r) => !r.correct)) {
    console.log(`${r.ac_id} expected=${r.expected} actual=${r.actual} matched=${JSON.stringify(r.matched)}`);
  }

  console.log('\n--- Robustness Set incorrect ---');
  for (const r of robustnessRows.filter((r) => !r.correct)) {
    console.log(`${r.id} [${r.category}/${r.type}] expected=${r.expected} actual=${r.actual}`);
  }
}

main().catch((e) => {
  console.error('[validator-v2-regression] 실행 실패:', e.message);
  process.exit(1);
});
