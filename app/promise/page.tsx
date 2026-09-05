/**
 * SCR-RPT-PRM-001 — 약속 작성 / 상세.
 *
 * A promise may have zero actions. There is no streak, no completion rate, and
 * an unkept promise is never framed as sin. Closing is the user's own
 * "마무리됨" decision.
 */

import Link from 'next/link';
import { promiseCloseLabel } from '@/domain/promise/promise';
import { listPromises } from '@/usecase/promise';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { createPromiseAction, finishPromiseAction } from './actions';

export default async function PromisePage() {
  const result = await listPromises(createContext());

  return (
    <>
      <ScreenHeader title="약속" subtitle="실행이 없어도 괜찮습니다." screenId="SCR-RPT-PRM-001" />

      <main className="shell__main">
        <form action={createPromiseAction} className="stack">
          <label className="section__title" htmlFor="promise-content">
            약속 내용
          </label>
          <textarea
            id="promise-content"
            name="content"
            rows={3}
            required
            style={{
              padding: 'var(--space-3)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              font: 'inherit',
              resize: 'vertical',
            }}
          />
          <button type="submit" className="cta">
            약속 기록 저장
          </button>
        </form>

        <section className="section" aria-label="약속 목록">
          <p className="section__title">기록</p>
          {!result.ok ? (
            <ErrorState />
          ) : result.value.length === 0 ? (
            <EmptyState title="아직 약속 기록이 없습니다." />
          ) : (
            <ul>
              {result.value.map((promise) => (
                <li key={promise.id} className="card">
                  <p className="card__meta">
                    {promise.day}
                    {promise.lifecycle === 'closed' ? ` · ${promiseCloseLabel()}` : ''}
                  </p>
                  <p className="card__body">{promise.content}</p>
                  {promise.lifecycle === 'active' ? (
                    <form action={finishPromiseAction} style={{ marginTop: 'var(--space-3)' }}>
                      <input type="hidden" name="promiseId" value={promise.id} />
                      <button type="submit" className="cta cta--secondary">
                        {promiseCloseLabel()}
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <Link href="/action" className="cta cta--secondary">
            실행 기록으로 이동
          </Link>
        </section>
      </main>
    </>
  );
}
