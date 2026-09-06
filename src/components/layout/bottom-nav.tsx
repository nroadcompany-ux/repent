'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Bottom navigation. Figma 3:53–3:64.
 *   bar 390x58 white · 1px top border #ececf2
 *   5 equal slots (78 wide), dot 7px at 15 from the bar top,
 *   label 11/15 at 30 from the bar top
 *   active: dot #6c43f3, label semibold #17171c
 *   inactive: dot #a2a4ad, label medium #6f717a
 *
 * Canonical lock (docs/00, docs/01, AC-01): 여정 | 기도 | 회개 | 약속 | 고백.
 * Action is NOT a tab — it lives inside Promise. Search is inside Journey.
 */

const TABS = [
  { href: '/journey', label: '여정' },
  { href: '/prayer', label: '기도' },
  { href: '/repentance', label: '회개' },
  { href: '/promise', label: '약속' },
  { href: '/confession', label: '고백' },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="주요 이동"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-frame border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-nav">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className="flex h-full flex-col items-center pt-[15px]"
              >
                <span
                  aria-hidden="true"
                  className={`size-[7px] rounded-full ${active ? 'bg-accent' : 'bg-ink-faint'}`}
                />
                <span
                  className={`text-caption mt-[8px] ${
                    active ? 'font-semibold text-ink' : 'font-medium text-ink-muted'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
