'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAV } from '../navigation';

/** The 5 locked main nav items. Today and Search never appear here. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="주 메뉴">
      {MAIN_NAV.map((item) => {
        const isCurrent = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav__item"
            aria-current={isCurrent ? 'page' : undefined}
          >
            <span className="nav__dot" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
