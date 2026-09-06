import { AppHeader } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { Button } from '@/components/ui/control'
import { EmptyState } from '@/components/ui/state'
import { InfoRow, RowStack, SectionHeader } from '@/components/ui/surface'
import { formatMonthDay } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { startRepentance } from './actions'

export const dynamic = 'force-dynamic'

const SLIDES: readonly EducationSlide[] = [
  {
    headline: ['모든 사람이', '죄를 범했습니다'],
    body: ['로마서 3장 23절', '회개는 하나님께 다시 돌아가는 시작입니다.'],
  },
  {
    headline: ['하나님은', '거룩하십니다'],
    body: ['베드로전서 1장 16절', '있는 모습 그대로 돌아보고 하나님께 나아갑니다.'],
  },
]

function ExamplePill() {
  return (
    <span className="text-caption mr-1 inline-flex rounded-chip bg-accent-tint px-2 py-[2px] align-middle font-medium text-accent">
      예시
    </span>
  )
}

export default async function RepentancePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { saved, error } = await searchParams

  const { data: records } = await supabase
    .from('repentances')
    .select('id, title, state, recorded_at, created_at, updated_at, turning_promise')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  const drafts = (records ?? []).filter((row) => row.state === 'draft')
  const recorded = (records ?? []).filter((row) => row.state !== 'draft')

  return (
    <main>
      <AppHeader />
      <EducationBanner slides={SLIDES} />

      {saved === 'draft' ? (
        <p className="text-body-sm mx-title-gutter mt-5 rounded-control bg-accent-tint px-4 py-3 leading-[21px] text-accent">
          임시저장했어요. 언제든 이어서 쓸 수 있습니다.
        </p>
      ) : null}
      {saved === 'recorded' ? (
        <p className="text-body-sm mx-title-gutter mt-5 rounded-control bg-accent-tint px-4 py-3 leading-[21px] text-accent">
          회개 기록을 저장했어요.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-5 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
        >
          시작하지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}

      <div className="mt-7 px-title-gutter">
        <form action={startRepentance}>
          <Button type="submit">회개하기</Button>
        </form>
      </div>

      <div className="mt-8">
        <SectionHeader title="쓰다 만 기록" subtitle="이어서 쓸 수 있어요" />
      </div>
      <div className="mt-[13px]">
        {drafts.length > 0 ? (
          <RowStack>
            {drafts.map((draft) => (
              <InfoRow
                key={draft.id}
                label="이어쓰기"
                value={draft.title || '제목 없는 기록'}
                caption={`${formatMonthDay(draft.updated_at.slice(0, 10))} 임시저장`}
                href={`/repentance/${draft.id}/write?step=looking_back`}
              />
            ))}
          </RowStack>
        ) : (
          <RowStack>
            <InfoRow
              label={<ExamplePill />}
              value="화를 내고 후회한 일"
              caption="이런 식으로 제목을 붙여둘 수 있어요"
            />
            <InfoRow
              label={<ExamplePill />}
              value="약속을 지키지 못한 일"
              caption="예시는 실제 기록에 포함되지 않아요"
            />
            <InfoRow
              label={<ExamplePill />}
              value="마음속 미움을 내려놓고 싶은 일"
              caption="예시는 저장·검색·통계에 포함되지 않아요"
            />
          </RowStack>
        )}
      </div>

      <div className="mt-8">
        <SectionHeader title="지난 기록" subtitle="언제든 다시 읽어볼 수 있어요" />
      </div>

      <div className="mt-[13px]">
        {recorded.length === 0 ? (
          <EmptyState
            title="아직 남긴 기록이 없어요"
            description="잘 쓰지 않아도 됩니다. 마음에 걸리는 것 한 가지부터 적어보세요."
          />
        ) : (
          <RowStack>
            {recorded.map((record) => (
              <InfoRow
                key={record.id}
                label={formatMonthDay((record.recorded_at ?? record.created_at).slice(0, 10))}
                value={record.title || '제목 없는 기록'}
                caption={record.turning_promise ?? '저장된 회개 기록'}
                href={`/repentance/${record.id}`}
              />
            ))}
          </RowStack>
        )}
      </div>
    </main>
  )
}
