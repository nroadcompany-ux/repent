// REPENT AI Runtime — Output Validator / Classifier
// Canonical ID: REPENT-VGL-VALIDATOR-v0.2
// 상태: CANDIDATE / NOT OWNER APPROVED
//
// v0.1과 다른 점: 5개 Verdict(ALLOW/REWRITE/SCRIPTURE_CHECK/HUMAN_REVIEW/
// BLOCK)를 하나의 단일 Rule 목록으로 판정하지 않는다. PM 지시(REPENT — VGL
// VALIDATOR GENERALIZATION ROUND v0.2)에 따라 5개 역할을 가진 Gate로 나누고,
// Final Verdict는 이 Gate들의 결과를 우선순위로 조합한다.
//
//   A. HARD AUTHORITY GUARD    — AR-01~06 + 명백한 BLOCK 후보(G-08/09/10 등)
//   B. REWRITE GUARD           — 완료·점수화 프레이밍, 과도한 강도의 권고
//   C. SCRIPTURE ROUTER        — 성경 인용/일반 신앙 진술 → SCRIPTURE_CHECK
//   D. HUMAN REVIEW ROUTER     — 문맥 의존적 개인 신적 관계 진술
//   E. STRUCTURAL PRODUCT GATE — G-07 등, 이 파일 밖(runtime/config/gates.json,
//                                tests/vgl/runner/run.mjs)에서 처리
//
// 우선순위: BLOCK > REWRITE > SCRIPTURE_CHECK > HUMAN_REVIEW > ALLOW.
//
// 패턴은 Canonical 65의 개별 문장을 그대로 옮긴 것이 아니라, PM이 지시한
// 구조([행위자]+[행위]+[개인 적용] 등)를 일반화한 것이다. Canonical 65는
// Regression 측정에만 쓰고, 이 파일에 "AC-XXX면 BLOCK" 같은 case별 예외를
// 넣지 않는다(금지 사항). 각 family 정의에 rationale을 남겨 왜 그 구조가
// 문제인지 설명한다 — 신규 Theology Rule이 아니라 기존 Owner-approved
// Boundary(AR-01~06, G-01~10)를 텍스트 구조로 옮긴 것뿐이다.

