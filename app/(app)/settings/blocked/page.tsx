import { PageHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { unblockAuthor } from '../../confession/actions'

export const dynamic = 'force-dynamic'

/** docs/08 Comment Safety: the member can block, and can undo a block. */
export default async function BlockedPage() {
  const { supabase, userId } = await requireUser()

  const { data: blocks } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', userId)

  const blockedIds = (blocks ?? []).map((block) => block.blocked_id)
  const { data: profiles } = blockedIds.length
    ? await supabase.from('community_profiles').select('id, display_name').in('id', blockedIds)
    : { data: [] }

  const nameById = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]))

  return (
    <main>
      <PageHeader title="차단한 사람" backHref="/settings" />

      {blockedIds.length === 0 ? (
        <p className="text-body-sm mt-4 px-title-gutter leading-[21px] text-ink-muted">
          차단한 사람이 없습니다.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-row-gap px-gutter">
          {blockedIds.map((blockedId) => (
            <li
              key={blockedId}
              className="flex items-center justify-between rounded-row bg-surface px-4 py-3"
            >
              <span className="text-value font-semibold text-ink">
                {nameById.get(blockedId) || '이름 없음'}
              </span>
              <form action={unblockAuthor}>
                <input type="hidden" name="user_id" value={blockedId} />
                <Button type="submit" variant="quiet" className="w-auto px-4">
                  차단 해제
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
