import { redirect } from 'next/navigation'

import { BottomNav } from '@/components/layout/bottom-nav'
import { requireUser } from '@/lib/supabase/server'

/**
 * Shell for every signed-in surface.
 *
 * Middleware has already proven there is a session; this layout adds the
 * onboarding gate, which needs the profile row (docs/02: 앱 진입 → 로그인 →
 * Profile 입력 → 교회명/교단 → 약관 → 첫 시작 질문 3개 → Journey Home).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, userId } = await requireUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  return (
    <>
      <div className="pb-nav">{children}</div>
      <BottomNav />
    </>
  )
}
