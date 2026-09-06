import Link from 'next/link'

import { AppHeader, HeaderAction } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { EmptyState } from '@/components/ui/state'
import { SegmentedLinks } from '@/components/ui/segmented-links'
import {
  CONFESSION_TYPE_LABELS,
  ENABLED_REACTIONS,
  REACTION_LABELS,
} from '@/domain/product-lock'
import { formatMonthDay } from '@/lib/date'
import { signedUrls } from '@/lib/storage'
import { requireUser } from '@/lib/supabase/server'
import type { ConfessionType } from '@/lib/supabase/database.types'
import { toggleReaction } from './actions'

export const dynamic = 'force-dynamic'

/**
 * Confession Feed.
 *
 * docs/04 and docs/08: no 인기순, no TOP, no ranking of any kind. The feed is
 * strictly reverse-chronological and the reaction count is shown without any
 * comparison between posts. Confession uses no AI at all.
 */

const SLIDES: readonly EducationSlide[] = [
  {
    headline: ['나눌 만큼만', '나누면 됩니다'],
    body: ['비공개 기록에서 공개할 부분만', '직접 골라 담을 수 있어요.'],
  },
  {
    headline: ['여기에는 순위가', '없습니다'],
    body: ['많이 공감받은 글을 위로 올리거나', '줄 세우지 않습니다.'],
  },
]

const FILTERS = [
  { value: '', label: '전체' },
  ...(Object.entries(CONFESSION_TYPE_LABELS) as Array<[ConfessionType, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
]

export default async function ConfessionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; blocked?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { type: typeParam, blocked } = await searchParams
  const activeType = FILTERS.some((filter) => filter.value === typeParam) ? (typeParam ?? '') : ''

  let query = supabase
    .from('confession_posts')
    .select('id, user_id, type, body, photo_path, created_at')
    .is('hidden_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (activeType) query = query.eq('type', activeType as ConfessionType)

  const { data: posts, error } = await query

  const postIds = (posts ?? []).map((post) => post.id)
  const authorIds = Array.from(new Set((posts ?? []).map((post) => post.user_id)))

  const [{ data: authors }, { data: reactions }, photoUrls] = await Promise.all([
    authorIds.length
      ? supabase.from('community_profiles').select('id, display_name').in('id', authorIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from('confession_reactions').select('post_id, user_id, type').in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    signedUrls(
      supabase,
      'confession',
      (posts ?? []).map((post) => post.photo_path).filter((path): path is string => Boolean(path)),
    ),
  ])

  const authorName = new Map((authors ?? []).map((author) => [author.id, author.display_name]))
  const reactionCount = new Map<string, number>()
  const myReaction = new Map<string, string>()
  for (const reaction of reactions ?? []) {
    reactionCount.set(reaction.post_id, (reactionCount.get(reaction.post_id) ?? 0) + 1)
    if (reaction.user_id === userId) myReaction.set(reaction.post_id, reaction.type)
  }

  const primaryReaction = ENABLED_REACTIONS[0]

  return (
    <main>
      <AppHeader actions={<HeaderAction href="/confession/write">나누기</HeaderAction>} />
      <EducationBanner slides={SLIDES} />

      {blocked ? (
        <p className="text-body-sm mx-title-gutter mt-5 rounded-control bg-accent-tint px-4 py-3 leading-[18px] text-accent">
          차단했어요. 이 사람의 글은 이제 보이지 않습니다.
        </p>
      ) : null}

      <div className="no-scrollbar mt-7 overflow-x-auto px-title-gutter">
        <SegmentedLinks
          size="sm"
          active={activeType}
          options={FILTERS.map((filter) => ({
            value: filter.value,
            label: filter.label,
            href: filter.value ? `/confession?type=${filter.value}` : '/confession',
          }))}
        />
      </div>

      <div className="mt-6">
        {error ? (
          <p
            role="alert"
            className="text-body-sm mx-gutter rounded-card bg-danger-tint px-6 py-8 text-center leading-[18px] text-danger"
          >
            글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (posts ?? []).length === 0 ? (
          <EmptyState
            title="아직 나눈 글이 없어요"
            description="꼭 나누지 않아도 괜찮습니다. 나누고 싶을 때만 담으세요."
            actionLabel="고백 나누기"
            actionHref="/confession/write"
          />
        ) : (
          <ul className="flex flex-col gap-row-gap px-gutter">
            {(posts ?? []).map((post) => {
              const photoUrl = post.photo_path ? photoUrls.get(post.photo_path) : null
              const mine = myReaction.get(post.id) === primaryReaction
              return (
                <li key={post.id} className="rounded-card bg-surface px-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-caption rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
                      {CONFESSION_TYPE_LABELS[post.type]}
                    </span>
                    <span className="text-caption text-ink-faint">
                      {formatMonthDay(post.created_at.slice(0, 10))}
                    </span>
                  </div>

                  <Link href={`/confession/${post.id}`} className="mt-3 block">
                    <p className="text-caption font-medium text-ink-muted">
                      {authorName.get(post.user_id) || '이름 없음'}
                    </p>
                    <p className="text-body mt-2 line-clamp-6 whitespace-pre-wrap leading-[22px] text-ink">
                      {post.body}
                    </p>
                  </Link>

                  {photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photoUrl}
                      alt=""
                      className="mt-3 max-h-[280px] w-full rounded-row object-cover"
                    />
                  ) : null}

                  <div className="mt-4 flex items-center gap-3">
                    <form action={toggleReaction}>
                      <input type="hidden" name="post_id" value={post.id} />
                      <input type="hidden" name="type" value={primaryReaction} />
                      <input
                        type="hidden"
                        name="return_to"
                        value={activeType ? `/confession?type=${activeType}` : '/confession'}
                      />
                      <button
                        type="submit"
                        aria-pressed={mine}
                        className={`text-caption rounded-chip px-3 py-[6px] font-medium ${
                          mine ? 'bg-accent text-white' : 'border border-line bg-surface text-ink-muted'
                        }`}
                      >
                        {REACTION_LABELS[primaryReaction]} {reactionCount.get(post.id) ?? 0}
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
