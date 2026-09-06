'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/control'

/**
 * Route error boundary.
 *
 * docs/03: "로딩 실패 시 재시도, 기존 기록 손실 표현 금지" and "Draft 보존 우선".
 * This screen therefore offers a retry and states plainly that saved records
 * are intact. The underlying error message is never rendered — a failed query
 * can carry prayer or repentance text, and that must not reach the screen or a
 * log line.
 */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the fact, never the payload.
    console.error('[app] route error boundary')
  }, [])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-title-gutter">
      <div className="w-full rounded-card bg-surface px-6 py-10 text-center">
        <p className="text-value font-semibold text-ink">잠시 불러오지 못했어요</p>
        <p className="text-body-sm mt-2 leading-[19px] text-ink-muted">
          기록은 그대로 있습니다. 다시 시도해 주세요.
        </p>
        <div className="mt-6">
          <Button onClick={reset}>다시 시도</Button>
        </div>
      </div>
    </main>
  )
}
