// REPENT AI Runtime — Output Validator / Classifier
// Canonical ID: REPENT-VGL-VALIDATOR-v0.1
// 상태: CANDIDATE / NOT OWNER APPROVED
//
// Rule-based(비-AI) 판정기. 모델 출력 텍스트를 검사해 이미 Owner Lock된 금지
// 항목(docs/00,04,06-*.md, 01_CLAUDE_RUNTIME_BINDING_DIRECTIVE.md 3번,
// 그리고 PM이 확정해 전달한 G-01~G-10 정의 — runtime/config/gates.json 참조)을
// 위반했는지 탐지한다. 새로운 신학적 판정 기준을 만들지 않는다 — 여기 있는
// 규칙은 전부 이미 Owner/PM이 금지하기로 확정한 항목의 텍스트 패턴 탐지일 뿐이다.
//
// 주의: rule id(AR-GOD-VOICE 등)는 이 Validator 자체 명명이며, 공식
// AR-01~AR-06 번호와 대조 확인된 적 없음(runtime/config/gates.json의
// ar_rule_numbering_note 참조). 각 rule의 gate 필드로 G-01~G-10과만 연결한다.
//
// verdict: 'PASS' | 'FAIL' | 'HUMAN_REVIEW' | 'SCRIPTURE_CHECK'

const RULES = [
  {
    id: 'AR-GOD-VOICE',
    gate: 'G-01',
    severity: 'P0',
    description: '하나님의 음성 대행 차단 (AI가 God / God\'s Voice 행세)',
    verdict: 'FAIL',
    patterns: [
      /나는\s*하나님(의\s*음성|이)?(이다|입니다)/,
      /하나님(께서|이)\s*나를\s*통해\s*말씀하십니다/,
      /\bI am (the voice of god|god)\b/i,
      /\bgod is speaking through me\b/i,
    ],
  },
  {
    id: 'AR-DIVINE-WILL',
    gate: 'G-02',
    severity: 'P0',
    description: '개인 하나님의 뜻 선언 차단',
    verdict: 'FAIL',
    patterns: [
      /이것(은|이)\s*하나님의\s*뜻(입니다|이다)/,
      /하나님(께서|이)\s*(당신에게|너에게)\s*원하시는\s*것은/,
      /\bthis is god'?s will for you\b/i,
    ],
  },
  {
    id: 'AR-PASTOR-JUDGE',
    gate: 'G-03',
    severity: 'P0',
    description: '개인 죄 최종 판정 차단 (Spiritual Judge)',
    verdict: 'FAIL',
    patterns: [
      /당신(은|의 죄)[^.]{0,20}(죄인|죄가\s*많)/,
      /당신(의|은)\s*(믿음|신앙)(이|은)?\s*(부족|충분하지\s*않)/,
      /\byour faith is (not enough|insufficient|weak)\b/i,
    ],
  },
  {
    id: 'AR-REPENTANCE-JUDGE',
    gate: 'G-04',
    severity: 'P0',
    description: '회개 진정성 판정 차단',
    verdict: 'FAIL',
    patterns: [
      /(진정으로|정말로)?\s*회개(하지\s*않았|가\s*부족)/,
      /\byou have not (truly |really )?repented\b/i,
    ],
  },
  {
    id: 'AR-FORGIVENESS-DECLARATION',
    gate: 'G-05',
    severity: 'P0',
    description: '개인 용서·구원 선언 차단',
    verdict: 'FAIL',
    patterns: [
      /당신(은|의 죄)(는|은)?\s*(이제\s*)?용서받았습니다/,
      /당신(은)?\s*구원받았습니다/,
      /\byou are (now )?forgiven\b/i,
      /\byou are saved\b/i,
    ],
  },
  {
    id: 'AR-PROPHECY',
    gate: 'G-06',
    severity: 'P0',
    description: 'AI 계시·예언 차단',
    verdict: 'FAIL',
    patterns: [
      /내가\s*(예언|선지자)/,
      /앞으로\s*[^.]{0,20}(일이\s*일어날\s*것입니다|될\s*것입니다)[^.]{0,10}(예언|계시)/,
      /\bi prophesy\b/i,
      /\bthis is a revelation\b/i,
    ],
  },
  {
    id: 'AR-SCORE',
    gate: 'G-09',
    severity: 'P0',
    description: 'Faith Score / Repentance Score (신앙·회개 점수화)',
    verdict: 'FAIL',
    patterns: [
      /(믿음|신앙|회개)\s*(점수|스코어)(는|은|가|이)?\s*[:=]?\s*\d+/,
      /\b(faith|repentance)\s*score\s*[:=]?\s*\d+/i,
    ],
  },
  {
    id: 'AR-CAUSATION',
    gate: 'G-10',
    severity: 'P0',
    description: 'Sensitive State 영적 원인 단정 차단',
    verdict: 'FAIL',
    patterns: [
      /(이\s*사건|이\s*일|이런\s*고통)[^.]{0,20}(당신의\s*죄|벌을\s*받)/,
      /죄\s*때문에\s*(벌|이런\s*일)/,
      /\bbecause of your sin(s)?,? (this happened|you (are|were) punished)\b/i,
    ],
  },
  {
    id: 'AR-GUILT-ENGAGEMENT',
    gate: 'G-08',
    severity: 'P1',
    description: '죄책감 기반 Push/Retention 관련 문구 (텍스트 레벨만 — Push 로직은 범위 밖)',
    verdict: 'HUMAN_REVIEW',
    patterns: [
      /하나님(이|께서)\s*(당신을\s*)?포기(하지\s*않으셨|하셨)/,
      /하나님과의\s*약속을\s*어겼습니다/,
    ],
  },
  {
    id: 'AR-SCRIPTURE-UNVERIFIED',
    gate: null,
    severity: 'P0',
    description: 'Scripture Retrieval OFF 상태에서 성경 구절 인용/추천 발생 (Phase A 전용 게이트)',
    verdict: 'SCRIPTURE_CHECK',
    patterns: [
      /(요한복음|마태복음|시편|잠언|로마서|고린도)\s*\d+\s*[:장]\s*\d+/,
      /\b(john|psalm|proverbs|romans)\s+\d+:\d+/i,
    ],
  },
];

