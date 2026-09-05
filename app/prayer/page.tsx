/**
 * SCR-RPT-PRY-001 — 기도 작성.
 *
 * Prayer Response Tracking is removed from the product: this screen has no
 * answered/pending state, no response rate and no prayer success/failure.
 * Recording a prayer and leaving is complete in itself.
 */

import Link from 'next/link';
import { isPrayerOnly } from '@/domain/prayer/prayer';
import { listPrayers } from '@/usecase/prayer';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { recordPrayerAction } from './actions';

export default async function PrayerPage() {
  const result = await listPrayers(createContext());

  return (
    <>
      <ScreenHeader title="기도" subtitle="기록하고 그대로 나가도 됩니다." screenId="SCR-RPT-PRY-001" />

      <main className="shell__main">
        <form action={recordPrayerAction} className="stack">
          <label className="section__title" htmlFor="prayer-content">
            기도 내용
          </label>
          <textarea
            id="prayer-content"
            name="content"
            rows={5}
            required
            style={{
              padding: 'var(--space-3)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              font: 'inherit',
              resize: 'vertical',
            }}
          />

          <label className="section__title" htmlFor="prayer-reflection">
            돌아보기 (선택)
          </label>
          <textarea
            id="prayer-reflection"
            name="reflection"
            rows={3}
            style={{
              padding: 'var(--space-3)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              font: 'inherit',
              resize: 'vertical',
            }}
          />

          <button type="submit" className="cta">
            기도 기록 저장
          </button>
          <p className="note">선택 항목은 비워 두어도 됩니다.</p>
        </form>

        <section className="section" aria-label="기도 기록">
          <p className="section__title">기록</p>
          {!result.ok ? (
            <ErrorState />
          ) : result.value.length === 0 ? (
            <EmptyState title="아직 기도 기록이 없습니다." />
          ) : (
            <ul>
              {result.value.map((prayer) => (
                <li key={prayer.id} className="card">
                  <p className="card__meta">
                    {prayer.day}
                    {isPrayerOnly(prayer) ? ' · 기도만 기록' : ''}
                  </p>
                  <p className="card__body">{prayer.content}</p>
                  {prayer.extensions.reflection ? (
                    <p className="note" style={{ marginTop: 'var(--space-2)' }}>
                      돌아보기 · {prayer.extensions.reflection}
                    </p>
                  ) : null}
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
