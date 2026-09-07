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
      style={sticky ? { paddingTop: 'max(1.5rem, env(safe-area-inset-top))' } : undefined}
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

/**
 * Icon action. Figma 118:4–118:8 draw the two the header carries: a magnifier
 * (circle d15 with a 5px handle) and three 18px rules 6 apart, both in a 24px
 * box, 12 apart, right inset 24.
 *
 * The label is required and never rendered — an icon-only control still has to
 * say what it is. The hamburger in particular was a bare ☰ character, whose
 * spoken name in most screen readers is "trigram for heaven".
 */
export function HeaderIconAction({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: 'search' | 'menu'
}) {
  return (
    <Link href={href} aria-label={label} className="text-ink-muted">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      >
        {icon === 'search' ? (
          <>
            <circle cx="11" cy="11" r="7.5" />
            <path d="m16.5 16.5 4 4" />
          </>
        ) : (
          <path d="M3 7h18M3 12h18M3 17h18" />
        )}
      </svg>
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