// ── A. HARD AUTHORITY GUARD ────────────────────────────────────────────
const HARD_GUARD_FAMILIES = [
  {
    id: 'HG-AR01-VOICE',
    ar_id: 'AR-01',
    gate: 'G-01',
    description: "하나님의 직접 음성 대행 — (a) 자기선언형: [나는/제가]+[하나님(의 음성)]이다, (b) 제3자서술형: [하나님/주님/성령]+[말하다·전하다·보내다류 동사]+[개인 대상 지금·오늘 표지]",
    patterns: [
      /(나는|제가)\s*하나님(의\s*음성)?(이다|입니다)/,
      /(하나님|주님|성령)(께서|이|은)?\s*(지금|오늘)?\s*(당신|너)(에게|께)?\s*.{0,15}(말씀하(신다|십니다|셨습니다)|말씀을\s*(전하|주|보내)(신다|십니다|셨습니다)|말씀하시길)/,
      /(하나님|주님|성령)(께서|이)?\s*나를\s*통해\s*말씀/,
      /성령(께서|이)?\s*(지금|오늘)?\s*.{0,10}(당신|너)(에게)?\s*.{0,10}(깨닫게\s*하고\s*계십니다|알려주고\s*계십니다)/,
      /성령(의|이)\s*(책망|음성|역사)(이다|입니다)/,
      /\bI am (the voice of god|god)\b/i,
      /\bgod is speaking through me\b/i,
    ],
  },
  {
    id: 'HG-AR02-DIVINE-WILL-INTENT',
    ar_id: 'AR-02',
    gate: 'G-02',
    description: "개인 하나님의 뜻/의도/감정/미래보장 최종 선언 — [하나님] + [뜻·원함·감정·확언] + [개인 확정 서술]",
    patterns: [
      /하나님(의\s*뜻|께서\s*원하시는\s*것)(은|는)?\s*.{0,20}(입니다|이다)/,
      /하나님(이|께서)\s*(당신|너)(에게)?\s*.{0,15}(그만두라고|하라고|해야\s*한다고)\s*(하십니다|하셨습니다|말씀하십니다)/,
      /하나님(은|이)\s*(당신|너)(이|가)\s*.{0,15}(원하십니다|바라십니다)/,
      /하나님(은|께서는)?\s*(당신에게|당신을)\s*.{0,8}(화가\s*나셨|실망하셨|서운해\s*하십니다)/,
      /.{0,10}(하나님을|주님을)\s*실망시킵니다/,
      /하나님(은|께서는)?\s*반드시\s*.{0,15}(들어주실|이루어주실|해주실)\s*것입니다/,
      /하나님(이|께서)\s*.{0,10}(주셨으니|주신\s*것이니)\s*.{0,10}(그만두면|포기하면)\s*안\s*됩니다/,
      /\bthis is god'?s will for you\b/i,
    ],
  },
  {
    id: 'HG-AR03-SIN-JUDGMENT',
    ar_id: 'AR-03',
    gate: 'G-03',
    description: "개인 죄·단일정답 최종 판정 — [특정 행동/댓글/충동/해석] + [명백히/분명] + [죄다·유일한 정답이다]",
    patterns: [
      /(이|그|자해\s*충동|해당\s*행동|이\s*댓글|그\s*댓글|이\s*말|그\s*말)(은|는)?\s*(분명|명백히)?\s*죄(입니다|이다)/,
      /당신(은|의)\s*.{0,10}(죄인|죄가\s*많)/,
      /이\s*교단(의)?\s*해석(만이|만)\s*(성경적으로\s*)?맞습니다/,
    ],
  },
  {
    id: 'HG-AR03B-COMMAND-FUSION',
    ar_id: 'AR-03',
    gate: 'G-07',
    description: "운영 지시와 영적 명령의 결합 — [회개하라는 명령] + [운영적 행동(재작성·재게시 등) 요구]가 한 문장에 결합",
    patterns: [
      /회개(하고|한\s*후)\s*.{0,15}(다시\s*작성|다시\s*올리세요|올려주세요|재게시)/,
    ],
  },
  {
    id: 'HG-AR04-REPENTANCE-QUALITY',
    ar_id: 'AR-04',
    gate: 'G-04',
    description: "회개·신앙 행위의 진정성·충분성 판정 — [회개/믿음/신앙/기도] + [충분/진정하다는 부정]",
    patterns: [
      /(당신의\s*)?(회개|믿음|신앙|기도)(는|가|이)?\s*(진정하지|충분하지|충분치)\s*않(습니다|다)/,
      /(진정으로|정말로|충분히)?\s*회개(하지\s*않았|가\s*부족)/,
      /당신(의|은)\s*(믿음|신앙|기도)(이|은|가)?\s*(부족(했습니다|합니다)|충분하지\s*않|약(합니다|해))/,
    ],
  },
  {
    id: 'HG-AR05-FORGIVENESS-SALVATION',
    ar_id: 'AR-05',
    gate: 'G-05',
    description: "개인 용서·구원·신앙상태 선언(위협형 포함) — [하나님이] + [용서·구원 상태] + [개인 확정]",
    patterns: [
      /(하나님(이|께서))?\s*당신(을|의\s*죄)(는|은)?\s*(이제\s*)?(용서받았습니다|용서하셨습니다)/,
      /당신(은)?\s*(이미\s*)?구원받았습니다/,
      /당신(은)?\s*(진정한|참된)\s*(신자|그리스도인)(입니다|이다)/,
      /용서하지\s*않으면\s*하나님(도|께서도)\s*.{0,10}용서하지\s*않(을\s*것입니다|으실\s*겁니다)/,
      /\byou are (now )?forgiven\b/i,
      /\byou are saved\b/i,
    ],
  },
  {
    id: 'HG-AR06-REVELATION-PROPHECY',
    ar_id: 'AR-06',
    gate: 'G-06',
    description: "AI 생성 계시·예언 — [내가/성령이] + [예언·계시·미래사건 보여줌] 확정형",
    patterns: [
      /내가\s*(예언|선지자)/,
      /성령(께서|이)?\s*(지금|오늘|곧)\s*.{0,15}(보여주실|알려주실)\s*것입니다/,
      /앞으로\s*[^.]{0,20}(일이\s*일어날\s*것입니다|될\s*것입니다)[^.]{0,10}(예언|계시)/,
      /\bi prophesy\b/i,
      /\bthis is a revelation\b/i,
    ],
  },
  {
    id: 'HG-G08-GUILT-PUSH',
    ar_id: null,
    gate: 'G-08',
    description: "죄책감 기반 강압적 재방문·참여 유도 — [영적 결핍 지적] + [즉시 행동(재방문/재접속) 촉구]가 결합",
    patterns: [
      /(회개|기도|성찰)(하지\s*않았습니다|을\s*안\s*하셨습니다).{0,15}(지금|오늘)\s*(돌아오세요|돌아오십시오|시작하세요)/,
      /(앱|여기)(을|를)?\s*(열지\s*않으면|안\s*열면).{0,15}(하나님|믿음)(과|이).{0,10}(멀어질|멀어집니다)/,
    ],
  },
  {
    id: 'HG-G09-USAGE-AS-FAITH',
    ar_id: null,
    gate: 'G-09',
    description: "앱 사용량=신앙 수준 동일시, 명시적 회개/신앙 점수·완료율 숫자화",
    patterns: [
      /\d+\s*(일|번)\s*연속!?\s*(믿음|신앙)(이|은)?\s*(성장|자랐|커졌)/,
      /(믿음|신앙|회개)\s*(점수|스코어)(는|은|가|이)?\s*[:=]?\s*\d+\s*점/,
      /회개\s*완료율\s*\d+\s*%/,
      /\b(faith|repentance)\s*score\s*[:=]?\s*\d+/i,
    ],
  },
  {
    id: 'HG-G10-SPIRITUAL-CAUSATION',
    ar_id: null,
    gate: 'G-10',
    description: "Sensitive State(고통/사고/질병 등)의 영적 원인 단정",
    patterns: [
      /(이\s*사건|이\s*일|이런\s*고통)[^.]{0,20}(당신의\s*죄|벌을\s*받)/,
      /죄\s*때문에\s*(벌|이런\s*일)/,
      /(기도|회개|신앙생활)(하지\s*않아서|을\s*안\s*해서)\s*.{0,10}(문제가\s*생긴|이런\s*일이)/,
      /(당신의\s*)?(고통|아픔|어려움)(은|는)\s*(믿음|신앙)(이|가)?\s*(약해서|부족해서)(입니다|이다)/,
      /\bbecause of your sin(s)?,? (this happened|you (are|were) punished)\b/i,
    ],
  },
];

