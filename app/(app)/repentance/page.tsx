import Link from 'next/link'

import { AppHeader } from '@/components/layout/app-header'
import { EducationBanner, type EducationSlide } from '@/components/layout/education-banner'
import { ButtonLink } from '@/components/ui/control'
import { EmptyState } from '@/components/ui/state'
import { RecordList, RecordRow, SectionHeader } from '@/components/ui/surface'
import { formatFullDate, formatMonthDay } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'

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
      <AppHeader sticky />
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

      {/*
        Issue #21 §B: a plain link. Pressing this no longer writes anything —
        the row is created by the first save on /repentance/write.
      */}
      <div className="mt-7 px-title-gutter">
        <ButtonLink href="/repentance/write">회개하기</ButtonLink>
      </div>

      {/*
        Owner decision 2026-09-08. Drafts are secondary to 회개하기: one quiet
        row that expands in place. A native <details> means no new route, no
        client state and correct keyboard and screen-reader behaviour. With no
        drafts the row is not rendered at all — an unwritten record is not a
        thing to be reminded of.
      */}
      {drafts.length > 0 ? (
        <details className="mx-gutter mt-5 rounded-row bg-surface px-4">
          <summary className="text-body flex cursor-pointer items-center justify-between py-4 font-medium text-ink-muted">
            <span>작성 중인 기록 {drafts.length}개</span>
            <span aria-hidden="true" className="text-chevron text-ink-faint">
              ›
            </span>
          </summary>
          <ul className="border-t border-line py-1">
            {drafts.map((draft) => (
              <li key={draft.id}>
                <Link href={`/repentance/${draft.id}/write?step=looking_back`} className="block py-3">
                  <span className="text-body-sm block text-ink">{draft.title || '제목 없는 기록'}</span>
                  <span className="text-caption mt-[2px] block text-ink-faint">
                    {formatMonthDay(draft.updated_at.slice(0, 10))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="mt-8">
        <SectionHeader title="나의 회개 기록" subtitle="지난 돌이킴을 다시 읽어볼 수 있어요" />
      </div>

      <div className="mt-[13px]">
        {recorded.length === 0 ? (
          <EmptyState
            title="아직 남긴 기록이 없어요"
            description="잘 쓰지 않아도 됩니다. 마음에 걸리는 것 한 가지부터 적어보세요."
          />
        ) : (
          <RecordList>
            {recorded.map((record) => (
              <RecordRow
                key={record.id}
                meta={formatFullDate((record.recorded_at ?? record.created_at).slice(0, 10))}
                title={record.title || '제목 없는 기록'}
                caption={record.turning_promise}
                href={`/repentance/${record.id}`}
              />
            ))}
          </RecordList>
        )}
      </div>
    </main>
  )
}
