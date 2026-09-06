import Link from 'next/link'

import { PageHeader } from '@/components/layout/app-header'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { AI_MEMORY_DEFAULT_ON, PROFILE_GALLERY_MAX } from '@/domain/product-lock'
import { featureFlags } from '@/lib/env.server'
import { requireUser } from '@/lib/supabase/server'
import { setAiMemoryConsent, updateProfile } from './actions'

export const dynamic = 'force-dynamic'

/**
 * 내 정보.
 *
 * [OPEN — NO FIGMA SOURCE] The approved Figma frame has no profile or settings
 * entry point (its header carries only 검색 / 달력). This screen exists because
 * canonical docs/04 and docs/07 require member-controlled church visibility,
 * profile fields, and an AI Memory switch; its visual treatment is built from
 * existing tokens and is awaiting an Owner-approved frame.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { saved, error } = await searchParams

  const [{ data: profile }, { data: consent }, { count: blockedCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, church_name, denomination, church_info_public, bio, profile_visibility')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('ai_memory_consent').select('enabled').eq('user_id', userId).maybeSingle(),
    supabase
      .from('user_blocks')
      .select('blocked_id', { count: 'exact', head: true })
      .eq('blocker_id', userId),
  ])

  // Absence of a row means OFF (AC-10).
  const aiMemoryEnabled = consent?.enabled ?? AI_MEMORY_DEFAULT_ON

  return (
    <main>
      <PageHeader title="내 정보" backHref="/journey" />

      {saved ? (
        <p className="text-body-sm mx-title-gutter mt-2 rounded-control bg-accent-tint px-4 py-3 leading-[18px] text-accent">
          저장했어요.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="text-body-sm mx-title-gutter mt-2 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          {error === 'name' ? '이름을 입력해 주세요.' : '저장하지 못했어요. 다시 시도해 주세요.'}
        </p>
      ) : null}

      <form action={updateProfile} className="px-title-gutter pt-4">
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="display_name">이름 또는 닉네임</FieldLabel>
            <TextField
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name ?? ''}
              maxLength={20}
              required
            />
            <p className="text-caption mt-2 leading-[16px] text-ink-faint">
              고백 공간에서는 이 이름만 보입니다.
            </p>
          </div>

          <div>
            <FieldLabel htmlFor="church_name">교회명</FieldLabel>
            <TextField
              id="church_name"
              name="church_name"
              defaultValue={profile?.church_name ?? ''}
              maxLength={40}
            />
          </div>

          <div>
            <FieldLabel htmlFor="denomination">교단</FieldLabel>
            <TextField
              id="denomination"
              name="denomination"
              defaultValue={profile?.denomination ?? ''}
              maxLength={40}
            />
          </div>

          <label className="text-body flex items-start gap-3 text-ink">
            <input
              type="checkbox"
              name="church_info_public"
              defaultChecked={profile?.church_info_public ?? false}
              className="mt-[2px] size-[18px] accent-accent"
            />
            <span>
              교회명과 교단을 다른 사람에게 보여주기
              <span className="text-caption mt-1 block leading-[16px] text-ink-muted">
                켜지 않으면 아무에게도 보이지 않습니다. 기본은 꺼짐입니다.
              </span>
            </span>
          </label>

          <label className="text-body flex items-start gap-3 text-ink">
            <input
              type="checkbox"
              name="profile_public"
              defaultChecked={profile?.profile_visibility === 'public'}
              className="mt-[2px] size-[18px] accent-accent"
            />
            <span>
              프로필을 공개하기
              <span className="text-caption mt-1 block leading-[16px] text-ink-muted">
                사진은 최대 {PROFILE_GALLERY_MAX}장까지 올릴 수 있고, 교인 인증 수단이 아닙니다.
              </span>
            </span>
          </label>

          <div>
            <FieldLabel htmlFor="bio">소개 (선택)</FieldLabel>
            <TextArea id="bio" name="bio" rows={3} maxLength={300} defaultValue={profile?.bio ?? ''} />
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit">저장</Button>
        </div>
      </form>

      <section className="mt-9 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">AI 기록 참고</h2>
        <form action={setAiMemoryConsent} className="mt-3">
          <label className="text-body flex items-start gap-3 text-ink">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={aiMemoryEnabled}
              className="mt-[2px] size-[18px] accent-accent"
            />
            <span>
              지난 기록을 참고해서 도와주기
              <span className="text-caption mt-1 block leading-[16px] text-ink-muted">
                기본은 꺼짐입니다. 켜지 않으면 기도와 회개 기록은 AI에게 전달되지 않습니다. 언제든
                다시 끌 수 있어요.
              </span>
            </span>
          </label>
          <div className="mt-4">
            <Button type="submit" variant="quiet">
              저장
            </Button>
          </div>
        </form>
        <p className="text-caption mt-3 leading-[16px] text-ink-faint">
          AI는 죄 여부, 회개의 충분함, 용서, 하나님의 뜻을 판단하지 않습니다. 고백 공간에는 AI가
          쓰이지 않습니다.
          {featureFlags.aiAssist ? '' : ' (AI 도움 기능은 아직 준비 중입니다.)'}
        </p>
      </section>

      <section className="mt-9 px-title-gutter">
        <h2 className="text-section font-semibold text-ink">안전</h2>
        <Link href="/settings/blocked" className="text-body-sm mt-3 block font-medium text-accent">
          차단한 사람 {blockedCount ?? 0}명
        </Link>
      </section>

      <div className="mt-9 px-title-gutter">
        <form action="/auth/signout" method="POST">
          <Button type="submit" variant="quiet">
            로그아웃
          </Button>
        </form>
      </div>
    </main>
  )
}
