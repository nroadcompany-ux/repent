import { PageHeader } from '@/components/layout/app-header'
import { Button, TextField } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { renamePromiseGroup } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * 약속 그룹 이름 (Owner decision 2026-09-08).
 *
 * 나의 삶 / 사람과 관계 / 신앙생활 are an initial value, not wording the member
 * has to accept. This screen only renames: creating, deleting and reordering
 * were not asked for, and inventing them here would be adding product rather
 * than answering the decision.
 *
 * It needs no migration. promise_groups has been per-user since 0002, with
 * `name text not null` rather than an enum and RLS on auth.uid(), so a rename
 * is a plain UPDATE that reaches nobody else. promises.group_id is a foreign
 * key to the row, not to the name, so renaming regroups nothing.
 *
 * The layout follows /prayer/folders, which already solves this exact problem.
 */
export default async function PromiseGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { error, saved } = await searchParams

  const [{ data: groups }, { data: promises }] = await Promise.all([
    supabase
      .from('promise_groups')
      .select('id, name')
      .eq('user_id', userId)
      .order('sort_order'),
    supabase.from('promises').select('group_id').eq('user_id', userId),
  ])

  const countByGroup = new Map<string, number>()
  let ungrouped = 0
  for (const promise of promises ?? []) {
    if (promise.group_id) {
      countByGroup.set(promise.group_id, (countByGroup.get(promise.group_id) ?? 0) + 1)
    } else {
      ungrouped += 1
    }
  }

  return (
    <main>
      <PageHeader title="약속 그룹" backHref="/promise" />

      <div className="px-title-gutter pt-1">
        {/* [ADMIN CANDIDATE] promise.groups.intro */}
        <p className="text-body-sm leading-[21px] text-ink-muted">
          그룹 이름은 처음 만들어 드린 것일 뿐이에요. 내가 쓰는 말로 바꿔도 됩니다.
        </p>
      </div>

      {saved ? (
        <p className="text-body-sm mx-title-gutter mt-4 rounded-control bg-accent-tint px-4 py-3 leading-[21px] text-accent">
          이름을 바꿨어요.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-4 rounded-control bg-danger-tint px-4 py-3 leading-[21px] text-danger"
        >
          {error === 'name' ? '그룹 이름을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
        </p>
      ) : null}

      {(groups ?? []).length === 0 ? (
        <p className="text-body-sm mx-gutter mt-7 rounded-card bg-surface px-4 py-5 leading-[21px] text-ink-muted">
          아직 약속 그룹이 없어요. 약속을 만들 때 그룹을 고르면 여기에 나타납니다.
        </p>
      ) : (
        <ul className="mt-7 flex flex-col gap-row-gap px-gutter">
          {(groups ?? []).map((group) => (
            <li key={group.id} className="rounded-row bg-surface px-4 py-4">
              <form action={renamePromiseGroup} className="flex gap-2">
                <input type="hidden" name="id" value={group.id} />
                <TextField name="name" defaultValue={group.name} maxLength={40} required />
                <Button type="submit" variant="quiet" className="w-auto shrink-0 px-4">
                  저장
                </Button>
              </form>
              <p className="text-caption mt-2 text-ink-muted">
                약속 {countByGroup.get(group.id) ?? 0}개
              </p>
            </li>
          ))}

          <li className="rounded-row bg-surface px-4 py-4">
            <p className="text-value font-semibold text-ink">그룹 없음</p>
            <p className="text-caption mt-[2px] text-ink-muted">약속 {ungrouped}개</p>
          </li>
        </ul>
      )}

      <p className="text-caption mt-5 px-title-gutter text-center leading-[20px] text-ink-faint">
        이름을 바꿔도 그 안의 약속은 그대로 있습니다. 바꾼 이름은 나에게만 보입니다.
      </p>
    </main>
  )
}
