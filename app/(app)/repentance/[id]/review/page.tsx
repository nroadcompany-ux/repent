import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/control'
import { REPENTANCE_FLOW } from '@/domain/repentance'
import { requireUser } from '@/lib/supabase/server'
import { commitRepentance } from '../../actions'

export const dynamic = 'force-dynamic'

/**
 * Preview / Review — docs/02:
 *   ... → `회개 기록 마치기` → Preview/Review → 저장 또는 계속 수정
 *
 * This screen only shows back what the member wrote. It adds no assessment,
 * no summary judgment, and no score.
 */
export default async function RepentanceReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { error } = await searchParams

  const { data: record } = await supabase
    .from('repentances')
    .select('id, title, looking_back, realization, turning_promise, returning_note')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!record) notFound()

  return (
    <main>
      <PageHeader title="적은 내용 확인" backHref={`/repentance/${id}/write?step=returning`} />

      <div className="px-title-gutter pt-2">
        <h1 className="text-section font-semibold text-ink">
          {record.title || '제목 없는 기록'}
        </h1>
        <p className="text-body-sm mt-2 leading-[21px] text-ink-muted">
          저장하기 전에 한 번 읽어보세요. 고치고 싶으면 언제든 돌아갈 수 있어요.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-4 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
        >
          저장하지 못했어요. 기록은 그대로 남아 있습니다. 다시 시도해 주세요.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-row-gap px-gutter">
        {REPENTANCE_FLOW.map((step) => {
          const body = record[step.column]
          return (
            <section key={step.key} className="rounded-row bg-surface px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-caption font-medium text-accent">{step.label}</p>
                <Link
                  href={`/repentance/${id}/write?step=${step.key}`}
                  className="text-caption font-medium text-ink-muted"
                >
                  고치기
                </Link>
              </div>
              {body ? (
                <p className="text-body mt-2 whitespace-pre-wrap leading-[25px] text-ink">{body}</p>
              ) : (
                <p className="text-body-sm mt-2 leading-[21px] text-ink-faint">
                  {step.optional ? '비워둠' : '아직 적지 않음'}
                </p>
              )}
            </section>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 px-title-gutter">
        <form action={commitRepentance}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit">이대로 저장하기</Button>
        </form>
        <Link
          href={`/repentance/${id}/write?step=looking_back`}
          className="text-body-sm py-2 text-center font-medium text-ink-muted"
        >
          계속 수정하기
        </Link>
      </div>
    </main>
  )
}
