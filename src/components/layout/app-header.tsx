import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * App header. Figma 3:3 / 3:4 / 3:5.
 *   wordmark 22/28 semibold accent at gutter 24, top 24
 *   right actions 13/18 medium muted, right inset 24, 12px apart
 */
export function AppHeader({
  title = 'RETURN',
  actions,
  sticky = false,
}: {
  title?: string
  actions?: ReactNode
  /** Keep the primary app bar visible while the page body scrolls. */
  sticky?: boolean
}) {
  return (
    <header
      className={`flex items-center justify-between px-title-gutter pt-6 pb-2 ${
        sticky
          ? 'sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur'
          : ''
      }`}
    >
      <Link href="/journey" className="text-brand font-semibold text-accent">
        {title}
      </Link>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  )
}

export function HeaderAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-body font-medium text-ink-muted">
      {children}
    </Link>
  )
}

/** Sub-page header: back affordance + page title, same metrics as AppHeader. */
export function PageHeader({
  title,
  backHref,
  actions,
}: {
  title: string
  backHref: string
  actions?: ReactNode
}) {
  return (
    <header className="flex items-center gap-3 px-title-gutter pt-6 pb-2">
      <Link
        href={backHref}
        aria-label="뒤로"
        className="text-chevron -ml-1 w-6 shrink-0 text-ink-faint"
      >
        ‹
      </Link>
      <h1 className="text-section min-w-0 flex-1 truncate font-semibold text-ink">{title}</h1>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  )
}
