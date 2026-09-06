import { LoopMark } from '@/components/brand/loop-mark'

/**
 * Offline fallback, served by the Service Worker when a navigation fails.
 *
 * Calm and factual: a lost connection is a network condition, never given
 * spiritual meaning. Nothing the member wrote is stored here — offline write
 * is HOLD, so this screen makes no promise to save anything.
 *
 * Static on purpose: it must render with no session and no data.
 */
export const dynamic = 'force-static'

export const metadata = { title: '연결 확인' }

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-title-gutter text-center">
      <LoopMark width={72} />
      <p className="text-section mt-8 font-semibold text-ink">인터넷 연결을 확인해 주세요.</p>
      <p className="text-body-sm mt-3 leading-[19px] text-ink-muted">
        연결되면 다시 이어갈 수 있습니다.
      </p>
    </main>
  )
}
