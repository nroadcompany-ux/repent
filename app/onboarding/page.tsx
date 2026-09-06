import { redirect } from 'next/navigation'

import { LoopMark } from '@/components/brand/loop-mark'
import { Button, FieldLabel, TextArea, TextField } from '@/components/ui/control'
import { requireUser } from '@/lib/supabase/server'
import { saveChurchStep, saveProfileStep, saveQuestionsStep, saveTermsStep } from './actions'

/**
 * Onboarding. docs/02:
 *   로그인 → Profile 입력 → 교회명/교단 → 약관 → 첫 시작 질문 3개 → Journey Home
 *
 * The step is derived from what is already stored, so the flow resumes on its
 * own after an interruption. `?step=` only lets a member step forward to the
 * screen they are already entitled to.
 */

type Step = 'profile' | 'church' | 'terms' | 'questions'

const STEP_ORDER: Step[] = ['profile', 'church', 'terms', 'questions']

const ERRORS: Record<string, string> = {
  name: '이름 또는 닉네임을 입력해 주세요.',
  required: '필요한 항목을 입력해 주세요.',
  save: '저장하지 못했어요. 입력하신 내용은 그대로 있습니다. 다시 시도해 주세요.',
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string }>
}) {
  const { supabase, userId } = await requireUser()
  const { step: requestedStep, error } = await searchParams

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, church_name, denomination, terms_agreed_at, onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.onboarding_completed_at) redirect('/journey')

  // Furthest step the stored data justifies.
  const resumeStep: Step = !profile?.display_name
    ? 'profile'
    : !profile.church_name || !profile.denomination
      ? 'church'
      : !profile.terms_agreed_at
        ? 'terms'
        : 'questions'

  const asked = STEP_ORDER.includes(requestedStep as Step) ? (requestedStep as Step) : resumeStep
  // Never allow skipping ahead of what has actually been saved.
  const step =
    STEP_ORDER.indexOf(asked) <= STEP_ORDER.indexOf(resumeStep) ? asked : resumeStep

  const stepIndex = STEP_ORDER.indexOf(step) + 1

  return (
    <main className="flex min-h-dvh flex-col px-title-gutter pb-10 pt-16">
      <LoopMark width={64} />
      <p className="text-caption mt-6 font-medium text-accent">
        {stepIndex} / {STEP_ORDER.length}
      </p>

      {error ? (
        <p
          role="alert"
          className="text-body-sm mt-4 rounded-control bg-danger-tint px-4 py-3 leading-[18px] text-danger"
        >
          {ERRORS[error] ?? '다시 시도해 주세요.'}
        </p>
      ) : null}

      {step === 'profile' ? (
        <form action={saveProfileStep} className="mt-4 flex flex-1 flex-col">
          <h1 className="text-hero font-semibold text-ink">
            어떻게
            <br />
            불러드릴까요?
          </h1>
          <p className="text-body-sm mt-3 leading-[18px] text-ink-muted">
            고백 공간에서는 이 이름만 보입니다. 본명이 아니어도 괜찮아요.
          </p>
          <div className="mt-8">
            <FieldLabel htmlFor="display_name">이름 또는 닉네임</FieldLabel>
            <TextField
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name ?? ''}
              maxLength={20}
              placeholder="예: 은혜"
              required
            />
          </div>
          <div className="mt-auto pt-10">
            <Button type="submit">다음</Button>
          </div>
        </form>
      ) : null}

      {step === 'church' ? (
        <form action={saveChurchStep} className="mt-4 flex flex-1 flex-col">
          <h1 className="text-hero font-semibold text-ink">
            어느 교회에서
            <br />
            신앙생활 하시나요?
          </h1>
          <p className="text-body-sm mt-3 leading-[18px] text-ink-muted">
            교회명과 교단은 다른 사람에게 자동으로 공개되지 않습니다. 공개 여부는 나중에 직접 고를
            수 있어요.
          </p>
          <div className="mt-8 flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="church_name">교회명</FieldLabel>
              <TextField
                id="church_name"
                name="church_name"
                defaultValue={profile?.church_name ?? ''}
                maxLength={40}
                placeholder="예: 나로드교회"
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="denomination">교단</FieldLabel>
              <TextField
                id="denomination"
                name="denomination"
                defaultValue={profile?.denomination ?? ''}
                maxLength={40}
                placeholder="예: 예장합동"
                required
              />
            </div>
          </div>
          <div className="mt-auto pt-10">
            <Button type="submit">다음</Button>
          </div>
        </form>
      ) : null}

      {step === 'terms' ? (
        <form action={saveTermsStep} className="mt-4 flex flex-1 flex-col">
          <h1 className="text-hero font-semibold text-ink">
            시작하기 전에
            <br />
            확인해 주세요
          </h1>
          <div className="mt-8 flex flex-col gap-4">
            <label className="text-body flex items-start gap-3 text-ink">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-[2px] size-[18px] accent-accent"
              />
              <span>
                이용약관에 동의합니다.
                <span className="text-caption mt-1 block leading-[16px] text-ink-muted">
                  RETURN은 기록을 남기고 다시 돌아보는 공간입니다.
                </span>
              </span>
            </label>
            <label className="text-body flex items-start gap-3 text-ink">
              <input
                type="checkbox"
                name="privacy"
                required
                className="mt-[2px] size-[18px] accent-accent"
              />
              <span>
                개인정보 처리방침에 동의합니다.
                <span className="text-caption mt-1 block leading-[16px] text-ink-muted">
                  기도·회개·약속 기록은 기본적으로 나만 볼 수 있고, 공개는 내가 선택할 때만
                  이루어집니다.
                </span>
              </span>
            </label>
          </div>
          <div className="mt-auto pt-10">
            <Button type="submit">동의하고 계속</Button>
          </div>
        </form>
      ) : null}

      {step === 'questions' ? (
        <form action={saveQuestionsStep} className="mt-4 flex flex-1 flex-col">
          <h1 className="text-hero font-semibold text-ink">
            지금 마음은
            <br />
            어디쯤인가요?
          </h1>
          <p className="text-body-sm mt-3 leading-[18px] text-ink-muted">
            지금 쓰지 않아도 괜찮아요. 비워두고 넘어가도 됩니다.
          </p>
          <div className="mt-8 flex flex-col gap-6">
            <div>
              <FieldLabel htmlFor="q1_word">
                오늘 하나님께 듣고 싶은 말씀이 있나요? 또 하고 싶은 말은요?
              </FieldLabel>
              <TextArea id="q1_word" name="q1_word" rows={3} maxLength={1000} />
            </div>
            <div>
              <FieldLabel htmlFor="q2_walk">
                하나님께 마음을 드리고 있나요? 어떤 동행을 꿈꾸세요?
              </FieldLabel>
              <TextArea id="q2_walk" name="q2_walk" rows={3} maxLength={1000} />
            </div>
            <div>
              <FieldLabel htmlFor="q3_promise">
                하나님과 약속한 것이 있나요? 그 약속은 잘 지켜지고 있나요?
              </FieldLabel>
              <TextArea id="q3_promise" name="q3_promise" rows={3} maxLength={1000} />
            </div>
          </div>
          <div className="mt-auto pt-10">
            <Button type="submit">RETURN 시작하기</Button>
          </div>
        </form>
      ) : null}
    </main>
  )
}
