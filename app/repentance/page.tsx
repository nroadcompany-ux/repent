/**
 * SCR-RPT-RPN-001 / SCR-RPT-RPN-002 — 회개 기록 흐름과 마치기.
 *
 * Optional Progressive Flow: every part below is optional, they carry no step
 * numbers, and the screen shows no progress bar, percentage or score. The final
 * action is exactly "회개 기록 마치기" — the wording "회개 완료" is never used,
 * because finishing the record is not a judgment that repentance is complete.
 */

import { repentanceFinalCta } from '@/domain/repentance/repentance';
import { listRepentanceRecords } from '@/usecase/repentance';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import {
  finishRepentanceAction,
  saveRepentancePartsAction,
  startRepentanceAction,
} from './actions';

const textareaStyle = {
  padding: 'var(--space-3)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius)',
  font: 'inherit',
  resize: 'vertical',
} as const;

export default async function RepentancePage() {
  const result = await listRepentanceRecords(createContext());

  if (!result.ok) {
    return (
      <>
        <ScreenHeader title="회개" screenId="SCR-RPT-RPN-001" />
        <main className="shell__main">
          <ErrorState />
        </main>
      </>
    );
  }

  const draft = result.value.find((record) => record.lifecycle === 'draft');
  const finished = result.value.filter((record) => record.lifecycle !== 'draft');

  return (
    <>
      <ScreenHeader
        title="회개"
        subtitle="원하는 만큼만 적어도 됩니다."
        screenId="SCR-RPT-RPN-001"
      />

      <main className="shell__main">
        {draft ? (
          <>
            <form action={saveRepentancePartsAction} className="stack">
              <input type="hidden" name="recordId" value={draft.id} />

              <label className="section__title" htmlFor="rpn-reflection">
                돌아보기 (선택)
              </label>
              <textarea
                id="rpn-reflection"
                name="reflection"
                rows={4}
                defaultValue={draft.parts.reflection ?? ''}
                style={textareaStyle}
              />

              <label className="section__title" htmlFor="rpn-confession">
                고백하기 (선택)
              </label>
              <textarea
                id="rpn-confession"
                name="confession"
                rows={4}
                defaultValue={draft.parts.confession ?? ''}
                style={textareaStyle}
              />

              <label className="section__title" htmlFor="rpn-turning">
                돌이킴 (선택)
              </label>
              <textarea
                id="rpn-turning"
                name="turning"
                rows={3}
                defaultValue={draft.parts.turning ?? ''}
                style={textareaStyle}
              />

              <button type="submit" className="cta cta--secondary">
                저장
              </button>
            </form>

            {/* SCR-RPT-RPN-002 */}
            <section className="section" data-screen-id="SCR-RPT-RPN-002">
              <form action={finishRepentanceAction}>
                <input type="hidden" name="recordId" value={draft.id} />
                <button type="submit" className="cta">
                  {repentanceFinalCta()}
                </button>
              </form>
              <p className="note" style={{ marginTop: 'var(--space-3)' }}>
                마치기는 기록을 남기는 것이며, 회개의 충분함을 판단하지 않습니다.
              </p>
            </section>
          </>
        ) : (
          <form action={startRepentanceAction}>
            <button type="submit" className="cta">
              회개 기록 시작
            </button>
          </form>
        )}

        <section className="section" aria-label="회개 기록">
          <p className="section__title">기록</p>
          {finished.length === 0 ? (
            <EmptyState title="아직 회개 기록이 없습니다." />
          ) : (
            <ul>
              {finished.map((record) => (
                <li key={record.id} className="card">
                  <p className="card__meta">{record.day}</p>
                  {record.parts.reflection ? (
                    <p className="card__body">{record.parts.reflection}</p>
                  ) : null}
                  {record.parts.confession ? (
                    <p className="note" style={{ marginTop: 'var(--space-2)' }}>
                      고백 · {record.parts.confession}
                    </p>
                  ) : null}
                  {record.parts.turning ? (
                    <p className="note" style={{ marginTop: 'var(--space-2)' }}>
                      돌이킴 · {record.parts.turning}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
