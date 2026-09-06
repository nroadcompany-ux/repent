import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { RecurrenceFields } from '../../_components/recurrence-fields'
import { deletePromise, updatePromise } from '../../actions'

export const dynamic = 'force-dynamic'

type EditablePromise = {
  id: string
  title: string
  group_id: string | null
  background: string | null
  purpose: string | null
  started_on: string
  due_date: string | null
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  repeat_weekdays?: number[]
}

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

  const [{ data: rawPromise }, { data: groups }] = await Promise.all([
    supabase.from('promises').select('*').eq('id', id).eq('user_id', userId).maybeSingle(),
    supabase.from('promise_groups').select('id, name').eq('user_id', userId).order('sort_order'),
  ])

  if (!rawPromise) notFound()
  const promise = rawPromise as unknown as EditablePromise

  return (
    <main>
      <PageHeader title="약속 수정" backHref={`/promise/${id}`} />

      <form action={updatePromise} className="px-title-gutter pt-4">
        <input type="hidden" name="id" value={id} />

        {error ? (
          <p role="alert" className="text-body-sm mb-5 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger">
            {error === 'title' ? '약속 내용을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        <p className="text-body-sm mb-6 leading-[21px] text-ink-muted">
          약속 자체가 실행할 일입니다. 별도의 실행 문장을 다시 만들지 않습니다.
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="title">약속</FieldLabel>
            <TextField id="title" name="title" defaultValue={promise.title} maxLength={100} required />
          </div>

          <div>
            <FieldLabel htmlFor="group_id">그룹</FieldLabel>
            <select id="group_id" name="group_id" defaultValue={promise.group_id ?? ''} className="h-control w-full rounded-control border border-line bg-surface px-4 text-value text-ink outline-none focus:border-accent">
              <option value="">그룹 없음</option>
              {(groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="started_on">시작일</FieldLabel>
              <TextField id="started_on" name="started_on" type="date" defaultValue={promise.started_on} required />
            </div>
            <div>
              <FieldLabel htmlFor="due_date">종료일 (선택)</FieldLabel>
              <TextField id="due_date" name="due_date" type="date" defaultValue={promise.due_date ?? ''} />
            </div>
          </div>

          <RecurrenceFields
            defaultType={promise.repeat_type ?? 'none'}
            defaultWeekdays={promise.repeat_weekdays ?? []}
          />

          <details className="rounded-row border border-line bg-surface px-4 py-3" open={Boolean(promise.background || promise.purpose)}>
            <summary className="text-body-sm cursor-pointer font-medium text-ink">배경·목적 메모 (선택)</summary>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <FieldLabel htmlFor="background">약속의 배경</FieldLabel>
                <TextArea id="background" name="background" rows={3} maxLength={2000} defaultValue={promise.background ?? ''} />
              </div>
              <div>
                <FieldLabel htmlFor="purpose">약속의 목적</FieldLabel>
                <TextArea id="purpose" name="purpose" rows={3} maxLength={2000} defaultValue={promise.purpose ?? ''} />
              </div>
            </div>
          </details>
        </div>

        <div className="mt-8">
          <Button type="submit">저장</Button>
        </div>
      </form>

      <form action={deletePromise} className="mt-4 px-title-gutter">
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="danger">약속 삭제</Button>
        <p className="text-caption mt-3 text-center leading-[20px] text-ink-faint">
          삭제하면 이 약속의 기존 이행 기록도 함께 사라집니다.
        </p>
      </form>
    </main>
  )
}
