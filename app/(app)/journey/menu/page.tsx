import Link from 'next/link'

import { PageHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/control'
import { MENU_SECTIONS, SIGN_OUT_ACTION } from '@/domain/menu'

/**
 * Full menu (Issue #21 §E).
 *
 * The existing /journey/menu route grows into the whole menu rather than a new
 * drawer: a sub-page needs no dialog role, no focus trap, no scroll lock and
 * no `inert` background, and the app has no dialog pattern to copy from. Every
 * section is a native <details>, so the accordion is keyboard- and
 * screen-reader-correct without any JavaScript.
 *
 * The first section opens by default so the screen is not a wall of closed
 * rows; the rest stay closed.
 */
export default function JourneyMenuPage() {
  return (
    <main>
      <PageHeader title="전체 메뉴" backHref="/journey" />

      <div className="mt-4 flex flex-col gap-2 px-title-gutter">
        {MENU_SECTIONS.map((section, index) => (
          <details
            key={section.title}
            open={index === 0}
            className="rounded-card bg-surface px-4 py-3"
          >
            <summary className="flex cursor-pointer items-center justify-between">
              <span>
                <span className="text-body block font-semibold text-ink">{section.title}</span>
                <span className="text-caption block text-ink-muted">{section.caption}</span>
              </span>
              <span className="text-caption text-ink-faint">{section.items.length}</span>
            </summary>

            <ul className="mt-3 flex flex-col border-t border-line pt-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block py-2">
                    <span className="text-body-sm block font-medium text-ink">{item.label}</span>
                    {item.caption ? (
                      <span className="text-caption block text-ink-muted">{item.caption}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      {/* Sign out is a POST route, so it is a real form rather than a link. */}
      <div className="mt-6 px-title-gutter">
        <form action={SIGN_OUT_ACTION} method="POST">
          <Button type="submit" variant="quiet">
            로그아웃
          </Button>
        </form>
      </div>

      <p className="text-caption mt-6 px-title-gutter text-center leading-[20px] text-ink-faint">
        준비 중인 기능은 이 목록에 넣지 않았습니다.
      </p>
    </main>
  )
}
