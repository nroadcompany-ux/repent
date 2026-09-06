import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { deletePrayerTopic, updatePrayerTopic } from '../../../actions'

export const dynamic = 'force-dynamic'

export default async function EditPrayerTopicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params

  const { data: topic } = await supabase
    .from('prayer_topics')
    .select('id, title, kind, subject_name, body')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!topic) notFound()

  return (
    <main>
      <PageHeader title="기도제목 수정" backHref={`/prayer/topic/${id}`} />

      <form action={updatePrayerTopic} className="px-title-gutter pt-4">
        <input type="hidden" name="id" value={id} />

        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="title">기도제목</FieldLabel>
            <TextField id="title" name="title" defaultValue={topic.title} maxLength={80} required />
          </div>

          {topic.kind === 'intercession' ? (
            <div>
              <FieldLabel htmlFor="subject_name">누구를 위한 기도인가요</FieldLabel>
              <TextField
                id="subject_name"
                name="subject_name"
                defaultValue={topic.subject_name ?? ''}
                maxLength={40}
              />
            </div>
          ) : null}

          <div>
            <FieldLabel htmlFor="body">배경이나 마음</FieldLabel>
            <TextArea id="body" name="body" rows={6} maxLength={2000} defaultValue={topic.body ?? ''} />
          </div>
        </div>

        <div className="mt-8">
          <Button type="submit">저장</Button>
        </div>
      </form>

      <form action={deletePrayerTopic} className="mt-4 px-title-gutter">
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="danger">
          기도제목 삭제
        </Button>
        <p className="text-caption mt-3 text-center leading-[20px] text-ink-faint">
          삭제하면 이 제목에 남긴 기도 기록도 함께 사라집니다.
        </p>
      </form>
    </main>
  )
}
