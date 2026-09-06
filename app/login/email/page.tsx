import Link from 'next/link'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextField } from '@/components/ui/control'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { authErrorMessage } from '@/lib/auth/errors'
import { signInWithEmail, signUpWithEmail } from './actions'

export const dynamic = 'force-dynamic'

/**
 * Email sign-in / sign-up.
 *
 * The Entry screen keeps a single [이메일로 시작하기] CTA; the full form lives
 * here so the first screen stays quiet (Owner directive §5). 로그인 and 회원가입
 * are separate modes rather than one combined form.
 *
 * Design Guide v1.0 is FINAL LOCK — this screen is built from existing tokens
 * and components only.
 */
export default async function EmailAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string; next?: string }>
}) {
  const { mode: modeParam, error, next } = await searchParams
  const mode = modeParam === 'signup' ? 'signup' : 'signin'
  const nextValue = next && next.startsWith('/') ? next : ''
  const nextQuery = nextValue ? `&next=${encodeURIComponent(nextValue)}` : ''
  const message = authErrorMessage(error)

  return (
    <main className="min-h-dvh">
      <PageHeader title="이메일로 시작하기" backHref="/login" />

      <div className="px-title-gutter pt-2">
        <SegmentedLinks
          active={mode}
          options={[
            { value: 'signin', label: '로그인', href: `/login/email?mode=signin${nextQuery}` },
            { value: 'signup', label: '회원가입', href: `/login/email?mode=signup${nextQuery}` },
          ]}
        />
      </div>

      {message ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-5 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          {message}
        </p>
      ) : null}

      {mode === 'signup' ? (
        <form action={signUpWithEmail} className="px-title-gutter pt-6">
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="password_confirm">비밀번호 확인</FieldLabel>
              <TextField
                id="password_confirm"
                name="password_confirm"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="mt-7">
            <Button type="submit">가입하기</Button>
          </div>

          <p className="text-caption mt-4 text-center leading-[17px] text-ink-muted">
            가입하시면 인증 메일을 보내드립니다. 인증 후 로그인할 수 있어요.
          </p>
        </form>
      ) : (
        <form action={signInWithEmail} className="px-title-gutter pt-6">
          <input type="hidden" name="next" value={nextValue} />

          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="mt-7">
            <Button type="submit">로그인</Button>
          </div>

          <p className="mt-4 text-center">
            <Link href="/login/email/forgot" className="text-body-sm font-medium text-ink-muted">
              비밀번호를 잊으셨나요?
            </Link>
          </p>
        </form>
      )}

      <p className="text-caption mt-8 px-title-gutter pb-10 text-center leading-[17px] text-ink-muted">
        기도와 회개 기록은 기본적으로 나만 볼 수 있습니다.
      </p>
    </main>
  )
}