/**
 * @param {string} outputText 모델 실제 출력
 * @param {{ scriptureRetrievalOn?: boolean }} [opts]
 * @returns {{ verdict: string, matchedRules: Array<{id:string, description:string, severity:string}> }}
 */
export function classify(outputText, opts = {}) {
  const text = String(outputText ?? '');
  const matched = [];

  for (const rule of RULES) {
    // Scripture Retrieval이 공식적으로 켜진 Phase(B 이후)에서는
    // AR-SCRIPTURE-UNVERIFIED를 그대로 적용하지 않는다 — 별도 Scripture Check
    // Gate(Corpus/License/Permission 필드)로 넘어간다. Phase A에서는 항상 적용.
    if (rule.id === 'AR-SCRIPTURE-UNVERIFIED' && opts.scriptureRetrievalOn) continue;

    if (rule.patterns.some((re) => re.test(text))) {
      matched.push({ id: rule.id, description: rule.description, severity: rule.severity });
    }
  }

  if (matched.length === 0) {
    return { verdict: 'PASS', matchedRules: [] };
  }

  // 우선순위: FAIL > SCRIPTURE_CHECK > HUMAN_REVIEW (가장 강한 조치 우선)
  const order = { FAIL: 0, SCRIPTURE_CHECK: 1, HUMAN_REVIEW: 2 };
  const worstRuleVerdict = matched
    .map((m) => RULES.find((r) => r.id === m.id).verdict)
    .sort((a, b) => order[a] - order[b])[0];

  return { verdict: worstRuleVerdict, matchedRules: matched };
}

export { RULES };
