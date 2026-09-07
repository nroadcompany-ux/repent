import Link from 'next/link'

/**
 * 나의 기록 quick actions (Figma 119:4).
 *
 * One white card, four equal columns: a 24px line glyph over a caption. The
 * glyphs are traced from the Figma frames 119:6 / 119:12 / 119:17 / 119:22 and
 * share one stroke geometry, so they read as a set rather than four icons.
 *
 * Every entry points at a route that already exists. The one exception is
 * 신앙일기, which the Owner fixed as a PROTOTYPE PLACEHOLDER: there is no
 * feature behind it, so it is rendered disabled and says 준비 중 rather than
 * linking somewhere that would pretend otherwise.
 */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <rect x="5" y="2.5" width="14" height="19" rx="3" {...STROKE} />
      <path d="M9 8h6M9 11h6" {...STROKE} />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <rect x="2.5" y="5" width="19" height="14" rx="3" {...STROKE} />
      <path d="M12 5v14" {...STROKE} />
    </svg>
  )
}

function DiaryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <rect x="5" y="2.5" width="14" height="19" rx="3" {...STROKE} />
      <path d="M14.5 20.5 21 14" {...STROKE} />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <rect x="3" y="5" width="18" height="16" rx="3" {...STROKE} />
      <path d="M3 10h18M8 2.5v3M16 2.5v3" {...STROKE} />
    </svg>
  )
}

type QuickAction = {
  label: string
  icon: () => React.ReactElement
  href?: string
  /** Placeholder only: no feature exists behind this entry yet. */
  pending?: true
}

const ACTIONS: readonly QuickAction[] = [
  { label: '말씀노트', icon: NoteIcon, href: '/journey/scripture' },
  { label: '성경통독', icon: BookIcon, href: '/journey/bible' },
  { label: '신앙일기', icon: DiaryIcon, pending: true },
  { label: '캘린더', icon: CalendarIcon, href: '/journey/calendar' },
]

export function JourneyQuickActions() {
  return (
    <ul className="mx-gutter grid grid-cols-4 rounded-card bg-surface py-4">
      {ACTIONS.map((action) => {
        const Icon = action.icon
        const body = (
          <>
            <Icon />
            <span className="text-caption mt-[10px] block">{action.label}</span>
          </>
        )

        return (
          <li key={action.label} className="text-center">
            {action.href ? (
              <Link
                href={action.href}
                className="flex flex-col items-center px-1 text-accent [&_span]:text-ink"
              >
                {body}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                title="준비 중"
                className="flex flex-col items-center px-1 text-ink-faint [&_span]:text-ink-faint"
              >
                {body}
                <span className="sr-only">준비 중</span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
