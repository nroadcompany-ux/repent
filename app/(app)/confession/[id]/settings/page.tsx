import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, TextArea } from '@/components/ui/control'
import { REPORT_REASON_LABELS } from '@/domain/product-lock'
import { requireUser } from '@/lib/supabase/server'
import type { ReportReason } from '@/lib/supabase/database.types'
import { blockAuthor, deleteConfession, reportConfession } from '../../actions'

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
}: {
  params: Promise<{ id: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { data: post } = await supabase
    .from('confession_posts')
    .select('id, user_id, source_kind')
    .eq('id', id)
    .maybeSingle()

  if (!post) notFound()
  const isMine = post.user_id === userId

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
          <h2 className="text-section font-semibold text-ink">신고 · 차단</h2>
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
              <Button type="submit" variant="quiet">신고 보내기</Button>
            </div>
          </form>

          <form action={blockAuthor} className="mt-3">
            <input type="hidden" name="user_id" value={post.user_id} />
            <Button type="submit" variant="danger">이 사람 차단하기</Button>
          </form>
        </section>
      )}
    </main>
  )
}
