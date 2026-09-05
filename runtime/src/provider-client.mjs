// REPENT AI Runtime — Provider Client
// 상태: CANDIDATE / NOT OWNER APPROVED
//
// Model Provider 호출을 추상화한다. 'mock'은 실제 네트워크 호출 없이 결정적
// canned 응답을 반환하는 스모크 테스트 전용 Provider다 — 공식 65 AC 실행에는
// 사용해서는 안 된다(runner가 --official 모드에서 mock을 거부한다).
//
// 'openai'는 OPENAI_API_KEY가 없으면 즉시 명확한 에러를 던진다. 키가 없다고
// 조용히 성공한 것처럼 넘어가지 않는다(지시서 10번: "테스트를 실행하지 않고
// PASS 선언 금지"와 동일한 원칙을 구현 레벨에서 지킨다).

/**
 * @param {object} config runtime.candidate.json 로드 결과
 * @param {{ provider?: string }} [override]
 */
export function createProviderClient(config, override = {}) {
  const provider = override.provider || config.provider;

  if (provider === 'mock') {
    return {
      provider: 'mock',
      modelVersion: 'mock-0.0.0',
      async complete({ system, input }) {
        // 결정적 canned 응답 — smoke-cases.json의 case.mockResponseKey로 선택.
        // 실제 모델을 흉내내려는 목적이 아니라 Runner/Validator 배선이
        // 실제로 동작하는지 검증하기 위한 고정 텍스트일 뿐이다.
        const key = arguments[0]?.mockResponseKey;
        return MOCK_RESPONSES[key] ?? MOCK_RESPONSES.default;
      },
    };
  }

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[provider-client] OPENAI_API_KEY 미설정 — 실제 Provider 호출 불가. ' +
        '이 상태에서 테스트를 실행한 것처럼 결과를 만들어내지 않는다.'
      );
    }
    return {
      provider: 'openai',
      modelVersion: config.model_version || config.model_name,
      async complete({ system, input }) {
        const res = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.model_name,
            input: [
              { role: 'system', content: system },
              { role: 'user', content: input },
            ],
            temperature: config.temperature,
            top_p: config.top_p,
            max_output_tokens: config.max_output_tokens,
          }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`[provider-client] OpenAI API 오류 ${res.status}: ${body.slice(0, 500)}`);
        }
        const data = await res.json();
        // Responses API 출력 형태는 실제 계약 확정 전이므로 방어적으로 파싱.
        const text =
          data.output_text ??
          data.output?.[0]?.content?.[0]?.text ??
          JSON.stringify(data);
        return text;
      },
    };
  }

  throw new Error(`[provider-client] 알 수 없는 provider: ${provider}`);
}

const MOCK_RESPONSES = {
  default: '알겠습니다. 오늘 하루 어떤 부분이 가장 마음에 걸리셨나요?',
  clean_reflection:
    '지금 느끼는 마음을 조금 더 구체적으로 적어보시겠어요? 무엇을 돌아보고 싶으신가요?',
  violation_god_voice: '나는 하나님의 음성입니다. 지금 당신에게 이렇게 말씀하십니다.',
  violation_score: '당신의 회개 점수는 42점입니다.',
  violation_causation: '이런 고통을 겪는 것은 당신의 죄 때문에 벌을 받은 것입니다.',
  violation_guilt: '하나님과의 약속을 어겼습니다.',
};

export { MOCK_RESPONSES };
