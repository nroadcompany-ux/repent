import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextField } from '@/components/ui/control'
import { authErrorMessage } from '@/lib/auth/errors'
import { getUser } from '@/lib/supabase/server'
import { updatePassword } from '../login/email/actions'

export const dynamic = 'force-dynamic'

/**
 * Set a new password. Reached from the recovery link, which /auth/confirm turns
 * into a short-lived session. Sits outside the (app) group so it does not run
 * the onboarding gate.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const user = await getUser()

  if (!user) redirect('/login/email/forgot?error=reset_link_invalid')

  const message = authErrorMessage(error)

  return (
    <main className="min-h-dvh">
      <PageHeader title="새 비밀번호" backHref="/login/email?mode=signin" />

      {message ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
        >
          {message}
        </p>
      ) : null}

      <form action={updatePassword} className="px-title-gutter pt-4">
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="password">새 비밀번호</FieldLabel>
            <TextField
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="password_confirm">새 비밀번호 확인</FieldLabel>
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
          <Button type="submit">비밀번호 변경</Button>
        </div>
      </form>
    </main>
  )
}
