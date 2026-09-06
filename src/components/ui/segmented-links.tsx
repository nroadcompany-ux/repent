import Link from 'next/link'

/**
 * Server-rendered segmented control. Each option is a real link that changes a
 * search param, so the surface survives a refresh, back/forward, and a shared
 * URL — which matters because docs/03 requires Prayer to return the member to
 * "Prayer Home 또는 진입 원점".
 *
 * [OPEN — NO FIGMA SOURCE] The Figma file has no tab or chip component.
 */
export function SegmentedLinks({
  options,
  active,
  size = 'md',
}: {
  options: ReadonlyArray<{ href: string; label: string; value: string }>
  active: string
  size?: 'md' | 'sm'
}) {
  return (
    <div className="flex gap-2" role="tablist">
      {options.map((option) => {
        const selected = option.value === active
        return (
          <Link
            key={option.value}
            href={option.href}
            role="tab"
            aria-selected={selected}
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
}
