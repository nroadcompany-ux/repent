/**
 * SCR-RPT-JNY-002 — Turning Point 확인.
 *
 * AI may propose a candidate; only the user can confirm it. An unconfirmed
 * candidate is never displayed as a settled turning point.
 */

import Link from 'next/link';
import { viewJourney } from '@/usecase/journey';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { confirmTurningPointAction } from './actions';

export default async function TurningPointPage() {
  const result = await viewJourney(createContext(), 'all');

  if (!result.ok) {
    return (
      <>
        <ScreenHeader title="터닝포인트" screenId="SCR-RPT-JNY-002" />
        <main className="shell__main">
          <ErrorState />
        </main>
      </>
    );
  }

  const candidates = result.value.turningPoints.filter((point) => !point.confirmedByUser);
  const confirmed = result.value.turningPoints.filter((point) => point.confirmedByUser);

  return (
    <>
      <ScreenHeader
        title="터닝포인트"
        subtitle="확인은 본인만 할 수 있습니다."
        screenId="SCR-RPT-JNY-002"
      />

      <main className="shell__main">
        <section className="section">
          <p className="section__title">확인 대기</p>
          {candidates.length === 0 ? (
            <EmptyState title="확인할 후보가 없습니다." />
          ) : (
            <ul className="stack">
              {candidates.map((point) => (
                <li key={point.id} className="card">
                  <p className="card__meta">{point.day}</p>
                  <p className="card__body">{point.label}</p>
                  <form action={confirmTurningPointAction} style={{ marginTop: 'var(--space-3)' }}>
                    <input type="hidden" name="turningPointId" value={point.id} />
                    <button type="submit" className="cta">
                      확인
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <p className="section__title">확인함</p>
          {confirmed.length === 0 ? (
            <p className="note">아직 확인한 터닝포인트가 없습니다.</p>
          ) : (
            <ul className="stack">
              {confirmed.map((point) => (
                <li key={point.id} className="card">
                  <p className="card__meta">{point.day}</p>
                  <p className="card__body">{point.label}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <Link href="/journey" className="cta cta--secondary">
            여정으로 돌아가기
          </Link>
        </section>
      </main>
    </>
  );
}
