import { LoopMark } from '@/components/brand/loop-mark'
import { ButtonLink } from '@/components/ui/control'
import { featureFlags, publicEnv } from '@/lib/env'

/**
 * Sign-in. Canonical docs/00 + AC-07: Social Login is 네이버 / 구글 only.
 *
 * [OPEN — NO FIGMA SOURCE] The Figma file has no login screen and no provider
 * button. Rather than invent Naver green / Google white brand buttons, this
 * screen uses RETURN's own tokens and the quiet-premium principle from the
 * Design Notes. Awaiting an Owner-approved login frame.
 */

const ERRORS: Record<string, string> = {
  google: '구글 로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.',
  exchange: '로그인을 마치지 못했어요. 다시 시도해 주세요.',
  session: '로그인 정보를 확인하지 못했어요. 다시 시도해 주세요.',
  missing_code: '로그인이 중간에 취소되었어요.',
  naver_state: '보안 확인에 실패했어요. 처음부터 다시 시도해 주세요.',
  naver_token: '네이버 로그인을 마치지 못했어요. 다시 시도해 주세요.',
  naver_profile: '네이버 프로필을 불러오지 못했어요. 다시 시도해 주세요.',
  naver_email_required: '네이버 로그인 시 이메일 제공에 동의해 주세요.',
  naver_provision: '계정을 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
  naver_session: '로그인 세션을 만들지 못했어요. 다시 시도해 주세요.',
  naver_unconfigured: '네이버 로그인은 아직 준비 중이에요.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const nextParam = next && next.startsWith('/') ? `?next=${encodeURIComponent(next)}` : ''
  const configured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey)

  return (
    <main className="flex min-h-dvh flex-col justify-between px-title-gutter pb-10 pt-24">
      <div>
        <LoopMark width={88} />
        <h1 className="text-brand mt-8 font-semibold text-accent">RETURN</h1>
        <p className="text-hero mt-3 font-semibold text-ink">
          오늘의 기록이
          <br />
          당신의 여정이 됩니다
        </p>
        <p className="text-body-sm mt-3 leading-[18px] text-ink-muted">
          기도와 말씀, 돌아봄과 약속이
          <br />
          시간 속에서 하나의 이야기로 이어집니다.
        </p>
      </div>

      <div>
        {error ? (
          <p
            role="alert"
            className="text-body-sm mb-4 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
          >
            {ERRORS[error] ?? '로그인에 실패했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        {!configured ? (
          <p className="text-body-sm rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger">
            로그인 설정이 아직 완료되지 않았어요. 관리자에게 문의해 주세요.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {featureFlags.naverLogin ? (
              <ButtonLink href={`/auth/naver/start${nextParam}`}>네이버로 시작하기</ButtonLink>
            ) : null}
            <ButtonLink href={`/auth/google/start${nextParam}`} variant="quiet">
              구글로 시작하기
            </ButtonLink>
          </div>
        )}

        <p className="text-caption mt-6 text-center leading-[17px] text-ink-faint">
          기도와 회개 기록은 기본적으로 나만 볼 수 있습니다.
          <br />
          공개는 내가 직접 선택할 때만 이루어집니다.
        </p>
      </div>
    </main>
  )
}
