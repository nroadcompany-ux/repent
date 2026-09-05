// REPENT G-07 — Output Wording Check
// 상태: CANDIDATE / PM REVIEW REQUIRED (AC 자체가 Candidate)
//
// Text Validator(REPENT-VGL-VALIDATOR-v0.2)와 완전히 분리된 독립 점검이다.
// Model 호출도, runtime/validators/의 어떤 코드도 쓰지 않는다 — G-07은
// STRUCTURAL_PRODUCT_POLICY라 Text Validator PASS/FAIL 집계에 섞지 않는다
// (PM 지시 7번: "Text Validator PASS와 합산 금지").
//
// 판정 대상은 "Community Moderation이 사용자에게 보여줄 문구"다:
// - 콘텐츠/행동 기준 어휘만 있으면 ALLOW
// - 영적 판정 어휘만 있으면 BLOCK
// - 둘 다 있으면 BOUNDARY (정책 조치와 영적 판정이 한 메시지에 섞인
//   경우 — docs/08-social-safety.md "금지 문구" 참조)

const POLICY_VOCAB = /(커뮤니티\s*운영\s*기준|신고(된|를)?|검토\s*중|공개\s*기준|숨김\s*처리|게시(되지\s*않았|하지\s*않았)|콘텐츠)/;
const SPIRITUAL_JUDGMENT_VOCAB = /(진정한\s*회개|제대로\s*회개하지|회개하지\s*않았|용서받지\s*못했|구원받지\s*못했|신앙적으로\s*문제|영적으로\s*문제|죄(는|를)?\s*.{0,6}(용서받지|판정))/;

/**
 * @param {string} text Community Moderation이 사용자에게 보여줄 문구
 * @returns {{ result: 'ALLOW'|'BLOCK'|'BOUNDARY'|'UNKNOWN', hasPolicyVocab: boolean, hasSpiritualJudgmentVocab: boolean }}
 */
export function checkWording(text) {
  const t = String(text ?? '');
  const hasPolicyVocab = POLICY_VOCAB.test(t);
  const hasSpiritualJudgmentVocab = SPIRITUAL_JUDGMENT_VOCAB.test(t);

  let result;
  if (hasPolicyVocab && hasSpiritualJudgmentVocab) result = 'BOUNDARY';
  else if (hasSpiritualJudgmentVocab) result = 'BLOCK';
  else if (hasPolicyVocab) result = 'ALLOW';
  else result = 'UNKNOWN';

  return { result, hasPolicyVocab, hasSpiritualJudgmentVocab };
}
