import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/control'
import { CopyButton } from '@/components/ui/copy-button'
import { REPENTANCE_FLOW } from '@/domain/repentance'
import { formatFullDate } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { deleteRepentance, reopenRepentance } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * Saved repentance record.
 *
 * docs/02 lists the paths available after saving:
 *   복사하기 / 고백으로 나누기 / 약속 보기 / 여정으로 돌아가기
 * They are offered as options, never as a next required step.
 */
export default async function RepentanceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ just_saved?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { just_saved: justSaved } = await searchParams

  const { data: record } = await supabase
    .from('repentances')
    .select(
      'id, title, looking_back, realization, turning_promise, returning_note, state, recorded_at, created_at',
    )
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!record) notFound()

  const plainText = REPENTANCE_FLOW.map((step) => {
    const body = record[step.column]
    return body ? `[${step.label}]\n${body}` : null
  })
    .filter(Boolean)
    .join('\n\n')

  const recordedOn = (record.recorded_at ?? record.created_at).slice(0, 10)

  return (
    <main>
      <PageHeader title={record.title || '회개 기록'} backHref="/repentance" />

      {justSaved ? (
        <p className="text-body-sm mx-title-gutter mt-2 rounded-control bg-accent-tint px-4 py-3 leading-[18px] text-accent">
          기록을 마쳤습니다. 여기까지 온 것으로 충분합니다.
        </p>
      ) : null}

      <p className="text-body-sm mt-3 px-title-gutter text-ink-muted">{formatFullDate(recordedOn)}</p>

      <div className="mt-5 flex flex-col gap-row-gap px-gutter">
        {REPENTANCE_FLOW.map((step) => {
          const body = record[step.column]
          if (!body) return null
          return (
            <section key={step.key} className="rounded-row bg-surface px-4 py-4">
              <p className="text-caption font-medium text-accent">{step.label}</p>
              <p className="text-body mt-2 whitespace-pre-wrap leading-[22px] text-ink">{body}</p>
            </section>
          )
        })}
      </div>

      {/* docs/02 post-save paths */}
      <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 px-title-gutter">
        <CopyButton text={plainText} />
        <Link
          href={`/confession/write?source=repentance&sourceId=${id}`}
          className="text-body-sm font-medium text-accent"
        >
          고백으로 나누기
        </Link>
        {record.turning_promise ? (
          <Link
            href={`/promise/new?source=repentance&sourceId=${id}&title=${encodeURIComponent(record.turning_promise.slice(0, 60))}`}
            className="text-body-sm font-medium text-accent"
          >
            약속으로 남기기
          </Link>
        ) : null}
        <Link href="/journey" className="text-body-sm font-medium text-ink-muted">
          여정으로 돌아가기
        </Link>
      </div>

      <div className="mt-9 flex flex-col gap-3 px-title-gutter">
        <form action={reopenRepentance}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="quiet">
            이어서 고치기
          </Button>
        </form>
        <form action={deleteRepentance}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="danger">
            기록 삭제
          </Button>
        </form>
        <p className="text-caption mt-1 text-center leading-[17px] text-ink-faint">
          이 기록을 삭제해도, 이미 고백으로 나눈 글은 따로 남습니다.
        </p>
      </div>
    </main>
  )
}
