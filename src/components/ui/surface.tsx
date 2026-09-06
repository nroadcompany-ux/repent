import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Surfaces reproduced from Figma MRh882Jk04Htb17cXyccGg node 3:2.
 * Every dimension here is a measured Figma value; screens must not restate them.
 */

/** Graph/content card. Figma 3:38 — white, 350x?, radius 22, inset 20. */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`mx-gutter rounded-card bg-surface ${className}`}>{children}</div>
}

/**
 * Compressed information row. Figma 3:15–3:19.
 *   white · h 62 · radius 18 · pl 16 · label column 88 · value column at 112 ·
 *   chevron right inset 14, top 19
 * The Design Notes call this out explicitly: "카드 → 압축형 정보 행".
 */
export function InfoRow({
  label,
  value,
  caption,
  href,
  onClick,
  trailing,
}: {
  label: string
  value: ReactNode
  caption?: ReactNode
  href?: string
  onClick?: () => void
  trailing?: ReactNode
}) {
  const body = (
    <>
      <span className="text-caption w-[88px] shrink-0 pt-[3px] font-medium text-accent">
        {label}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-value block truncate font-semibold text-ink">{value}</span>
        {caption ? (
          <span className="text-caption mt-[2px] block truncate text-ink-muted">{caption}</span>
        ) : null}
      </span>
      <span className="absolute right-[14px] top-[19px] text-ink-faint">
        {trailing ?? <span className="text-chevron">›</span>}
      </span>
    </>
  )

  const shell =
    'relative flex h-[62px] w-full items-start gap-2 rounded-row bg-surface pl-4 pr-[38px] pt-[11px] text-left'

  if (href) {
    return (
      <Link href={href} className={shell}>
        {body}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shell}>
        {body}
      </button>
    )
  }
  return <div className={shell}>{body}</div>
}

/** Vertical stack of InfoRows. Figma gap between rows is 8 (308→378→448→518). */
export function RowStack({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-row-gap px-gutter">{children}</div>
  )
}

/**
 * Section heading. Figma 3:12/3:13/3:14 and 3:35/3:36/3:37.
 *   title 18/24 semibold · subtitle 12/17 muted 26px below the title top ·
 *   optional right-aligned action 12/16 medium accent · gutter 24
 */
export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="flex items-start justify-between px-title-gutter">
      <div>
        <h2 className="text-section font-semibold text-ink">{title}</h2>
        {subtitle ? <p className="text-body-sm mt-[2px] text-ink-muted">{subtitle}</p> : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="text-body-sm mt-[6px] shrink-0 font-medium text-accent"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
