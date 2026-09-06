import { LoopMark } from '@/components/brand/loop-mark'
import { Button, ButtonLink } from '@/components/ui/control'
import {
  PRIMARY_BRAND_COPY,
  SOCIAL_LOGIN_LABELS,
  STUDIO_FOOTER,
  providerLabel,
} from '@/domain/copy'
import { authErrorMessage } from '@/lib/auth/errors'
import { getProviderAvailability } from '@/lib/auth/providers'
import { publicEnv } from '@/lib/env'

/**
 * Entry / Login.
 *
 * Owner information structure (2026-09-06):
 *   Loop Mark → RETURN → 다시 하나님께. → 하나님과 함께한 삶의 순간을 기록합니다.
 *   → Google → Naver → 또는 → 이메일 → NROAD footer
 *
 * The screen carries brand, meaning, and entry only. Feature privacy notes live
 * on the screens where those features are used, not here.
 *
 * A provider that cannot complete a login stays VISIBLE, disabled, and says
 * "(준비중)" on the button — never a separate helper paragraph, and never a
 * link out, because Supabase answers a disabled provider with raw JSON on its
 * own domain.
 *
 * Design Guide v1.0 is FINAL LOCK: existing tokens and components only.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const nextParam = next && next.startsWith('/') ? `?next=${encodeURIComponent(next)}` : ''
  const nextQuery = next && next.startsWith('/') ? `&next=${encodeURIComponent(next)}` : ''
  const configured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey)
  const message = authErrorMessage(error)

  const providers = await getProviderAvailability()

  return (
    <main className="flex min-h-dvh flex-col px-title-gutter pb-8 pt-24">
      <div>
        <LoopMark width={88} />
        <h1 className="text-brand mt-8 font-semibold text-accent">
          {PRIMARY_BRAND_COPY.wordmark}
        </h1>
        <p className="text-hero mt-3 font-semibold text-ink">{PRIMARY_BRAND_COPY.headline}</p>
        <p className="text-value mt-3 text-ink-muted">{PRIMARY_BRAND_COPY.subline}</p>
      </div>

      {/* mt-auto keeps the CTAs low without pinning them, so the footer can sit
          at the end of the content flow rather than being fixed to the bottom. */}
      <div className="mt-auto pt-10">
        {message ? (
          <p
            role="alert"
            className="text-body-sm mb-4 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
          >
            {message}
          </p>
        ) : null}

        {!configured ? (
          <p className="text-body-sm rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger">
            로그인 준비가 완료되면 바로 이용할 수 있습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {providers.google ? (
              <ButtonLink href={`/auth/google/start${nextParam}`}>
                {SOCIAL_LOGIN_LABELS.google}
              </ButtonLink>
            ) : (
              <Button disabled>{providerLabel(SOCIAL_LOGIN_LABELS.google, false)}</Button>
            )}

            {providers.naver ? (
              <ButtonLink href={`/auth/naver/start${nextParam}`} variant="quiet">
                {SOCIAL_LOGIN_LABELS.naver}
              </ButtonLink>
            ) : (
              <Button variant="quiet" disabled>
                {providerLabel(SOCIAL_LOGIN_LABELS.naver, false)}
              </Button>
            )}

            <p className="text-caption mt-1 text-center text-ink-faint">또는</p>

            <ButtonLink href={`/login/email?mode=signin${nextQuery}`} variant="secondary">
              {SOCIAL_LOGIN_LABELS.email}
            </ButtonLink>
          </div>
        )}
      </div>

      {/* Studio signature. Text wordmark: no NROAD logo asset exists and
          designing one is forbidden. No border, no card, lowest visual weight. */}
      <footer className="mt-10 text-center">
        <p className="text-caption font-semibold tracking-[0.14em] text-ink-muted">
          {STUDIO_FOOTER.wordmark}
        </p>
        <p className="text-caption mt-[3px] text-ink-muted">{STUDIO_FOOTER.line}</p>
        <p className="text-caption mt-[1px] text-ink-muted">{STUDIO_FOOTER.since}</p>
      </footer>
    </main>
  )
}
