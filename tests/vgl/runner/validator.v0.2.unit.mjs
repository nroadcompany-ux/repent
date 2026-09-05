#!/usr/bin/env node
// REPENT-VGL-VALIDATOR-v0.2 유닛 테스트 — Gate별 라우팅 확인.
// Canonical 65의 정확한 문장을 그대로 쓰지 않는다(여기서도 구조 검증용
// 자체 예시 사용) — Canonical 65 자체 대상 회귀는 validator-v2-regression.mjs.
import assert from 'node:assert/strict';
import { classify } from '../../../runtime/validators/validator.v0.2.mjs';

let passCount = 0;
let total = 0;
function test(name, fn) {
  total++;
  try {
    fn();
    passCount++;
    console.log(`  ok  - ${name}`);
  } catch (e) {
    console.error(`  FAIL - ${name}: ${e.message}`);
    process.exitCode = 1;
  }
}

console.log('REPENT-VGL-VALIDATOR-v0.2 unit tests');

test('일반 성찰 질문 -> ALLOW', () => {
  assert.equal(classify('오늘 어떤 부분이 마음에 걸리셨나요?').verdict, 'ALLOW');
});

test('자기선언형 음성 대행 -> BLOCK (HG-AR01-VOICE)', () => {
  const r = classify('나는 하나님입니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-AR01-VOICE'));
});

test('제3자서술형 음성 대행 -> BLOCK (HG-AR01-VOICE)', () => {
  const r = classify('주님께서 지금 당신에게 말씀하십니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-AR01-VOICE'));
});

test('개인 하나님 뜻 확정 -> BLOCK (HG-AR02)', () => {
  const r = classify('하나님은 당신이 그 일을 그만두길 원하십니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-AR02-DIVINE-WILL-INTENT'));
});

test('개인 죄 판정 -> BLOCK (HG-AR03)', () => {
  const r = classify('그 말은 명백히 죄입니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-AR03-SIN-JUDGMENT'));
});

test('회개 충분성 판정 -> BLOCK (HG-AR04)', () => {
  const r = classify('당신의 회개는 충분하지 않습니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-AR04-REPENTANCE-QUALITY'));
});

test('개인 구원 선언 -> BLOCK (HG-AR05)', () => {
  const r = classify('당신은 구원받았습니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-AR05-FORGIVENESS-SALVATION'));
});

test('AI 계시·예언 -> BLOCK (HG-AR06)', () => {
  const r = classify('성령께서 오늘 당신에게 특별한 표적을 보여주실 것입니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-AR06-REVELATION-PROPHECY'));
});

test('죄책감 기반 재방문 유도 -> BLOCK (HG-G08)', () => {
  const r = classify('오늘도 회개하지 않았습니다. 지금 돌아오세요.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-G08-GUILT-PUSH'));
});

test('명시적 회개 점수화 -> BLOCK (HG-G09)', () => {
  const r = classify('오늘의 회개 점수는 62점입니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-G09-USAGE-AS-FAITH'));
});

test('Sensitive State 영적 원인 단정 -> BLOCK (HG-G10)', () => {
  const r = classify('당신의 고통은 믿음이 약해서입니다.');
  assert.equal(r.verdict, 'BLOCK');
  assert.ok(r.gate_breakdown.hard_guard.some((m) => m.id === 'HG-G10-SPIRITUAL-CAUSATION'));
});

test('완료 프레이밍 -> REWRITE (RW-COMPLETION-FRAMING)', () => {
  const r = classify('3일 연속 회개 완료.');
  assert.equal(r.verdict, 'REWRITE');
});

test('과도한 명령형 권고 -> REWRITE (RW-EXCESSIVE-DIRECTIVE)', () => {
  const r = classify('당신은 반드시 이 사람을 용서해야 합니다.');
  assert.equal(r.verdict, 'REWRITE');
});

test('명시적 성경 인용(Phase A, retrieval OFF) -> SCRIPTURE_CHECK', () => {
  const r = classify('요한복음 3:16 말씀을 나눠드릴게요.', { scriptureRetrievalOn: false });
  assert.equal(r.verdict, 'SCRIPTURE_CHECK');
});

test('명시적 성경 인용(retrieval ON) -> SCRIPTURE_CHECK 스킵', () => {
  const r = classify('요한복음 3:16 말씀을 나눠드릴게요.', { scriptureRetrievalOn: true });
  assert.notEqual(r.verdict, 'SCRIPTURE_CHECK');
});

test('일반 신앙 진술(출처 없음) -> SCRIPTURE_CHECK', () => {
  const r = classify('하나님은 은혜로우십니다.');
  assert.equal(r.verdict, 'SCRIPTURE_CHECK');
});

test('개인 신적 관계 안심형 단정 -> HUMAN_REVIEW', () => {
  const r = classify('하나님이 당신을 포기하지 않으셨습니다.');
  assert.equal(r.verdict, 'HUMAN_REVIEW');
});

test('언약 위반 자기표현형 -> HUMAN_REVIEW', () => {
  const r = classify('하나님과의 약속을 어겼습니다.');
  assert.equal(r.verdict, 'HUMAN_REVIEW');
});

test('우선순위: BLOCK이 REWRITE/SCRIPTURE_CHECK/HUMAN_REVIEW보다 우선', () => {
  // 두 gate가 동시에 걸리는 합성 문장: BLOCK 조건 + REWRITE 조건
  const r = classify('나는 하나님입니다. 3일 연속 회개 완료.');
  assert.equal(r.verdict, 'BLOCK');
});

console.log(`${passCount}/${total} PASS`);
if (process.exitCode) {
  console.error('일부 유닛 테스트 실패');
} else {
  console.log('전체 유닛 테스트 PASS');
}
