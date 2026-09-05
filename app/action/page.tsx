/**
 * SCR-RPT-ACT-001 — 실행 작성 / 상세.
 *
 * An action that did not happen is not sin and is never labelled a failure here.
 * When the result differed from the plan the user goes to the follow-up screen
 * and picks their own next move.
 */

import Link from 'next/link';
import { listActions } from '@/usecase/action';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { FOLLOW_UP_LABELS } from '@/ui/labels';
import { completeActionAction, createActionAction } from './actions';

export default async function ActionPage() {
  const result = await listActions(createContext());

  return (
    <>
      <ScreenHeader title="실행" subtitle="계획과 달라도 괜찮습니다." screenId="SCR-RPT-ACT-001" />

      <main className="shell__main">
        <form action={createActionAction} className="stack">
          <label className="section__title" htmlFor="action-content">
            실행 내용
          </label>
          <textarea
            id="action-content"
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
            실행 기록 저장
          </button>
        </form>

        <section className="section" aria-label="실행 목록">
          <p className="section__title">기록</p>
          {!result.ok ? (
            <ErrorState />
          ) : result.value.length === 0 ? (
            <EmptyState title="아직 실행 기록이 없습니다." />
          ) : (
            <ul>
              {result.value.map((action) => (
                <li key={action.id} className="card">
                  <p className="card__meta">
                    {action.day}
                    {action.lifecycle === 'done' ? ' · 실행함' : ''}
                    {action.followUp ? ` · ${FOLLOW_UP_LABELS[action.followUp]}` : ''}
                  </p>
                  <p className="card__body">{action.content}</p>

                  <div className="stack" style={{ marginTop: 'var(--space-3)' }}>
                    {action.lifecycle === 'planned' ? (
                      <form action={completeActionAction}>
                        <input type="hidden" name="actionId" value={action.id} />
                        <button type="submit" className="cta">
                          실행함
                        </button>
                      </form>
                    ) : null}

                    <Link
                      href={{ pathname: '/action/follow-up', query: { actionId: action.id } }}
                      className="cta cta--secondary"
                    >
                      다음 행동 선택
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