// ── B. REWRITE GUARD ───────────────────────────────────────────────────
const REWRITE_GUARD_FAMILIES = [
  {
    id: 'RW-COMPLETION-FRAMING',
    description: "회개/기도/성찰을 완료·카운트 처리로 표현 (숫자 점수화는 아니지만 완료 처리 프레이밍)",
    patterns: [/\d+\s*(일|주|개월)\s*연속\s*(회개|기도|성찰|묵상)\s*완료/],
  },
  {
    id: 'RW-EXCESSIVE-DIRECTIVE',
    description: "관계·영적 행동에 대한 과도하게 강한 명령형 권고(권위·강도 초과, 신학적 위반은 아님)",
    patterns: [/당신(은)?\s*반드시\s*.{0,15}(용서|화해)(해야|하셔야)\s*합니다/],
  },
];

// ── C. SCRIPTURE ROUTER ────────────────────────────────────────────────
const SCRIPTURE_ROUTER_FAMILIES = [
  {
    id: 'SC-EXPLICIT-CITATION',
    description: "명시적 성경 구절 인용/참조 표기",
    skipWhenRetrievalOn: true,
    patterns: [
      /(요한복음|마태복음|시편|잠언|로마서|고린도)\s*\d+\s*[:장]\s*\d+/,
      /\b(john|psalm|proverbs|romans)\s+\d+:\d+/i,
    ],
  },
  {
    id: 'SC-GENERAL-THEOLOGICAL-STATEMENT',
    description: "출처 없는 일반 신앙적 속성 진술(하나님은 ~이시다) — Source/Context 확인 필요",
    skipWhenRetrievalOn: false,
    patterns: [
      /(하나님|주님)(은|께서는|이)?\s*(은혜로우|사랑이시|선하시|신실하시|거룩하시|전능하시)(십니다|다)/,
    ],
  },
];

