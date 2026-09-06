import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { todayKst } from '@/lib/date'
import { requireUser } from '@/lib/supabase/server'
import { RecurrenceFields } from '../_components/recurrence-fields'
import { createPromise } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewPromisePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; title?: string; source?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { error, title: prefilledTitle } = await searchParams

  const { data: groups } = await supabase
    .from('promise_groups')
    .select('id, name')
    .eq('user_id', userId)
    .order('sort_order')

  return (
    <main>
      <PageHeader title="새 약속" backHref="/promise" />

      <form action={createPromise} className="px-title-gutter pt-4">
        {error ? (
          <p role="alert" className="text-body-sm mb-5 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger">
            {error === 'title' ? '약속 내용을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        <p className="text-body-sm mb-6 leading-[21px] text-ink-muted">
          약속 자체가 실행할 일입니다. 같은 내용을 실행 목록에 다시 적지 않아도 됩니다.
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="title">어떤 약속인가요</FieldLabel>
            <TextField
              id="title"
              name="title"
              defaultValue={prefilledTitle ?? ''}
              maxLength={100}
              placeholder="예: 새벽예배 참석하기"
              required
            />
          </div>

          <div>
            <FieldLabel htmlFor="group_id">그룹</FieldLabel>
            <select id="group_id" name="group_id" className="h-control w-full rounded-control border border-line bg-surface px-4 text-value text-ink outline-none focus:border-accent">
              <option value="">그룹 없음</option>
              {(groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="started_on">시작일</FieldLabel>
              <TextField id="started_on" name="started_on" type="date" defaultValue={todayKst()} required />
            </div>
            <div>
              <FieldLabel htmlFor="due_date">종료일 (선택)</FieldLabel>
              <TextField id="due_date" name="due_date" type="date" />
            </div>
          </div>

          <RecurrenceFields />

          <details className="rounded-row border border-line bg-surface px-4 py-3">
            <summary className="text-body-sm cursor-pointer font-medium text-ink">배경·목적 메모 (선택)</summary>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <FieldLabel htmlFor="background">어떤 상황에서 하게 된 약속인가요</FieldLabel>
                <TextArea id="background" name="background" rows={3} maxLength={2000} />
              </div>
              <div>
                <FieldLabel htmlFor="purpose">무엇을 위한 약속인가요</FieldLabel>
                <TextArea id="purpose" name="purpose" rows={3} maxLength={2000} />
              </div>
            </div>
          </details>
        </div>

        <div className="mt-8">
          <Button type="submit">약속 만들기</Button>
        </div>
      </form>
    </main>
  )
}
