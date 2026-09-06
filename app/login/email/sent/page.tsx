import { PageHeader } from '@/components/layout/app-header'
import { ButtonLink } from '@/components/ui/control'

/** Shown after sign-up. Supabase has email confirmation on, so a link is sent. */
export default async function VerificationSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <main className="min-h-dvh">
      <PageHeader title="인증 메일을 보냈어요" backHref="/login/email?mode=signin" />

      <div className="px-title-gutter pt-4">
        <p className="text-body leading-[25px] text-ink">
          {email ? `${email} 으로` : '가입하신 주소로'} 인증 메일을 보냈습니다.
          <br />
          메일의 링크를 열면 로그인할 수 있어요.
        </p>
        <p className="text-body-sm mt-4 leading-[22px] text-ink-muted">
          메일이 보이지 않으면 스팸함도 확인해 주세요.
        </p>

        <div className="mt-8">
          <ButtonLink href="/login/email?mode=signin">로그인 화면으로</ButtonLink>
        </div>
      </div>
    </main>
  )
}
