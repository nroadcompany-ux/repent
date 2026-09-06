import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { EmptyState } from '@/components/ui/state'
import { formatMonthDay, todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { deleteScripture, saveScripture } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * 나의 말씀 (docs/01 Journey IA item 7).
 *
 * References plus the member's own note. Verse TEXT is not stored or displayed:
 * docs/04 allows full text only after the license is secured, and docs/10 keeps
 * Scripture Full Text License on HOLD.
 */
export default async function ScripturePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { error } = await searchParams

  const { data: scriptures } = await supabase
    .from('saved_scriptures')
    .select('id, reference, memo, saved_on')
    .eq('user_id', userId)
    .order('saved_on', { ascending: false })

  return (
    <main>
      <PageHeader title="나의 말씀" backHref="/journey" />

      <form action={saveScripture} className="px-title-gutter pt-2">
        {error ? (
          <p
            role="alert"
            className="text-body-sm mb-4 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
          >
            {error === 'reference' ? '말씀 위치를 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="reference">말씀 위치</FieldLabel>
            <TextField id="reference" name="reference" maxLength={60} placeholder="예: 요한복음 15:5" required />
          </div>
          <div>
            <FieldLabel htmlFor="memo">붙잡은 마음 (선택)</FieldLabel>
            <TextArea id="memo" name="memo" rows={3} maxLength={2000} />
          </div>
          <input type="hidden" name="saved_on" value={todayKst()} />
        </div>

        <div className="mt-5">
          <Button type="submit">말씀 담아두기</Button>
        </div>

        <p className="text-caption mt-3 leading-[19px] text-ink-faint">
          말씀 본문은 저작권 확인 전까지 앱에 저장하지 않습니다. 위치와 내 메모만 남습니다.
        </p>
      </form>

      <div className="mt-8">
        {(scriptures ?? []).length === 0 ? (
          <EmptyState
            title="아직 담아둔 말씀이 없어요"
            description="오늘 마음에 남은 한 구절부터 적어보세요."
          />
        ) : (
          <ul className="flex flex-col gap-row-gap px-gutter">
            {(scriptures ?? []).map((scripture) => (
              <li key={scripture.id} className="rounded-row bg-surface px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-caption font-medium text-accent">
                      {formatMonthDay(scripture.saved_on)}
                    </p>
                    <p className="text-value mt-[2px] font-semibold text-ink">{scripture.reference}</p>
                    {scripture.memo ? (
                      <p className="text-body-sm mt-2 whitespace-pre-wrap leading-[22px] text-ink-muted">
                        {scripture.memo}
                      </p>
                    ) : null}
                  </div>
                  <form action={deleteScripture}>
                    <input type="hidden" name="id" value={scripture.id} />
                    <button type="submit" className="text-caption shrink-0 font-medium text-ink-faint">
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
