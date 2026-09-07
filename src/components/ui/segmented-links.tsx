import Link from 'next/link'

/**
 * Server-rendered segmented control. Each option is a real link that changes a
 * search param, so the surface survives a refresh, back/forward, and a shared
 * URL — which matters because docs/03 requires Prayer to return the member to
 * "Prayer Home 또는 진입 원점".
 *
 * These are navigation links, not an ARIA tab widget: they change the URL and
 * there is no tabpanel, no roving focus and no arrow-key movement. The control
 * therefore uses navigation semantics with aria-current, which is what a
 * screen reader can actually act on. (It previously declared role="tablist" /
 * role="tab" / aria-selected, promising a keyboard contract it did not honour.)
 *
 * [OPEN — NO FIGMA SOURCE] The Figma file has no tab or chip component.
 */
export function SegmentedLinks({
  options,
  active,
  size = 'md',
  label,
  align = 'start',
}: {
  options: ReadonlyArray<{ href: string; label: string; value: string }>
  active: string
  size?: 'md' | 'sm'
  /** Names the group of links for assistive tech; renders a nav landmark. */
  label?: string
  align?: 'start' | 'end'
}) {
  const list = (
    <div className={`flex gap-2 ${align === 'end' ? 'justify-end' : ''}`}>
      {options.map((option) => {
        const selected = option.value === active
        return (
          <Link
            key={option.value}
            href={option.href}
            aria-current={selected ? 'page' : undefined}
            className={`${
              size === 'sm' ? 'h-[30px] px-3 text-caption' : 'h-[34px] px-4 text-body-sm'
            } inline-flex items-center rounded-chip font-medium transition-colors ${
              selected ? 'bg-accent text-white' : 'border border-line bg-surface text-ink-muted'
            }`}
          >
            {option.label}
          </Link>
        )
      })}
    </div>
  )

  return label ? <nav aria-label={label}>{list}</nav> : list
}
