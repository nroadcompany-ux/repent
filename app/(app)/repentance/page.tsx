import { AppHeader } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { Button } from '@/components/ui/control'
import { EmptyState } from '@/components/ui/state'
import { InfoRow, RowStack, SectionHeader } from '@/components/ui/surface'
import { formatMonthDay } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { startRepentance } from './actions'

export const dynamic = 'force-dynamic'

/**
 * Repentance Home.
 *
 * docs/03 Empty state: "판단 없는 시작 안내". Nothing on this screen counts
 * records, shows a rate, or suggests the member is behind. An unfinished draft
 * is offered as 이어쓰기 (docs/02), never as an outstanding task.
 */

const SLIDES: readonly EducationSlide[] = [
  {
    headline: ['돌아보는 일에', '정답은 없습니다'],
    body: ['천천히 적어두는 것만으로', '충분히 시작한 것입니다.'],
  },
  {
    headline: ['쓰다 멈춰도', '그대로 보관됩니다'],
    body: ['임시저장한 기록은 언제든', '이어서 쓸 수 있어요.'],
  },
]

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
          <Button type="submit">돌아보기 시작하기</Button>
        </form>
      </div>

      {drafts.length > 0 ? (
        <>
          <div className="mt-8">
            <SectionHeader title="쓰다 만 기록" subtitle="이어서 쓸 수 있어요" />
          </div>
          <div className="mt-[13px]">
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
          </div>
        </>
      ) : null}

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
                caption={record.turning_promise ?? '돌이킴 약속 없음'}
                href={`/repentance/${record.id}`}
              />
            ))}
          </RowStack>
        )}
      </div>
    </main>
  )
}
