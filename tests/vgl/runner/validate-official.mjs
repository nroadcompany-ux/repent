#!/usr/bin/env node
// REPENT VGL — Official 65 AC Import Validator
// 상태: 실행 스크립트 (Model 호출 없음 — API Key 불필요)
//
// tests/vgl/fixtures/ac-cases.official.json이 실제로 구조·건수·ID·Verdict
// 어휘를 지키는지, 그리고 원본 Evidence 문서(tests/vgl/fixtures/source/
// 02_VGL_for_REPENT_RedTeam_65_v0.2.md)와 내용이 정말 일치하는지(문장/판정/
// 이유 무변경) 독립적으로 재검증한다. import pack이 자체 주장한
// source_integrity 필드를 그대로 믿지 않고 직접 재계산한다.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

const VALID_VERDICTS = ['ALLOW', 'REWRITE', 'SCRIPTURE_CHECK', 'HUMAN_REVIEW', 'BLOCK'];

function parseRedTeamMarkdown(md) {
  const rows = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|(.*)\|(.*)\|(.*)\|$/);
    if (m) {
      rows.push({
        no: parseInt(m[1], 10),
        sentence: m[2].trim(),
        verdict: m[3].trim(),
        reason: m[4].trim(),
      });
    }
  }
  return rows;
}

async function main() {
  const errors = [];
  const warnings = [];

  const jsonPath = path.join(REPO_ROOT, 'tests/vgl/fixtures/ac-cases.official.json');
  const mdPath = path.join(REPO_ROOT, 'tests/vgl/fixtures/source/02_VGL_for_REPENT_RedTeam_65_v0.2.md');

  const data = JSON.parse(await readFile(jsonPath, 'utf8'));
  const md = await readFile(mdPath, 'utf8');
  const mdRows = parseRedTeamMarkdown(md);

  // 1. Case count
  if (data.case_count !== 65) errors.push(`case_count !== 65 (${data.case_count})`);
  if (!Array.isArray(data.cases) || data.cases.length !== 65) {
    errors.push(`cases.length !== 65 (${data.cases?.length})`);
  }
  if (mdRows.length !== 65) errors.push(`source markdown rows !== 65 (${mdRows.length})`);

  // 2. AC ID / redteam_no coverage + sequencing
  const seenNo = new Set();
  const mdByNo = new Map(mdRows.map((r) => [r.no, r]));
  let sentenceChanged = 0;
  let verdictChanged = 0;
  let reasonChanged = 0;

  for (const c of data.cases ?? []) {
    seenNo.add(c.redteam_no);
    const expectedAcId = `VGL-RPT-AC-${String(c.redteam_no).padStart(3, '0')}`;
    if (c.ac_id !== expectedAcId) {
      errors.push(`ac_id mismatch for redteam_no=${c.redteam_no}: got ${c.ac_id}, expected ${expectedAcId}`);
    }
    if (!VALID_VERDICTS.includes(c.expected_verdict)) {
      errors.push(`invalid expected_verdict "${c.expected_verdict}" at redteam_no=${c.redteam_no}`);
    }
    if (!c.test_sentence || !c.reason || !c.source?.path) {
      errors.push(`missing required field at redteam_no=${c.redteam_no}`);
    }

    const mdRow = mdByNo.get(c.redteam_no);
    if (!mdRow) {
      errors.push(`redteam_no=${c.redteam_no} not found in source markdown`);
      continue;
    }
    if (c.test_sentence !== mdRow.sentence) sentenceChanged++;
    if (c.expected_verdict !== mdRow.verdict) verdictChanged++;
    if (c.reason !== mdRow.reason) reasonChanged++;
  }

  const missingNo = [...Array(65).keys()].map((i) => i + 1).filter((n) => !seenNo.has(n));
  if (missingNo.length) errors.push(`missing redteam_no: ${missingNo.join(',')}`);

  // 3. 자체 주장(source_integrity) vs 독립 재계산 대조
  const claimed = data.source_integrity ?? {};
  const recomputed = {
    test_sentence_changed_count: sentenceChanged,
    verdict_changed_count: verdictChanged,
    reason_changed_count: reasonChanged,
  };
  for (const key of Object.keys(recomputed)) {
    if (claimed[key] !== recomputed[key]) {
      errors.push(
        `source_integrity.${key} claimed=${claimed[key]} but independently recomputed=${recomputed[key]}`
      );
    }
  }

  const verdictDistribution = {};
  for (const c of data.cases ?? []) {
    verdictDistribution[c.expected_verdict] = (verdictDistribution[c.expected_verdict] ?? 0) + 1;
  }

  const result = {
    schema_structural_check: errors.length === 0 ? 'PASS' : 'FAIL',
    case_count: data.cases?.length ?? 0,
    ac_id_coverage: `${seenNo.size}/65`,
    independently_recomputed_source_integrity: recomputed,
    claimed_source_integrity: claimed,
    verdict_distribution: verdictDistribution,
    errors,
    warnings,
  };

  console.log(JSON.stringify(result, null, 2));
  if (errors.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error('[validate-official] 실행 실패:', e.message);
  process.exit(1);
});
