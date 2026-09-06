import { LoopMark } from '@/components/brand/loop-mark'
import { Button, ButtonLink } from '@/components/ui/control'
import { ENTRY_SAFETY_NOTE, PRIMARY_BRAND_COPY, SOCIAL_LOGIN_LABELS } from '@/domain/copy'
import { publicEnv } from '@/lib/env'
import { featureFlags } from '@/lib/env.server'

/**
 * Entry / Login.
 *
 * Brand copy is Owner Final Decision (2026-09-06) and comes from
 * src/domain/copy.ts — see PRIMARY_BRAND_COPY. Structure, in order:
 *   RETURN → 다시 하나님께. → 하나님과 함께한 삶의 순간을 기록합니다.
 *   → Google → Naver → privacy note
 *
 * Canonical social login is Google and Naver only (docs/00, AC-07). There is no
 * email/password path, because Canonical does not define one.
 *
 * Design Guide v1.0 is FINAL LOCK: this screen changes text hierarchy only —
 * no layout, colour, Loop Mark, card, or hero-treatment change.
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
        <h1 className="text-brand mt-8 font-semibold text-accent">
          {PRIMARY_BRAND_COPY.wordmark}
        </h1>
        <p className="text-hero mt-3 font-semibold text-ink">{PRIMARY_BRAND_COPY.headline}</p>
        {/* Owner request: subline +2pt. 12px -> 14px using the existing approved
            token (--text-value, 14/19). No new size value is introduced. */}
        <p className="text-value mt-3 text-ink-muted">{PRIMARY_BRAND_COPY.subline}</p>
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
            <ButtonLink href={`/auth/google/start${nextParam}`}>
              {SOCIAL_LOGIN_LABELS.google}
            </ButtonLink>

            {/* Canonical lists both providers, so both CTAs are always present.
                Until NAVER_CLIENT_ID / NAVER_CLIENT_SECRET are registered the
                Naver CTA uses the disabled state rather than linking to a route
                that can only bounce back with an error. */}
            {featureFlags.naverLogin ? (
              <ButtonLink href={`/auth/naver/start${nextParam}`} variant="quiet">
                {SOCIAL_LOGIN_LABELS.naver}
              </ButtonLink>
            ) : (
              <>
                <Button variant="quiet" disabled>
                  {SOCIAL_LOGIN_LABELS.naver}
                </Button>
                <p className="text-caption -mt-1 text-center text-ink-muted">
                  네이버 로그인은 준비 중이에요.
                </p>
              </>
            )}
          </div>
        )}

        {/* Safety copy uses ink-muted rather than ink-faint: at 11px on the
            canvas, ink-faint measures ~2.2:1 contrast. See the Visual Delta
            note in the implementation report. */}
        <p className="text-caption mt-6 text-center leading-[17px] text-ink-muted">
          {ENTRY_SAFETY_NOTE[0]}
          <br />
          {ENTRY_SAFETY_NOTE[1]}
        </p>
      </div>
    </main>
  )
}
