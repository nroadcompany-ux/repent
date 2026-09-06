import { PageHeader } from '@/components/layout/app-header'
import { REPENTANCE_FLOW } from '@/domain/repentance'
import { requireUser } from '@/lib/supabase/server'
import type { ShareSourceKind } from '@/lib/supabase/database.types'
import { ShareCopyComposer, type SourceField } from './_components/composer'

export const dynamic = 'force-dynamic'

/**
 * Write / ShareCopy entry.
 *
 * With no `source`, this is a plain post. With one, it loads the member's own
 * private record and offers its fields for selection — read through the
 * RLS-bound client, so a source id that is not theirs simply returns nothing.
 */

const SOURCE_KINDS: readonly ShareSourceKind[] = [
  'repentance',
  'prayer_record',
  'prayer_topic',
  'promise',
  'action_record',
]

export default async function ConfessionWritePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; sourceId?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { source, sourceId, error } = await searchParams

  const sourceKind = (SOURCE_KINDS as readonly string[]).includes(source ?? '')
    ? (source as ShareSourceKind)
    : undefined

  let fields: SourceField[] = []
  let sourceLabel: string | undefined

  if (sourceKind && sourceId) {
    if (sourceKind === 'repentance') {
      const { data } = await supabase
        .from('repentances')
        .select('title, looking_back, realization, turning_promise, returning_note')
        .eq('id', sourceId)
        .eq('user_id', userId)
        .maybeSingle()

      if (data) {
        sourceLabel = data.title || '회개 기록'
        fields = REPENTANCE_FLOW.flatMap((step) => {
          const body = data[step.column]
          return body ? [{ key: step.key, label: step.label, body }] : []
        })
      }
    }

    if (sourceKind === 'prayer_topic') {
      const { data } = await supabase
        .from('prayer_topics')
        .select('title, body')
        .eq('id', sourceId)
        .eq('user_id', userId)
        .maybeSingle()

      if (data) {
        sourceLabel = data.title
        fields = [
          { key: 'title', label: '기도제목', body: data.title },
          ...(data.body ? [{ key: 'body', label: '기도 배경', body: data.body }] : []),
        ]
      } else {
        // The link may also point at a 기도문 written for 대표기도.
        const { data: prayerText } = await supabase
          .from('prayer_texts')
          .select('title, body')
          .eq('id', sourceId)
          .eq('user_id', userId)
          .maybeSingle()

        if (prayerText) {
          sourceLabel = prayerText.title
          fields = [
            { key: 'title', label: '제목', body: prayerText.title },
            ...(prayerText.body ? [{ key: 'body', label: '기도문', body: prayerText.body }] : []),
          ]
        }
      }
    }

    if (sourceKind === 'promise') {
      const { data } = await supabase
        .from('promises')
        .select('title, background, purpose')
        .eq('id', sourceId)
        .eq('user_id', userId)
        .maybeSingle()

      if (data) {
        sourceLabel = data.title
        fields = [
          { key: 'title', label: '약속', body: data.title },
          ...(data.background ? [{ key: 'background', label: '배경', body: data.background }] : []),
          ...(data.purpose ? [{ key: 'purpose', label: '목적', body: data.purpose }] : []),
        ]
      }
    }
  }

  return (
    <main>
      <PageHeader title={sourceKind ? '기록에서 나누기' : '고백 나누기'} backHref="/confession" />

      {sourceKind && fields.length === 0 ? (
        <p className="text-body-sm mx-title-gutter mt-2 rounded-control bg-canvas px-4 py-3 leading-[18px] text-ink-muted">
          원본 기록을 불러오지 못했어요. 아래에 직접 적어서 나눌 수 있습니다.
        </p>
      ) : null}

      <ShareCopyComposer
        userId={userId}
        sourceKind={fields.length > 0 ? sourceKind : undefined}
        sourceId={fields.length > 0 ? sourceId : undefined}
        sourceLabel={sourceLabel}
        fields={fields}
        initialType={sourceKind === 'repentance' ? 'confession' : sourceKind === 'prayer_topic' ? 'prayer' : 'daily'}
        error={error}
      />
    </main>
  )
}
