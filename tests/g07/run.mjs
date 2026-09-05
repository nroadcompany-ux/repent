#!/usr/bin/env node
// REPENT G-07 Output Wording Test Runner — 실행·Evidence 저장
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkWording } from './wording-check.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const data = JSON.parse(await readFile(path.join(__dirname, 'wording-cases.json'), 'utf8'));
  const timestamp = new Date().toISOString();

  const results = data.cases.map((c) => {
    const { result, hasPolicyVocab, hasSpiritualJudgmentVocab } = checkWording(c.input);
    return {
      id: c.id,
      input: c.input,
      expected: c.expected,
      actual: result,
      pass_fail: result === c.expected ? 'PASS' : 'FAIL',
      reason: c.reason,
      has_policy_vocab: hasPolicyVocab,
      has_spiritual_judgment_vocab: hasSpiritualJudgmentVocab,
      timestamp,
    };
  });

  const summary = {
    note: 'G-07 STRUCTURAL_PRODUCT_POLICY Output Wording Test — Text Validator PASS/FAIL과 별도 집계',
    total: results.length,
    pass: results.filter((r) => r.pass_fail === 'PASS').length,
    fail: results.filter((r) => r.pass_fail === 'FAIL').length,
  };

  console.log(JSON.stringify({ summary, results }, null, 2));

  const outDir = path.join(__dirname, 'results');
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, 'wording-check.2026-09-05.json'),
    JSON.stringify({ summary, results }, null, 2),
    'utf8'
  );
}

main().catch((e) => {
  console.error('[g07/run] 실행 실패:', e.message);
  process.exit(1);
});
