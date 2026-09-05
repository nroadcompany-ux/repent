/**
 * SCR-RPT-ACT-002 — 실행 후속 선택.
 *
 * Exactly 5 choices, and none of them asks why the action did not happen. There
 * is no failure reason input on this screen by design, and "회개 기록으로 이동"
 * only opens the repentance flow — it never records repentance automatically.
 */

import Link from 'next/link';
import { FOLLOW_UP_CHOICES } from '@/domain/action/action';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState } from '@/ui/components/states';
import { FOLLOW_UP_LABELS } from '@/ui/labels';
import { chooseFollowUpAction } from '../actions';

export default async function FollowUpPage({
  searchParams,
}: {
  searchParams: Promise<{ actionId?: string }>;
}) {
  const { actionId } = await searchParams;

  if (!actionId) {
    return (
      <>
        <ScreenHeader title="다음 행동" screenId="SCR-RPT-ACT-002" />
        <main className="shell__main">
          <EmptyState title="선택할 실행 기록이 없습니다." />
          <div className="section">
            <Link href="/action" className="cta cta--secondary">
              실행으로 돌아가기
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="다음 행동"
        subtitle="계획과 달랐다면, 다음을 고르면 됩니다."
        screenId="SCR-RPT-ACT-002"
      />

      <main className="shell__main">
        <ul className="stack">
          {FOLLOW_UP_CHOICES.map((choice) => (
            <li key={choice}>
              <form action={chooseFollowUpAction} className="stack">
                <input type="hidden" name="actionId" value={actionId} />
                <input type="hidden" name="choice" value={choice} />
                {choice === 'reschedule' ? (
                  <input
                    type="date"
                    name="scheduledFor"
                    required
                    aria-label="새 일정"
                    style={{
                      minHeight: 'var(--touch-target)',
                      padding: '0 var(--space-3)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                ) : null}
                <button type="submit" className="cta cta--secondary">
                  {FOLLOW_UP_LABELS[choice]}
                </button>
              </form>
            </li>
          ))}
        </ul>

        <p className="note" style={{ marginTop: 'var(--space-5)' }}>
          계획과 달랐던 이유를 묻지 않습니다. 회개 기록은 직접 선택할 때만 열립니다.
        </p>

        <section className="section">
          <div className="stack">
            <Link href="/repentance" className="cta cta--secondary">
              회개 기록 열기
            </Link>
            <Link href="/action" className="cta cta--secondary">
              실행으로 돌아가기
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
