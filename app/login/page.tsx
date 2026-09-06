import { LoopMark } from '@/components/brand/loop-mark'
import { Button, ButtonLink } from '@/components/ui/control'
import {
  ENTRY_SAFETY_NOTE,
  PRIMARY_BRAND_COPY,
  PROVIDER_PENDING_NOTE,
  SOCIAL_LOGIN_LABELS,
} from '@/domain/copy'
import { authErrorMessage } from '@/lib/auth/errors'
import { getProviderAvailability } from '@/lib/auth/providers'
import { publicEnv } from '@/lib/env'

/**
 * Entry / Login.
 *
 * Brand copy is Owner Final Decision (2026-09-06), from src/domain/copy.ts.
 * Structure: RETURN → 다시 하나님께. → 하나님과 함께한 삶의 순간을 기록합니다.
 *   → Google → Naver → 또는 → 이메일 → privacy note
 *
 * Canonical auth is Google + Naver + Email/Password (Owner decision, AUTH SCOPE
 * ONLY). A provider that cannot complete a login stays VISIBLE and disabled: it
 * must never link out, because Supabase answers a disabled provider with raw
 * JSON on its own domain — a dead end the member cannot get back from.
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
  const pending = [
    providers.google ? null : 'Google',
    providers.naver ? null : '네이버',
  ].filter((label): label is string => label !== null)

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
        {message ? (
          <p
            role="alert"
            className="text-body-sm mb-4 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
          >
            {message}
          </p>
        ) : null}

        {!configured ? (
          <p className="text-body-sm rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger">
            로그인 준비가 완료되면 바로 이용할 수 있습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {providers.google ? (
              <ButtonLink href={`/auth/google/start${nextParam}`}>
                {SOCIAL_LOGIN_LABELS.google}
              </ButtonLink>
            ) : (
              <Button disabled>{SOCIAL_LOGIN_LABELS.google}</Button>
            )}

            {providers.naver ? (
              <ButtonLink href={`/auth/naver/start${nextParam}`} variant="quiet">
                {SOCIAL_LOGIN_LABELS.naver}
              </ButtonLink>
            ) : (
              <Button variant="quiet" disabled>
                {SOCIAL_LOGIN_LABELS.naver}
              </Button>
            )}

            {pending.length > 0 ? (
              <p className="text-caption -mt-1 text-center text-ink-muted">
                {PROVIDER_PENDING_NOTE(pending)}
              </p>
            ) : null}

            <p className="text-caption mt-1 text-center text-ink-faint">또는</p>

            <ButtonLink href={`/login/email?mode=signin${nextQuery}`} variant="secondary">
              {SOCIAL_LOGIN_LABELS.email}
            </ButtonLink>
          </div>
        )}

        {/* Safety copy uses ink-muted rather than ink-faint: at 11px on the
            canvas, ink-faint measures 2.32:1 contrast, below WCAG AA. */}
        <p className="text-caption mt-6 text-center leading-[17px] text-ink-muted">
          {ENTRY_SAFETY_NOTE[0]}
          <br />
          {ENTRY_SAFETY_NOTE[1]}
        </p>
      </div>
    </main>
  )
}
