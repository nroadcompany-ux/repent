import { ButtonLink } from '@/components/ui/control'

export default function AppNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-title-gutter">
      <div className="w-full rounded-card bg-surface px-6 py-10 text-center">
        <p className="text-value font-semibold text-ink">찾는 기록이 없어요</p>
        <p className="text-body-sm mt-2 leading-[22px] text-ink-muted">
          이미 지웠거나, 주소가 바뀐 것 같아요.
        </p>
        <div className="mt-6">
          <ButtonLink href="/journey" variant="secondary">
            여정으로 돌아가기
          </ButtonLink>
        </div>
      </div>
    </main>
  )
}
