import type { ReactNode } from 'react'
import { ButtonLink } from './control'

/**
 * [OPEN — NO FIGMA SOURCE]
 * The Figma file has no Empty / Error / Loading frame. These surfaces are built
 * only from verified tokens and are reported to the Owner as OPEN.
 *
 * Copy rules that are NOT open — they come from Canonical docs/03:
 *   Empty  : 기록 없음 안내 + 첫 기록 유도 / 공개 강요 없는 안내 /
 *            회개는 "판단 없는 시작 안내"
 *   Error  : 재시도. 기존 기록 손실 표현 금지. Draft 보존 우선.
 * No empty or error state may imply spiritual failure or apply pressure.
 */

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="mx-gutter rounded-card bg-surface px-6 py-10 text-center">
      <p className="text-value font-semibold text-ink">{title}</p>
      {description ? (
        <p className="text-body-sm mt-2 leading-[22px] text-ink-muted">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <div className="mt-5">
          <ButtonLink href={actionHref} variant="secondary">
            {actionLabel}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Error surface. Never says or implies that saved records were lost — docs/03
 * "기존 기록 손실 표현 금지".
 */
export function ErrorState({
  title = '잠시 불러오지 못했어요',
  description = '기록은 그대로 있습니다. 잠시 후 다시 시도해 주세요.',
  children,
}: {
  title?: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="mx-gutter rounded-card bg-danger-tint px-6 py-8 text-center">
      <p className="text-value font-semibold text-danger">{title}</p>
      <p className="text-body-sm mt-2 leading-[22px] text-ink-muted">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-row bg-line ${className}`} />
}

/** Loading placeholder shaped like the 62px InfoRow so layout does not jump. */
export function LoadingRows({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-row-gap px-gutter">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-row" />
      ))}
    </div>
  )
}
