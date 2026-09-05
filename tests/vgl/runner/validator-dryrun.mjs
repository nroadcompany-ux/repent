#!/usr/bin/env node
// REPENT-VGL-VALIDATOR-v0.1 — Dry Run against Official 65 Red-Team Sentences
//
// 이것은 "65 AC Official Model Run"이 아니다. AC 방법론은
// AC Input → Runtime Output(Provider Model) → Classifier → Verdict 인데,
// 여기서는 Runtime Output 단계(실제 모델 호출)를 건너뛰고 Red-Team
// test_sentence를 이미 만들어진 "후보 출력"으로 취급해 Validator에만
// 직접 넣어본다. API Key 없이 할 수 있는 것만 정직하게 하는 것 —
// 이 결과를 "Official 65 AC Actual Test Run = DONE"으로 보고하지 않는다.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// v0.1 History 진단 — validator.mjs는 이제 v0.2를 re-export하므로(어휘가
// ALLOW/BLOCK 등으로 다름) 반드시 v0.1을 명시적으로 import한다. 안 그러면
// 이 스크립트의 PASS/FAIL 기반 VERDICT_MAP 비교가 조용히 깨진다.
import { classify } from '../../../runtime/validators/validator.v0.1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

// Red-Team 어휘 -> Validator 어휘 대응. REWRITE는 Validator에 대응 개념이
// 없음(모델링 안 함) — 새로 만들지 않고 명시적으로 미지원 처리.
const VERDICT_MAP = {
  ALLOW: 'PASS',
  BLOCK: 'FAIL',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
  SCRIPTURE_CHECK: 'SCRIPTURE_CHECK',
  REWRITE: null, // 미지원 — Validator가 REWRITE를 낼 수 없음
};

async function main() {
  const data = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'tests/vgl/fixtures/ac-cases.official.json'), 'utf8')
  );

  const rows = [];
  let matched = 0;
  let mismatched = 0;
  let unsupported = 0;

  for (const c of data.cases) {
    const mappedExpected = VERDICT_MAP[c.expected_verdict];
    const actual = classify(c.test_sentence, { scriptureRetrievalOn: false });

    let outcome;
    if (mappedExpected === null) {
      outcome = 'UNSUPPORTED_VERDICT_TYPE';
      unsupported++;
    } else if (actual.verdict === mappedExpected) {
      outcome = 'MATCH';
      matched++;
    } else {
      outcome = 'MISMATCH';
      mismatched++;
    }

    rows.push({
      ac_id: c.ac_id,
      test_sentence: c.test_sentence,
      official_expected_verdict: c.expected_verdict,
      mapped_expected_validator_verdict: mappedExpected,
      actual_validator_verdict: actual.verdict,
      matched_rules: actual.matchedRules.map((m) => m.id),
      outcome,
    });
  }

  const summary = {
    diagnostic_only: true,
    note:
      'Validator만 단독 실행한 결과 — Provider/Model 호출 없음. Official 65 AC Actual Test Run이 아님(Runtime Output 단계 생략). 참고용 진단 지표.',
    total: rows.length,
    matched,
    mismatched,
    unsupported_verdict_type: unsupported,
    accuracy_over_supported: `${matched}/${matched + mismatched}`,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log('\n--- MISMATCH cases ---');
  for (const r of rows.filter((r) => r.outcome === 'MISMATCH')) {
    console.log(`${r.ac_id} [expected ${r.official_expected_verdict} -> ${r.mapped_expected_validator_verdict}, got ${r.actual_validator_verdict}] "${r.test_sentence}"`);
  }
  console.log('\n--- UNSUPPORTED (REWRITE) cases ---');
  for (const r of rows.filter((r) => r.outcome === 'UNSUPPORTED_VERDICT_TYPE')) {
    console.log(`${r.ac_id} [official ${r.official_expected_verdict}, validator said ${r.actual_validator_verdict}] "${r.test_sentence}"`);
  }
}

main().catch((e) => {
  console.error('[validator-dryrun] 실행 실패:', e.message);
  process.exit(1);
});
