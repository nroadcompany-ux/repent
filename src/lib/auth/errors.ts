/**
 * Auth error translation.
 *
 * Two audiences, kept apart on purpose (Owner directive §12):
 *   member  — a calm sentence in RETURN's voice, chosen from a fixed set
 *   server  — the technical detail, logged, never sent to the browser
 *
 * A Supabase message, error code, provider payload, stack trace, or SQL text
 * must never reach the client. Routes therefore pass a KEY through the URL and
 * the screen looks the text up here; the original error stays on the server.
 */

export const AUTH_ERROR_MESSAGES = {
  // Email — sign up
  email_invalid: '이메일 주소를 확인해 주세요.',
  password_weak: '비밀번호 조건을 확인해 주세요.',
  password_mismatch: '비밀번호가 서로 다릅니다. 다시 확인해 주세요.',
  email_taken: '이미 가입된 이메일입니다. 로그인해 주세요.',

  // Email — sign in
  email_not_confirmed: '이메일 인증 후 로그인할 수 있습니다.',
  credentials_invalid: '이메일 또는 비밀번호를 다시 확인해 주세요.',

  // Email — reset
  reset_link_invalid: '링크가 만료되었어요. 비밀번호 재설정을 다시 요청해 주세요.',

  // Providers
  google_unconfigured: 'Google 로그인은 준비 중입니다.',
  google: '구글 로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.',
  exchange: '로그인을 마치지 못했어요. 다시 시도해 주세요.',
  naver_unconfigured: '네이버 로그인은 준비 중입니다.',
  naver_email_required: '네이버 로그인 시 이메일 제공에 동의해 주세요.',
  naver_state: '보안 확인에 실패했어요. 처음부터 다시 시도해 주세요.',
  naver_token: '네이버 로그인을 마치지 못했어요. 다시 시도해 주세요.',
  naver_profile: '네이버 프로필을 불러오지 못했어요. 다시 시도해 주세요.',
  naver_provision: '계정을 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
  naver_session: '로그인 세션을 만들지 못했어요. 다시 시도해 주세요.',
  missing_code: '로그인이 중간에 취소되었어요.',

  // Shared
  network: '잠시 연결이 원활하지 않습니다. 다시 시도해 주세요.',
  cancelled: '로그인이 중간에 취소되었어요.',
  session: '로그인 정보를 확인하지 못했어요. 다시 시도해 주세요.',
  unknown: '문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
} as const

export type AuthErrorKey = keyof typeof AUTH_ERROR_MESSAGES

export function authErrorMessage(key: string | undefined): string | null {
  if (!key) return null
  return AUTH_ERROR_MESSAGES[key as AuthErrorKey] ?? AUTH_ERROR_MESSAGES.unknown
}

/**
 * Classify a Supabase auth failure into one of our keys.
 *
 * Matching is on `code` where Supabase provides one and on a narrow set of
 * message substrings otherwise. Anything unrecognised becomes `unknown` — the
 * member sees a calm sentence and the detail goes to the server log only.
 */
export function classifyAuthError(error: {
  code?: string
  status?: number
  message?: string
}): AuthErrorKey {
  const code = error.code ?? ''
  const message = (error.message ?? '').toLowerCase()

  if (code === 'email_address_invalid' || message.includes('invalid email')) return 'email_invalid'
  if (
    code === 'weak_password' ||
    message.includes('password should be') ||
    message.includes('password is too')
  ) {
    return 'password_weak'
  }
  if (code === 'user_already_exists' || message.includes('already registered')) return 'email_taken'
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'email_not_confirmed'
  }
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'credentials_invalid'
  }
  if (code === 'otp_expired' || message.includes('token has expired') || message.includes('invalid token')) {
    return 'reset_link_invalid'
  }
  if (error.status === 429 || code === 'over_request_rate_limit') return 'network'

  return 'unknown'
}

/**
 * Log the technical detail server-side without ever writing a member's
 * credentials or a token into the log line.
 */
export function logAuthFailure(where: string, error: { code?: string; status?: number }) {
  console.error(`[auth] ${where} failed`, { code: error.code, status: error.status })
}
