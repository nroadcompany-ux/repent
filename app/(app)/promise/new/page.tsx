import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { createPromise } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * 새 약속. docs/03 Home Primary CTA.
 *
 * `source` / `title` may arrive from Prayer or Repentance ("약속으로 남기기"),
 * which is the cross-domain loop in docs/01. The prefilled title is only a
 * suggestion — the member can rewrite it before saving.
 */
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
          <p
            role="alert"
            className="text-body-sm mb-5 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
          >
            {error === 'title' ? '약속 내용을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="title">어떤 약속인가요</FieldLabel>
            <TextField
              id="title"
              name="title"
              defaultValue={prefilledTitle ?? ''}
              maxLength={100}
              placeholder="예: 매일 아침 10분 말씀 읽기"
              required
            />
          </div>

          <div>
            <FieldLabel htmlFor="group_id">그룹</FieldLabel>
            <select
              id="group_id"
              name="group_id"
              className="h-control w-full rounded-control border border-line bg-surface px-4 text-value text-ink outline-none focus:border-accent"
            >
              <option value="">그룹 없음</option>
              {(groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="background">어떤 상황에서 하게 된 약속인가요 (선택)</FieldLabel>
            <TextArea
              id="background"
              name="background"
              rows={3}
              maxLength={2000}
              placeholder="나중에 다시 읽을 때 도움이 됩니다."
            />
          </div>

          <div>
            <FieldLabel htmlFor="purpose">무엇을 위한 약속인가요 (선택)</FieldLabel>
            <TextArea id="purpose" name="purpose" rows={3} maxLength={2000} />
          </div>

          <div>
            <FieldLabel htmlFor="due_date">기한 (선택)</FieldLabel>
            <TextField id="due_date" name="due_date" type="date" />
            <p className="text-caption mt-2 leading-[16px] text-ink-faint">
              기한을 정하면 남은 날짜와 지금까지의 기록을 함께 볼 수 있어요.
            </p>
          </div>

          <div>
            <FieldLabel htmlFor="daily_target">하루에 몇 번 하시겠어요</FieldLabel>
            <select
              id="daily_target"
              name="daily_target"
              defaultValue="1"
              className="h-control w-full rounded-control border border-line bg-surface px-4 text-value text-ink outline-none focus:border-accent"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  하루 {count}번
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <Button type="submit">약속 만들기</Button>
        </div>
      </form>
    </main>
  )
}
