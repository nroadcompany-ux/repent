import Link from 'next/link'

import { AppHeader, HeaderAction } from '@/components/layout/app-header'
import { CONFESSION_TYPE_LABELS } from '@/domain/product-lock'
import { formatMonthDay } from '@/lib/date'
import { signedUrls } from '@/lib/storage'
import { requireUser } from '@/lib/supabase/server'
import type { ConfessionType } from '@/lib/supabase/database.types'
import { ReactionBar, tallyReactions } from './_components/reaction-bar'

export const dynamic = 'force-dynamic'

/*
 * Owner decision 2026-09-08: the fixed category filter (전체/기도/고백/은혜/일상)
 * is removed. A post may carry one optional free-text 주제 instead, stored in
 * post_hashtags. It is metadata for finding things, not a type for the post.
 */

const SAMPLE_POSTS: ReadonlyArray<{
  id: string
  type: ConfessionType
  author: string
  body: string
  topic?: string
}> = [
  {
    id: 'sample-01',
    type: 'daily',
    author: 'RETURN 예시',
    body: '오늘은 하루가 유난히 길게 느껴졌어요.\n특별히 힘든 일이 있었던 것도 아닌데\n괜히 마음이 무거웠습니다.\n그래도 무사히 하루를 마친 것에 감사합니다.',
  },
  {
    id: 'sample-02',
    topic: '기도부탁',
    type: 'prayer',
    author: 'RETURN 예시',
    body: '가족이 건강하게 지낼 수 있도록 기도 부탁드려요.\n요즘 부모님 건강이 예전 같지 않아서\n마음이 자주 그쪽으로 갑니다.\n제가 할 수 있는 일이 많지 않다는 것도 알지만\n그래서 더 기도하게 됩니다.',
  },
  {
    id: 'sample-03',
    topic: '오늘의말씀',
    type: 'grace',
    author: 'RETURN 예시',
    body: '오늘 말씀을 읽다가 마음이 조금 편안해졌어요.\n같은 구절을 여러 번 읽었는데\n오늘따라 다르게 들렸습니다.\n답을 얻은 건 아니지만 덜 조급해졌어요.',
  },
  {
    id: 'sample-04',
    type: 'confession',
    author: 'RETURN 예시',
    body: '화가 난 마음을 오래 붙잡고 있었습니다.\n상대는 이미 잊었을지도 모르는 일인데\n저는 계속 되뇌고 있었어요.\n그 시간이 아깝다는 걸 이제야 알겠습니다.',
  },
  {
    id: 'sample-05',
    type: 'daily',
    author: 'RETURN 예시',
    body: '출근길에 하늘을 보며 잠깐 멈춰 섰습니다.\n늘 지나던 길인데 오늘은 눈에 들어왔어요.\n짧은 순간이었지만 숨이 트이는 기분이었습니다.',
  },
  {
    id: 'sample-06',
    topic: '고민',
    type: 'prayer',
    author: 'RETURN 예시',
    body: '중요한 결정을 앞두고 있습니다.\n어느 쪽을 골라도 후회가 남을 것 같아\n며칠째 미루고만 있었어요.\n제 뜻보다 바른 길을 알아볼 수 있는\n지혜를 구합니다.',
  },
  {
    id: 'sample-07',
    type: 'grace',
    author: 'RETURN 예시',
    body: '예상하지 못한 도움을 받았습니다.\n부탁한 적도 없는데 먼저 손을 내밀어 주셨어요.\n고맙다는 말로는 부족한 하루였습니다.',
  },
  {
    id: 'sample-08',
    type: 'confession',
    author: 'RETURN 예시',
    body: '해야 할 말을 계속 미루고 있었어요.\n사과해야 한다는 걸 알면서도\n먼저 말을 꺼내는 게 어려웠습니다.\n더 늦기 전에 용기를 내어\n먼저 다가가 보려고 합니다.',
  },
  {
    id: 'sample-09',
    topic: '기도부탁',
    type: 'prayer',
    author: 'RETURN 예시',
    body: '마음이 많이 지친 친구가 있습니다.\n곁에 있어 주는 것 말고는\n해줄 수 있는 게 없더라고요.\n함께 기도해 주시면 감사하겠습니다.',
  },
  {
    id: 'sample-10',
    type: 'daily',
    author: 'RETURN 예시',
    body: '오늘은 조금 느리게 가도 괜찮다고\n생각해 보기로 했습니다.\n서두른다고 더 빨리 도착하는 것도 아니더라고요.',
  },
]

function SampleReactionRow() {
  return (
    <div className="mt-3 flex items-center gap-2 border-t border-line pt-2" aria-label="예시 반응">
      {[
        ['👍', 0, '좋아요'],
        ['👎', 0, '싫어요'],
        ['💬', 0, '댓글'],
      ].map(([icon, count, label]) => (
        <span
          key={String(label)}
          className="text-body-sm inline-flex min-h-9 items-center gap-1 rounded-chip px-3 font-medium text-ink-muted"
          aria-label={`${label} ${count}`}
        >
          <span aria-hidden="true" className="grayscale">
            {icon}
          </span>
          <span>{count}</span>
        </span>
      ))}
    </div>
  )
}

