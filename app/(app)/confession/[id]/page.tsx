import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, TextArea } from '@/components/ui/control'
import {
  CONFESSION_COMMENTS_ENABLED,
  CONFESSION_TYPE_LABELS,
  ENABLED_REACTIONS,
  REACTION_LABELS,
  REPORT_REASON_LABELS,
} from '@/domain/product-lock'
import { formatFullDate } from '@/lib/date'
import { signedUrl } from '@/lib/storage'
import { requireUser } from '@/lib/supabase/server'
import type { ReportReason } from '@/lib/supabase/database.types'
import { blockAuthor, deleteConfession, reportConfession, toggleReaction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function ConfessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reported?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { reported, error } = await searchParams

  const { data: post } = await supabase
    .from('confession_posts')
    .select('id, user_id, type, body, photo_path, source_kind, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!post) notFound()

  const [{ data: author }, { data: reactions }, { data: tags }, photoUrl] = await Promise.all([
    supabase.from('community_profiles').select('display_name').eq('id', post.user_id).maybeSingle(),
    supabase.from('confession_reactions').select('user_id, type').eq('post_id', id),
    supabase.from('post_hashtags').select('tag').eq('post_id', id),
    signedUrl(supabase, 'confession', post.photo_path),
  ])

  const isMine = post.user_id === userId
  const primaryReaction = ENABLED_REACTIONS[0]
  const count = (reactions ?? []).length
  const mine = (reactions ?? []).some(
    (reaction) => reaction.user_id === userId && reaction.type === primaryReaction,
  )

  return (
    <main>
      <PageHeader title={CONFESSION_TYPE_LABELS[post.type]} backHref="/confession" />

      {reported ? (
        <p className="text-body-sm mx-title-gutter mt-2 rounded-control bg-accent-tint px-4 py-3 leading-[18px] text-accent">
          신고를 접수했어요. 운영진이 내용을 확인한 뒤 처리합니다.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          신고 사유를 선택해 주세요.
        </p>
      ) : null}

      <article className="mx-gutter mt-3 rounded-card bg-surface px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-caption font-medium text-ink-muted">
            {author?.display_name || '이름 없음'}
          </p>
          <p className="text-caption text-ink-faint">
            {formatFullDate(post.created_at.slice(0, 10))}
          </p>
        </div>

        <p className="text-body mt-3 whitespace-pre-wrap leading-[22px] text-ink">{post.body}</p>

        {photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photoUrl} alt="" className="mt-4 w-full rounded-row object-cover" />
        ) : null}

        {(tags ?? []).length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {(tags ?? []).map((tag) => (
              <li
                key={tag.tag}
                className="text-caption rounded-chip bg-canvas px-[10px] py-[4px] font-medium text-ink-muted"
              >
                #{tag.tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <form action={toggleReaction}>
            <input type="hidden" name="post_id" value={id} />
            <input type="hidden" name="type" value={primaryReaction} />
            <input type="hidden" name="return_to" value={`/confession/${id}`} />
            <button
              type="submit"
              aria-pressed={mine}
              className={`text-caption rounded-chip px-3 py-[6px] font-medium ${
                mine ? 'bg-accent text-white' : 'border border-line bg-surface text-ink-muted'
              }`}
            >
              {REACTION_LABELS[primaryReaction]} {count}
            </button>
          </form>
        </div>
      </article>

      {CONFESSION_COMMENTS_ENABLED ? null : (
        <p className="text-caption mt-4 px-title-gutter text-center leading-[17px] text-ink-faint">
          지금은 댓글 없이 공감만 남길 수 있습니다.
        </p>
      )}

      {isMine ? (
        <div className="mt-8 px-title-gutter">
          <form action={deleteConfession}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="danger">
              이 글 삭제
            </Button>
          </form>
          {post.source_kind ? (
            <p className="text-caption mt-3 text-center leading-[17px] text-ink-faint">
              이 글을 지워도 원본 기록은 그대로 남습니다.
            </p>
          ) : null}
        </div>
      ) : (
        <section className="mt-8 px-title-gutter">
          <h2 className="text-section font-semibold text-ink">신고하기</h2>
          <p className="text-body-sm mt-2 leading-[18px] text-ink-muted">
            신앙이 다르다는 이유로는 신고할 수 없습니다. 아래 사유 중에서 골라주세요.
          </p>

          <form action={reportConfession} className="mt-4">
            <input type="hidden" name="post_id" value={id} />
            <div className="flex flex-col gap-2">
              {(Object.entries(REPORT_REASON_LABELS) as Array<[ReportReason, string]>).map(
                ([value, label]) => (
                  <label key={value} className="text-body flex items-center gap-3 text-ink">
                    <input
                      type="radio"
                      name="reason"
                      value={value}
                      required
                      className="size-[18px] accent-accent"
                    />
                    {label}
                  </label>
                ),
              )}
            </div>
            <div className="mt-3">
              <TextArea name="detail" rows={3} maxLength={1000} placeholder="설명 (선택)" />
            </div>
            <div className="mt-4">
              <Button type="submit" variant="quiet">
                신고 보내기
              </Button>
            </div>
          </form>

          <form action={blockAuthor} className="mt-3">
            <input type="hidden" name="user_id" value={post.user_id} />
            <Button type="submit" variant="danger">
              이 사람 차단하기
            </Button>
          </form>
        </section>
      )}
    </main>
  )
}
