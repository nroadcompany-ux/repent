import { PageHeader } from '@/components/layout/app-header'
import { Button, TextField } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { createPrayerFolder, deletePrayerFolder, renamePrayerFolder } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * 기도함 — the top level of the canonical hierarchy
 * 기도함 → 기도 제목 → 날짜별 기도 기록 (docs/01).
 */
export default async function PrayerFoldersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { error } = await searchParams

  // Independent reads — batched so the screen pays one round trip, not two.
  const [{ data: folders }, { data: topics }] = await Promise.all([
    supabase.from('prayer_folders').select('id, name').eq('user_id', userId).order('sort_order'),
    supabase.from('prayer_topics').select('folder_id').eq('user_id', userId),
  ])

  const countByFolder = new Map<string, number>()
  let unfiled = 0
  for (const topic of topics ?? []) {
    if (topic.folder_id) {
      countByFolder.set(topic.folder_id, (countByFolder.get(topic.folder_id) ?? 0) + 1)
    } else {
      unfiled += 1
    }
  }

  return (
    <main>
      <PageHeader title="기도함" backHref="/prayer" />

      <form action={createPrayerFolder} className="px-title-gutter pt-2">
        {error ? (
          <p
            role="alert"
            className="text-body-sm mb-4 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
          >
            {error === 'name' ? '기도함 이름을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
          </p>
        ) : null}

        <div className="flex gap-2">
          <TextField name="name" maxLength={40} placeholder="새 기도함 이름" required />
          <Button type="submit" className="w-auto shrink-0 px-5">
            추가
          </Button>
        </div>
      </form>

      <ul className="mt-7 flex flex-col gap-row-gap px-gutter">
        {(folders ?? []).map((folder) => (
          <li key={folder.id} className="rounded-row bg-surface px-4 py-4">
            <form action={renamePrayerFolder} className="flex gap-2">
              <input type="hidden" name="id" value={folder.id} />
              <TextField name="name" defaultValue={folder.name} maxLength={40} required />
              <Button type="submit" variant="quiet" className="w-auto shrink-0 px-4">
                저장
              </Button>
            </form>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-caption text-ink-muted">
                기도제목 {countByFolder.get(folder.id) ?? 0}개
              </p>
              <form action={deletePrayerFolder}>
                <input type="hidden" name="id" value={folder.id} />
                <button type="submit" className="text-caption font-medium text-ink-faint">
                  기도함 삭제
                </button>
              </form>
            </div>
          </li>
        ))}

        <li className="rounded-row bg-surface px-4 py-4">
          <p className="text-value font-semibold text-ink">기도함 없음</p>
          <p className="text-caption mt-[2px] text-ink-muted">기도제목 {unfiled}개</p>
        </li>
      </ul>

      <p className="text-caption mt-5 px-title-gutter text-center leading-[17px] text-ink-faint">
        기도함을 지워도 안에 있던 기도제목은 사라지지 않습니다.
      </p>
    </main>
  )
}
