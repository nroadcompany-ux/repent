#!/usr/bin/env node
// REPENT VGL AC Test Runner
// 상태: CANDIDATE / NOT OWNER APPROVED
//
// AC Input → Runtime Output → Classifier Verdict → Expected Verdict →
// PASS/FAIL → Evidence Log 흐름을 실제로 실행한다.
//
// 미실행 Case를 PASS 처리하지 않는다. Cases 파일이 비어있거나 없으면
// executed=0으로 정직하게 보고한다.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProviderClient } from '../../../runtime/src/provider-client.mjs';
import { classify } from '../../../runtime/validators/validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

function parseArgs(argv) {
  const args = { provider: null, official: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--config') args.config = argv[++i];
    else if (a === '--cases') args.cases = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--provider') args.provider = argv[++i];
    else if (a === '--official') args.official = true;
  }
  return args;
}

async function loadJson(p) {
  const raw = await readFile(p, 'utf8');
  return JSON.parse(raw);
}

export async function runSuite({ configPath, casesPath, outDir, providerOverride, official }) {
  const config = await loadJson(path.resolve(REPO_ROOT, configPath));
  const provider = providerOverride || config.provider;

  if (official && provider === 'mock') {
    throw new Error('[runner] --official 모드에서는 mock provider를 사용할 수 없습니다.');
  }

  let cases = [];
  try {
    cases = await loadJson(path.resolve(REPO_ROOT, casesPath));
  } catch (e) {
    cases = [];
  }

  const runId = randomUUID();
  const timestamp = new Date().toISOString();
  const client = createProviderClient(config, { provider });

  const results = [];
  for (const c of cases) {
    let actualOutput = null;
    let error = null;
    try {
      actualOutput = await client.complete({
        system: await readFile(path.resolve(REPO_ROOT, config.system_prompt_path), 'utf8'),
        input: c.input,
        mockResponseKey: c.mockResponseKey,
      });
    } catch (e) {
      error = e.message;
    }

    let actualVerdict = 'NOT_RUN';
    let matchedRules = [];
    if (actualOutput != null) {
      const verdict = classify(actualOutput, { scriptureRetrievalOn: config.scripture_retrieval === 'ON' });
      actualVerdict = verdict.verdict;
      matchedRules = verdict.matchedRules;
    }

    const pass = actualOutput != null && actualVerdict === c.expected_verdict;

    results.push({
      run_id: runId,
      ac_id: c.ac_id,
      actual_output: actualOutput,
      expected_verdict: c.expected_verdict,
      actual_verdict: actualVerdict,
      pass_fail: actualOutput == null ? 'NOT_RUN' : pass ? 'PASS' : 'FAIL',
      rule_id: c.rule_id ?? null,
      gate: c.gate ?? null,
      severity: c.severity ?? null,
      matched_rules: matchedRules,
      failure_reason: error ?? (pass ? null : actualOutput == null ? 'provider error' : 'verdict mismatch'),
      model_version: client.modelVersion,
      prompt_version: config.prompt_version,
      system_prompt_hash: config.system_prompt_sha256,
      timestamp,
    });
  }

  const executed = results.filter((r) => r.pass_fail !== 'NOT_RUN').length;
  const pass = results.filter((r) => r.pass_fail === 'PASS').length;
  const fail = results.filter((r) => r.pass_fail === 'FAIL').length;
  const p0FalseNegative = results.filter(
    (r) => r.severity === 'P0' && r.expected_verdict !== 'PASS' && r.actual_verdict === 'PASS'
  ).length;

  // Gate 집계: gates.json에 정의된 gate의 AC가 전부 실행+PASS일 때만 그 gate PASS.
  // (여기서는 case 파일에 실려온 gate 필드 기준 — 공식 65 AC 원문이 없으므로
  // 대부분 NOT RUN으로 나오는 것이 정상이다.)
  const gateIds = [...new Set(results.map((r) => r.gate).filter(Boolean))];
  const gateSummary = {};
  for (const g of gateIds) {
    const gateResults = results.filter((r) => r.gate === g);
    const allExecuted = gateResults.every((r) => r.pass_fail !== 'NOT_RUN');
    const allPass = gateResults.every((r) => r.pass_fail === 'PASS');
    gateSummary[g] = !allExecuted ? 'NOT_RUN' : allPass ? 'PASS' : 'FAIL';
  }

  const summary = {
    run_id: runId,
    timestamp,
    official,
    provider,
    cases_found: cases.length,
    executed,
    pass,
    fail,
    not_run: results.length - executed,
    p0_false_negative: p0FalseNegative,
    gate_summary: gateSummary,
  };

  if (outDir) {
    const resolvedOut = path.resolve(REPO_ROOT, outDir);
    await mkdir(resolvedOut, { recursive: true });
    const file = path.join(resolvedOut, `run-${runId}.jsonl`);
    const lines = results.map((r) => JSON.stringify(r)).join('\n');
    await writeFile(file, lines + (lines ? '\n' : ''), 'utf8');
    await writeFile(
      path.join(resolvedOut, `run-${runId}.summary.json`),
      JSON.stringify(summary, null, 2),
      'utf8'
    );
  }

  return { summary, results };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config || !args.cases) {
    console.error('사용법: run.mjs --config <path> --cases <path> [--out <dir>] [--provider mock|openai] [--official]');
    process.exit(1);
  }
  const { summary } = await runSuite({
    configPath: args.config,
    casesPath: args.cases,
    outDir: args.out,
    providerOverride: args.provider,
    official: args.official,
  });
  console.log(JSON.stringify(summary, null, 2));
  if (summary.cases_found === 0) {
    console.error('경고: cases 파일에서 0건을 읽음 — 아무것도 실행되지 않았습니다.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error('[runner] 실행 실패:', e.message);
    process.exit(1);
  });
}
