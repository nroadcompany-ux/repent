import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextField } from '@/components/ui/control'
import { authErrorMessage } from '@/lib/auth/errors'
import { requestPasswordReset } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * Password reset request.
 *
 * The result is the same whether or not the address is registered — telling the
 * member which emails exist would turn this form into an account lookup.
 */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>
}) {
  const { error, sent, email } = await searchParams
  const message = authErrorMessage(error)

  return (
    <main className="min-h-dvh">
      <PageHeader title="비밀번호 재설정" backHref="/login/email?mode=signin" />

      {message ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          {message}
        </p>
      ) : null}

      {sent ? (
        <div className="px-title-gutter pt-4">
          <p className="text-body leading-[22px] text-ink">
            {email ? `${email} 으로` : '입력하신 주소로'} 재설정 메일을 보냈습니다.
            <br />
            메일의 링크에서 새 비밀번호를 정할 수 있어요.
          </p>
          <p className="text-body-sm mt-4 leading-[19px] text-ink-muted">
            메일이 보이지 않으면 스팸함도 확인해 주세요.
          </p>
        </div>
      ) : (
        <form action={requestPasswordReset} className="px-title-gutter pt-4">
          <p className="text-body-sm mb-5 leading-[19px] text-ink-muted">
            가입하신 이메일 주소를 알려주시면 재설정 링크를 보내드립니다.
          </p>
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
          <div className="mt-6">
            <Button type="submit">재설정 메일 받기</Button>
          </div>
        </form>
      )}
    </main>
  )
}
