import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { deletePromise, updatePromise } from '../../actions'

export const dynamic = 'force-dynamic'

export default async function EditPromisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { id } = await params
  const { error } = await searchParams

  const [{ data: promise }, { data: groups }] = await Promise.all([
    supabase
      .from('promises')
      .select('id, title, group_id, background, purpose, due_date, daily_target')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('promise_groups').select('id, name').eq('user_id', userId).order('sort_order'),
  ])

  if (!promise) notFound()

  return (
    <main>
      <PageHeader title="약속 수정" backHref={`/promise/${id}`} />

      <form action={updatePromise} className="px-title-gutter pt-4">
        <input type="hidden" name="id" value={id} />

        {error ? (
          <p
            role="alert"
            className="text-body-sm mb-5 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
          >
            {error === 'title' ? '약속 내용을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="title">약속</FieldLabel>
            <TextField id="title" name="title" defaultValue={promise.title} maxLength={100} required />
          </div>

          <div>
            <FieldLabel htmlFor="group_id">그룹</FieldLabel>
            <select
              id="group_id"
              name="group_id"
              defaultValue={promise.group_id ?? ''}
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
            <FieldLabel htmlFor="background">약속의 배경</FieldLabel>
            <TextArea
              id="background"
              name="background"
              rows={3}
              maxLength={2000}
              defaultValue={promise.background ?? ''}
            />
          </div>

          <div>
            <FieldLabel htmlFor="purpose">약속의 목적</FieldLabel>
            <TextArea
              id="purpose"
              name="purpose"
              rows={3}
              maxLength={2000}
              defaultValue={promise.purpose ?? ''}
            />
          </div>

          <div>
            <FieldLabel htmlFor="due_date">기한</FieldLabel>
            <TextField id="due_date" name="due_date" type="date" defaultValue={promise.due_date ?? ''} />
          </div>

          <div>
            <FieldLabel htmlFor="daily_target">하루 횟수</FieldLabel>
            <select
              id="daily_target"
              name="daily_target"
              defaultValue={String(promise.daily_target)}
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
          <Button type="submit">저장</Button>
        </div>
      </form>

      <form action={deletePromise} className="mt-4 px-title-gutter">
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="danger">
          약속 삭제
        </Button>
        <p className="text-caption mt-3 text-center leading-[20px] text-ink-faint">
          삭제하면 이 약속의 실행 기록과 체크도 함께 사라집니다.
        </p>
      </form>
    </main>
  )
}
