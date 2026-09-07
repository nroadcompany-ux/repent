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
 * Record row. Figma 155:4 (Journey) and 150:2 (Repentance history) draw the
 * same shape, so it exists once here rather than four times in four screens.
 *
 * It differs from InfoRow in what it puts first. InfoRow leads with an accent
 * label in a fixed 88px column, which suits a fixed set of named slots (나의
 * 말씀, 기도, 약속). A list of records has no such slots: what identifies the
 * row is the member's own words, so the title leads and the date or category
 * sits above it, quiet and small.
 */
export function RecordRow({
  meta,
  title,
  caption,
  href,
  trailing,
}: {
  meta?: ReactNode
  title: ReactNode
  caption?: ReactNode
  href?: string
  trailing?: ReactNode
}) {
  const body = (
    <>
      <span className="min-w-0 flex-1">
        {meta ? <span className="text-caption block truncate text-ink-faint">{meta}</span> : null}
        <span
          className={`text-body-sm block truncate font-semibold text-ink ${meta ? 'mt-[2px]' : ''}`}
        >
          {title}
        </span>
        {caption ? (
          <span className="text-caption mt-[2px] block truncate text-ink-muted">{caption}</span>
        ) : null}
      </span>
      {href ? (
        (trailing ?? (
          <span aria-hidden="true" className="text-chevron shrink-0 text-ink-faint">
            ›
          </span>
        ))
      ) : (
        trailing
      )}
    </>
  )

  const shell = 'flex items-center gap-3 px-4 py-3'

  return (
    <li className="rounded-row bg-surface">
      {href ? (
        <Link href={href} className={shell}>
          {body}
        </Link>
      ) : (
        <div className={shell}>{body}</div>
      )}
    </li>
  )
}

/** Vertical stack of RecordRows. Figma 155:4→155:9 sit 4 apart. */
export function RecordList({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-1 px-gutter">{children}</ul>
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
