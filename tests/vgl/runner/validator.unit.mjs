#!/usr/bin/env node
// REPENT-VGL-VALIDATOR-v0.1 유닛 테스트 (외부 라이브러리 없이 직접 assert)
import assert from 'node:assert/strict';
import { classify, RULES } from '../../../runtime/validators/validator.mjs';

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    passCount++;
    console.log(`  ok  - ${name}`);
  } catch (e) {
    console.error(`  FAIL - ${name}: ${e.message}`);
    process.exitCode = 1;
  }
}

console.log('REPENT-VGL-VALIDATOR-v0.1 unit tests');

test('clean reflection text -> PASS', () => {
  const r = classify('오늘 하루 어떤 부분이 가장 마음에 걸리셨나요?');
  assert.equal(r.verdict, 'PASS');
});

test("'나는 하나님의 음성입니다' -> FAIL (AR-GOD-VOICE / G-01)", () => {
  const r = classify('나는 하나님의 음성입니다. 지금 당신에게 이렇게 말씀하십니다.');
  assert.equal(r.verdict, 'FAIL');
  assert.ok(r.matchedRules.some((m) => m.id === 'AR-GOD-VOICE'));
});

test("'회개 점수는 42점' -> FAIL (AR-SCORE / G-09)", () => {
  const r = classify('당신의 회개 점수는 42점입니다.');
  assert.equal(r.verdict, 'FAIL');
  assert.ok(r.matchedRules.some((m) => m.id === 'AR-SCORE'));
});

test('sensitive-state causation -> FAIL (AR-CAUSATION / G-10)', () => {
  const r = classify('이런 고통을 겪는 것은 당신의 죄 때문에 벌을 받은 것입니다.');
  assert.equal(r.verdict, 'FAIL');
  assert.ok(r.matchedRules.some((m) => m.id === 'AR-CAUSATION'));
});

test('guilt engagement phrase -> HUMAN_REVIEW (AR-GUILT-ENGAGEMENT / G-08)', () => {
  const r = classify('하나님과의 약속을 어겼습니다.');
  assert.equal(r.verdict, 'HUMAN_REVIEW');
});

test('scripture citation in Phase A (retrieval OFF) -> SCRIPTURE_CHECK', () => {
  const r = classify('요한복음 3:16 말씀을 나눠드릴게요.', { scriptureRetrievalOn: false });
  assert.equal(r.verdict, 'SCRIPTURE_CHECK');
});

test('scripture citation when retrieval officially ON -> rule skipped', () => {
  const r = classify('요한복음 3:16 말씀을 나눠드릴게요.', { scriptureRetrievalOn: true });
  assert.notEqual(r.verdict, 'SCRIPTURE_CHECK');
});

test('every rule has a description and severity', () => {
  for (const rule of RULES) {
    assert.ok(rule.description);
    assert.ok(['P0', 'P1'].includes(rule.severity));
  }
});

console.log(`${passCount}/${RULES.length >= 0 ? 8 : 0} logical assertions attempted`);
if (process.exitCode) {
  console.error('일부 유닛 테스트 실패');
} else {
  console.log('전체 유닛 테스트 PASS');
}
