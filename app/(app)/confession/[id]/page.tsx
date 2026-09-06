import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, TextArea } from '@/components/ui/control'
import {
  CONFESSION_COMMENTS_ENABLED,
  CONFESSION_TYPE_LABELS,
  REPORT_REASON_LABELS,
} from '@/domain/product-lock'
import { formatFullDate, formatMonthDay } from '@/lib/date'
import { signedUrl } from '@/lib/storage'
import { requireUser } from '@/lib/supabase/server'
import type { ReportReason } from '@/lib/supabase/database.types'
import { ReactionBar, tallyReactions } from '../_components/reaction-bar'
import {
  blockAuthor,
  createComment,
  deleteComment,
  deleteConfession,
  reportComment,
  reportConfession,
  updateComment,
} from '../actions'

export const dynamic = 'force-dynamic'

const ERRORS: Record<string, string> = {
  reason: '신고 사유를 선택해 주세요.',
  comment_empty: '댓글 내용을 입력해 주세요.',
  comment_save: '댓글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
}

/** docs/08 report reasons carry no spiritual judgment. */
function ReportReasonFields() {
  return (
    <div className="flex flex-col gap-2">
      {(Object.entries(REPORT_REASON_LABELS) as Array<[ReportReason, string]>).map(
        ([value, label]) => (
          <label key={value} className="text-body flex items-center gap-3 text-ink">
            <input type="radio" name="reason" value={value} required className="size-[18px] accent-accent" />
            {label}
          </label>
        ),
      )}
    </div>
  )
}

export default async function ConfessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reported?: string; error?: string; edit?: string; report?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { reported, error, edit: editingCommentId, report: reportingCommentId } = await searchParams

  const { data: post } = await supabase
    .from('confession_posts')
    .select('id, user_id, type, body, photo_path, source_kind, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!post) notFound()

  const [{ data: author }, { data: reactions }, { data: tags }, { data: comments }, photoUrl] =
    await Promise.all([
      supabase.from('community_profiles').select('display_name').eq('id', post.user_id).maybeSingle(),
      supabase.from('confession_reactions').select('post_id, user_id, type').eq('post_id', id),
      supabase.from('post_hashtags').select('tag').eq('post_id', id),
      supabase
        .from('confession_comments')
        .select('id, user_id, body, created_at')
        .eq('post_id', id)
        .is('deleted_at', null)
        .order('created_at'),
      signedUrl(supabase, 'confession', post.photo_path),
    ])

  const commenterIds = Array.from(new Set((comments ?? []).map((comment) => comment.user_id)))
  const { data: commenters } = commenterIds.length
    ? await supabase.from('community_profiles').select('id, display_name').in('id', commenterIds)
    : { data: [] }
  const commenterName = new Map((commenters ?? []).map((row) => [row.id, row.display_name]))

  const isMine = post.user_id === userId
  const { counts, mine } = tallyReactions(reactions ?? [], userId)

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
          {ERRORS[error] ?? '다시 시도해 주세요.'}
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
          <ReactionBar
            postId={id}
            counts={counts.get(id) ?? new Map()}
            mine={mine.get(id) ?? null}
            returnTo={`/confession/${id}`}
          />
        </div>
      </article>

      {CONFESSION_COMMENTS_ENABLED ? (
        <section id="comments" className="mt-8">
          <h2 className="text-section px-title-gutter font-semibold text-ink">
            댓글 {(comments ?? []).length}
          </h2>

          <form action={createComment} className="mt-3 px-title-gutter">
            <input type="hidden" name="post_id" value={id} />
            <TextArea
              name="body"
              rows={3}
              maxLength={1000}
              placeholder="함께 마음을 나눠보세요."
              required
            />
            <div className="mt-2">
              <Button type="submit" variant="secondary">
                댓글 남기기
              </Button>
            </div>
          </form>

          {(comments ?? []).length === 0 ? (
            <p className="text-body-sm mt-4 px-title-gutter leading-[18px] text-ink-muted">
              아직 댓글이 없어요.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-row-gap px-gutter">
              {(comments ?? []).map((comment) => {
                const own = comment.user_id === userId
                const editing = editingCommentId === comment.id
                const reporting = reportingCommentId === comment.id

                return (
                  <li key={comment.id} className="rounded-row bg-surface px-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-medium text-ink-muted">
                        {commenterName.get(comment.user_id) || '이름 없음'}
                      </p>
                      <p className="text-caption text-ink-faint">
                        {formatMonthDay(comment.created_at.slice(0, 10))}
                      </p>
                    </div>

                    {editing ? (
                      <form action={updateComment} className="mt-2">
                        <input type="hidden" name="comment_id" value={comment.id} />
                        <input type="hidden" name="post_id" value={id} />
                        <TextArea name="body" rows={3} maxLength={1000} defaultValue={comment.body} required />
                        <div className="mt-2 flex items-center gap-3">
                          <Button type="submit" variant="secondary" className="w-auto px-4">
                            저장
                          </Button>
                          <Link
                            href={`/confession/${id}#comments`}
                            className="text-caption font-medium text-ink-muted"
                          >
                            취소
                          </Link>
                        </div>
                      </form>
                    ) : (
                      <p className="text-body mt-2 whitespace-pre-wrap leading-[22px] text-ink">
                        {comment.body}
                      </p>
                    )}

                    {!editing ? (
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        {own ? (
                          <>
                            <Link
                              href={`/confession/${id}?edit=${comment.id}#comments`}
                              className="text-caption font-medium text-ink-muted"
                            >
                              수정
                            </Link>
                            <form action={deleteComment}>
                              <input type="hidden" name="comment_id" value={comment.id} />
                              <input type="hidden" name="post_id" value={id} />
                              <button type="submit" className="text-caption font-medium text-ink-faint">
                                삭제
                              </button>
                            </form>
                          </>
                        ) : (
                          <Link
                            href={`/confession/${id}?report=${comment.id}#comments`}
                            className="text-caption font-medium text-ink-faint"
                          >
                            신고
                          </Link>
                        )}
                      </div>
                    ) : null}

                    {reporting && !own ? (
                      <form action={reportComment} className="mt-4 border-t border-line pt-4">
                        <input type="hidden" name="comment_id" value={comment.id} />
                        <input type="hidden" name="post_id" value={id} />
                        <p className="text-caption mb-2 font-medium text-accent">신고 사유</p>
                        <ReportReasonFields />
                        <div className="mt-3">
                          <TextArea name="detail" rows={2} maxLength={1000} placeholder="설명 (선택)" />
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <Button type="submit" variant="quiet" className="w-auto px-4">
                            신고 보내기
                          </Button>
                          <Link
                            href={`/confession/${id}#comments`}
                            className="text-caption font-medium text-ink-muted"
                          >
                            취소
                          </Link>
                        </div>
                      </form>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}

          <p className="text-caption mt-4 px-title-gutter text-center leading-[17px] text-ink-faint">
            신앙이 다르다는 이유로는 신고할 수 없습니다.
          </p>
        </section>
      ) : null}

      {isMine ? (
        <div className="mt-9 px-title-gutter">
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
        <section className="mt-9 px-title-gutter">
          <h2 className="text-section font-semibold text-ink">이 글 신고하기</h2>
          <p className="text-body-sm mt-2 leading-[18px] text-ink-muted">
            신앙이 다르다는 이유로는 신고할 수 없습니다. 아래 사유 중에서 골라주세요.
          </p>

          <form action={reportConfession} className="mt-4">
            <input type="hidden" name="post_id" value={id} />
            <ReportReasonFields />
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
