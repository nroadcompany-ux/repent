import Link from 'next/link'

import { PageHeader } from '@/components/layout/app-header'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import { BIBLE_BOOKS, findBook, TOTAL_CHAPTERS } from '@/domain/bible'
import { requireUser } from '@/lib/supabase/server'
import { toggleChapter } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * 성경읽기표 (docs/01 Journey IA item 8).
 *
 * The member marks the chapters they have read. There is no plan, no daily
 * quota, and no streak — no canonical source defines one, and inventing a
 * quota would turn reading into an obligation the product does not impose.
 */
export default async function BibleReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string; testament?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const params = await searchParams

  const testament = params.testament === 'new' ? 'new' : 'old'
  const selectedBook = params.book && findBook(params.book) ? params.book : null

  const { data: progress } = await supabase
    .from('bible_reading_progress')
    .select('book, chapter')
    .eq('user_id', userId)

  const readByBook = new Map<string, Set<number>>()
  for (const row of progress ?? []) {
    const set = readByBook.get(row.book) ?? new Set<number>()
    set.add(row.chapter)
    readByBook.set(row.book, set)
  }

  const totalRead = (progress ?? []).length
  const books = BIBLE_BOOKS.filter((book) => book.testament === testament)
  const currentBook = selectedBook ? findBook(selectedBook) : null
  const returnTo = `/journey/bible?testament=${testament}${selectedBook ? `&book=${encodeURIComponent(selectedBook)}` : ''}`

  return (
    <main>
      <PageHeader title="성경읽기표" backHref="/journey" />

      <section className="mx-gutter mt-2 rounded-card bg-surface px-4 py-4">
        <p className="text-caption font-medium text-accent">지금까지 읽은 장</p>
        <p className="text-value mt-[2px] font-semibold text-ink">
          {totalRead} / {TOTAL_CHAPTERS}장
        </p>
        <p className="text-caption mt-[2px] leading-[16px] text-ink-muted">
          내가 표시한 만큼만 기록됩니다. 정해진 진도는 없습니다.
        </p>
      </section>

      <div className="mt-5 px-title-gutter">
        <SegmentedLinks
          active={testament}
          options={[
            { value: 'old', label: '구약', href: '/journey/bible?testament=old' },
            { value: 'new', label: '신약', href: '/journey/bible?testament=new' },
          ]}
        />
      </div>

      {currentBook ? (
        <section className="mt-6 px-title-gutter">
          <div className="flex items-center justify-between">
            <h2 className="text-section font-semibold text-ink">{currentBook.name}</h2>
            <Link
              href={`/journey/bible?testament=${testament}`}
              className="text-body-sm font-medium text-ink-muted"
            >
              목록
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-[6px]">
            {Array.from({ length: currentBook.chapters }, (_, index) => index + 1).map((chapter) => {
              const read = readByBook.get(currentBook.name)?.has(chapter) ?? false
              return (
                <form key={chapter} action={toggleChapter}>
                  <input type="hidden" name="book" value={currentBook.name} />
                  <input type="hidden" name="chapter" value={chapter} />
                  <input type="hidden" name="read" value={read ? '1' : '0'} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <button
                    type="submit"
                    aria-pressed={read}
                    className={`text-caption flex size-[36px] items-center justify-center rounded-control border font-medium ${
                      read
                        ? 'border-accent bg-accent text-white'
                        : 'border-line bg-surface text-ink-muted'
                    }`}
                  >
                    {chapter}
                  </button>
                </form>
              )
            })}
          </div>
        </section>
      ) : (
        <ul className="mt-6 flex flex-col gap-row-gap px-gutter">
          {books.map((book) => {
            const read = readByBook.get(book.name)?.size ?? 0
            return (
              <li key={book.name}>
                <Link
                  href={`/journey/bible?testament=${testament}&book=${encodeURIComponent(book.name)}`}
                  className="flex items-center justify-between rounded-row bg-surface px-4 py-3"
                >
                  <span className="text-value font-semibold text-ink">{book.name}</span>
                  <span
                    className={`text-caption font-medium ${
                      read === book.chapters ? 'text-accent' : 'text-ink-muted'
                    }`}
                  >
                    {read} / {book.chapters}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