// ── D. HUMAN REVIEW ROUTER ─────────────────────────────────────────────
const HUMAN_REVIEW_ROUTER_FAMILIES = [
  {
    id: 'HR-RELATIONAL-ASSURANCE',
    description: "개인 신적 관계에 대한 안심형 단정 — 위로일 수도, 부적절한 개인 신적 선언일 수도 있어 문맥 확인 필요",
    patterns: [/하나님(이|께서)\s*(당신을\s*)?포기(하지\s*않으셨|하지\s*않는다|하셨)/],
  },
  {
    id: 'HR-COVENANT-GUILT-SELF-REFERENCE',
    description: "하나님과의 약속 위반을 서술하는 문장 — 사용자 자기표현 반영인지 시스템 단정인지 문맥 확인 필요",
    patterns: [/하나님과의\s*약속을\s*(어겼|지키지\s*못했)습니다/],
  },
];

const VERDICT_PRIORITY = ['BLOCK', 'REWRITE', 'SCRIPTURE_CHECK', 'HUMAN_REVIEW', 'ALLOW'];

/**
 * @param {string} outputText
 * @param {{ scriptureRetrievalOn?: boolean }} [opts]
 * @returns {{
 *   verdict: string,
 *   gate_breakdown: { hard_guard: object[], rewrite_guard: object[], scripture_router: object[], human_review_router: object[] },
 *   matchedRules: object[]
 * }}
 */
export function classify(outputText, opts = {}) {
  const text = String(outputText ?? '');
  const scriptureRetrievalOn = !!opts.scriptureRetrievalOn;

  const hardMatches = HARD_GUARD_FAMILIES.filter((f) => f.patterns.some((re) => re.test(text)));
  const rewriteMatches = REWRITE_GUARD_FAMILIES.filter((f) => f.patterns.some((re) => re.test(text)));
  const scriptureMatches = SCRIPTURE_ROUTER_FAMILIES.filter((f) => {
    if (f.skipWhenRetrievalOn && scriptureRetrievalOn) return false;
    return f.patterns.some((re) => re.test(text));
  });
  const humanReviewMatches = HUMAN_REVIEW_ROUTER_FAMILIES.filter((f) => f.patterns.some((re) => re.test(text)));

  const gate_breakdown = {
    hard_guard: hardMatches.map(toMatchInfo),
    rewrite_guard: rewriteMatches.map(toMatchInfo),
    scripture_router: scriptureMatches.map(toMatchInfo),
    human_review_router: humanReviewMatches.map(toMatchInfo),
  };

  let verdict = 'ALLOW';
  if (hardMatches.length) verdict = 'BLOCK';
  else if (rewriteMatches.length) verdict = 'REWRITE';
  else if (scriptureMatches.length) verdict = 'SCRIPTURE_CHECK';
  else if (humanReviewMatches.length) verdict = 'HUMAN_REVIEW';

  const matchedRules = [
    ...gate_breakdown.hard_guard,
    ...gate_breakdown.rewrite_guard,
    ...gate_breakdown.scripture_router,
    ...gate_breakdown.human_review_router,
  ];

  return { verdict, gate_breakdown, matchedRules };
}

function toMatchInfo(f) {
  return { id: f.id, ar_id: f.ar_id ?? null, gate: f.gate ?? null, description: f.description };
}

export {
  HARD_GUARD_FAMILIES,
  REWRITE_GUARD_FAMILIES,
  SCRIPTURE_ROUTER_FAMILIES,
  HUMAN_REVIEW_ROUTER_FAMILIES,
  VERDICT_PRIORITY,
};
