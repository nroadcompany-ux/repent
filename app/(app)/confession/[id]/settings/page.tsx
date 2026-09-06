import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, TextArea } from '@/components/ui/control'
import { REPORT_REASON_LABELS } from '@/domain/product-lock'
import { requireUser } from '@/lib/supabase/server'
import type { ReportReason } from '@/lib/supabase/database.types'
import { blockAuthor, deleteConfession, reportComment, reportConfession } from '../../actions'

export const dynamic = 'force-dynamic'

function ReportReasonFields() {
  return (
    <div className="flex flex-col gap-2">
      {(Object.entries(REPORT_REASON_LABELS) as Array<[ReportReason, string]>).map(([value, label]) => (
        <label key={value} className="text-body flex items-center gap-3 text-ink">
          <input type="radio" name="reason" value={value} required className="size-[18px] accent-accent" />
          {label}
        </label>
      ))}
    </div>
  )
}

export default async function ConfessionSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ comment?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { comment: commentId } = await searchParams

  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from('confession_posts')
      .select('id, user_id, source_kind')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('confession_comments')
      .select('id, user_id, body')
      .eq('post_id', id)
      .is('deleted_at', null)
      .neq('user_id', userId)
      .order('created_at'),
  ])

  if (!post) notFound()
  const isMine = post.user_id === userId
  const selectedComment = (comments ?? []).find((comment) => comment.id === commentId) ?? null

  return (
    <main>
      <PageHeader title="게시물 설정" backHref={`/confession/${id}`} />

      {isMine ? (
        <section className="mt-5 px-title-gutter">
          <h2 className="text-section font-semibold text-ink">내 글 관리</h2>
          <form action={deleteConfession} className="mt-4">
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="danger">이 글 삭제</Button>
          </form>
          {post.source_kind ? (
            <p className="text-caption mt-3 text-center leading-[20px] text-ink-faint">
              이 글을 지워도 원본 기록은 그대로 남습니다.
            </p>
          ) : null}
        </section>
      ) : (
        <section className="mt-5 px-title-gutter">
          <h2 className="text-section font-semibold text-ink">게시물 신고 · 차단</h2>
          <p className="text-body-sm mt-2 leading-[21px] text-ink-muted">
            신앙이 다르다는 이유로는 신고할 수 없습니다. 안전과 운영에 필요한 기능만 이곳에 모았습니다.
          </p>

          <form action={reportConfession} className="mt-5">
            <input type="hidden" name="post_id" value={id} />
            <ReportReasonFields />
            <div className="mt-3">
              <TextArea name="detail" rows={3} maxLength={1000} placeholder="설명 (선택)" />
            </div>
            <div className="mt-4">
              <Button type="submit" variant="quiet">게시물 신고</Button>
            </div>
          </form>

          <form action={blockAuthor} className="mt-3">
            <input type="hidden" name="user_id" value={post.user_id} />
            <Button type="submit" variant="danger">이 사람 차단하기</Button>
          </form>
        </section>
      )}

      {(comments ?? []).length > 0 ? (
        <section className="mt-9 px-title-gutter">
          <h2 className="text-section font-semibold text-ink">댓글 신고</h2>
          <p className="text-body-sm mt-2 leading-[21px] text-ink-muted">
            댓글 신고도 피드에는 노출하지 않고 이 설정 화면에서만 처리합니다.
          </p>

          <ul className="mt-4 flex flex-col gap-2">
            {(comments ?? []).map((comment) => (
              <li key={comment.id} className="rounded-row border border-line bg-surface px-4 py-3">
                <p className="text-body-sm line-clamp-2 leading-[21px] text-ink">{comment.body}</p>
                <Link
                  href={`/confession/${id}/settings?comment=${comment.id}#comment-report`}
                  className="text-caption mt-2 inline-block font-medium text-ink-muted"
                >
                  이 댓글 신고
                </Link>
              </li>
            ))}
          </ul>

          {selectedComment ? (
            <form id="comment-report" action={reportComment} className="mt-5 rounded-card bg-surface px-4 py-4">
              <input type="hidden" name="comment_id" value={selectedComment.id} />
              <input type="hidden" name="post_id" value={id} />
              <p className="text-caption mb-3 font-medium text-accent">선택한 댓글 신고 사유</p>
              <ReportReasonFields />
              <div className="mt-3">
                <TextArea name="detail" rows={3} maxLength={1000} placeholder="설명 (선택)" />
              </div>
              <div className="mt-4">
                <Button type="submit" variant="quiet">댓글 신고 보내기</Button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}