export default async function ConfessionPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { blocked } = await searchParams

  let query = supabase
    .from('confession_posts')
    .select('id, user_id, type, body, photo_path, created_at')
    .is('hidden_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: posts, error } = await query

  const postIds = (posts ?? []).map((post) => post.id)
  const authorIds = Array.from(new Set((posts ?? []).map((post) => post.user_id)))

  const [{ data: authors }, { data: reactions }, { data: comments }, { data: topics }, photoUrls] =
    await Promise.all([
    authorIds.length
      ? supabase.from('community_profiles').select('id, display_name').in('id', authorIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from('confession_reactions').select('post_id, user_id, type').in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from('confession_comments').select('post_id').in('post_id', postIds).is('deleted_at', null)
      : Promise.resolve({ data: [] }),
    // One optional topic per post. post_hashtags already exists and is indexed.
    postIds.length
      ? supabase.from('post_hashtags').select('post_id, tag').in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    signedUrls(
      supabase,
      'confession',
      (posts ?? []).map((post) => post.photo_path).filter((path): path is string => Boolean(path)),
    ),
  ])

  const authorName = new Map((authors ?? []).map((author) => [author.id, author.display_name]))
  const { counts, mine } = tallyReactions(reactions ?? [], userId)
  const commentCount = new Map<string, number>()
  for (const comment of comments ?? []) {
    commentCount.set(comment.post_id, (commentCount.get(comment.post_id) ?? 0) + 1)
  }

  const topicByPost = new Map<string, string>()
  for (const row of topics ?? []) if (!topicByPost.has(row.post_id)) topicByPost.set(row.post_id, row.tag)

  const returnTo = '/confession'
  const visibleSamples = SAMPLE_POSTS

  return (
    <main>
      {/* [PRODUCT LOCK — NOT ADMIN] sns.header.action — 전체 메뉴와 같은 제품 용어 */}
      <AppHeader sticky actions={<HeaderAction href="/confession/write">나누기</HeaderAction>} />

      {blocked ? (
        <p className="text-body-sm mx-title-gutter mt-3 rounded-control bg-accent-tint px-4 py-3 leading-[21px] text-accent">
          차단했어요. 이 사람의 글과 댓글은 이제 보이지 않습니다.
        </p>
      ) : null}

      <div className="mt-4">
        {error ? (
          <p role="alert" className="text-body-sm mx-gutter rounded-card bg-danger-tint px-6 py-8 text-center leading-[21px] text-danger">
            글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (posts ?? []).length === 0 ? (
          <ul className="flex flex-col gap-row-gap px-gutter">
            {visibleSamples.map((sample) => (
              <li key={sample.id} className="rounded-card bg-surface px-4 py-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body-sm font-semibold text-ink">{sample.author}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    {sample.topic ? (
                      <span className="text-caption rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
                        {sample.topic}
                      </span>
                    ) : null}
                    <span className="text-caption rounded-chip border border-line px-[10px] py-[4px] font-medium text-ink-muted">
                      예시
                    </span>
                  </div>
                </div>
                <p className="text-body mt-4 whitespace-pre-wrap leading-[26px] text-ink">{sample.body}</p>
                <SampleReactionRow />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-row-gap px-gutter">
            {(posts ?? []).map((post) => {
              const photoUrl = post.photo_path ? photoUrls.get(post.photo_path) : null
              const replies = commentCount.get(post.id) ?? 0
              return (
                <li key={post.id} className="rounded-card bg-surface px-4 py-5">
                  {/*
                    Post header. No @handle: profiles has no username column, so
                    inventing one would show a member an identifier they do not
                    have. Recorded as a source gap instead.
                  */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-ink">
                        {authorName.get(post.user_id) || '이름 없음'}
                      </p>
                      <p className="text-caption mt-[2px] text-ink-faint">
                        {formatMonthDay(post.created_at.slice(0, 10))}
                      </p>
                    </div>
                    {topicByPost.get(post.id) ? (
                      <span className="text-caption shrink-0 rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
                        {topicByPost.get(post.id)}
                      </span>
                    ) : null}
                  </div>

                  <Link href={`/confession/${post.id}`} className="mt-4 block">
                    <p className="text-body line-clamp-6 whitespace-pre-wrap leading-[26px] text-ink">{post.body}</p>
                  </Link>

                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="" className="mt-4 max-h-[280px] w-full rounded-row object-cover" />
                  ) : null}

                  <div className="mt-4 border-t border-line pt-3">
                    <ReactionBar
                      postId={post.id}
                      counts={counts.get(post.id) ?? new Map()}
                      mine={mine.get(post.id) ?? null}
                      returnTo={returnTo}
                      commentCount={replies}
                      commentHref={`/confession/${post.id}#comments`}
                    />
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
