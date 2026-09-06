import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { CopyButton } from '@/components/ui/copy-button'
import { requireUser } from '@/lib/supabase/server'
import { deletePrayerText, updatePrayerText } from '../../actions'

export const dynamic = 'force-dynamic'

export default async function PrayerTextPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { mode, error } = await searchParams

  const { data: prayerText } = await supabase
    .from('prayer_texts')
    .select('id, title, occasion, body')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!prayerText) notFound()

  const editing = mode === 'edit'

  return (
    <main>
      <PageHeader
        title={prayerText.title}
        backHref="/prayer?surface=texts"
        actions={
          editing ? undefined : (
            <Link href={`/prayer/text/${id}?mode=edit`} className="text-body font-medium text-accent">
              수정
            </Link>
          )
        }
      />

      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          저장하지 못했어요. 입력하신 내용은 그대로 있습니다. 다시 시도해 주세요.
        </p>
      ) : null}

      {editing ? (
        <>
          <form action={updatePrayerText} className="px-title-gutter pt-4">
            <input type="hidden" name="id" value={id} />
            <div className="flex flex-col gap-5">
              <div>
                <FieldLabel htmlFor="title">제목</FieldLabel>
                <TextField id="title" name="title" defaultValue={prayerText.title} maxLength={80} required />
              </div>
              <div>
                <FieldLabel htmlFor="occasion">언제 드리는 기도인가요</FieldLabel>
                <TextField
                  id="occasion"
                  name="occasion"
                  defaultValue={prayerText.occasion ?? ''}
                  maxLength={40}
                />
              </div>
              <div>
                <FieldLabel htmlFor="body">기도문</FieldLabel>
                <TextArea id="body" name="body" rows={16} maxLength={10000} defaultValue={prayerText.body} />
              </div>
            </div>
            <div className="mt-8">
              <Button type="submit">저장</Button>
            </div>
          </form>

          <form action={deletePrayerText} className="mt-4 px-title-gutter">
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="danger">
              기도문 삭제
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="px-title-gutter pt-2">
            {prayerText.occasion ? (
              <span className="text-caption rounded-chip bg-accent-tint px-[10px] py-[4px] font-medium text-accent">
                {prayerText.occasion}
              </span>
            ) : null}
          </div>

          <article className="mx-gutter mt-4 rounded-card bg-surface px-5 py-6">
            {prayerText.body ? (
              <p className="text-body whitespace-pre-wrap leading-[24px] text-ink">{prayerText.body}</p>
            ) : (
              <p className="text-body-sm leading-[18px] text-ink-muted">
                아직 내용이 비어 있어요. 수정에서 기도문을 적어보세요.
              </p>
            )}
          </article>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 px-title-gutter">
            <CopyButton text={prayerText.body} />
            <Link
              href={`/confession/write?source=prayer_topic&sourceId=${id}`}
              className="text-body-sm font-medium text-accent"
            >
              나누기
            </Link>
            <Link href="/prayer?surface=texts" className="text-body-sm font-medium text-ink-muted">
              목록
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
