/**
 * SCR-RPT-CNF-001 — 고백 작성, and SCR-RPT-COM-001 — 공유 콘텐츠 목록.
 *
 * Types are exactly 기도 / 고백 / 은혜 / 일상 and privacy is exactly 3 options —
 * anonymous posting does not exist. The shared surface is chronological: there is
 * no popularity ordering, ranking or spiritual comparison anywhere on it.
 */

import {
  CONFESSION_TYPES,
  CONFESSION_TYPE_LABELS,
  PRIVACY_LABELS,
  PRIVACY_OPTIONS,
} from '@/domain/confession/confession';
import { listOwnConfessions, listSharedSurface } from '@/usecase/confession';
import { createContext, currentDisplayName } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { draftConfessionAction } from './actions';

export default async function ConfessionPage() {
  const ctx = createContext();
  const [own, shared] = await Promise.all([
    listOwnConfessions(ctx),
    listSharedSurface(ctx, () => currentDisplayName()),
  ]);

  return (
    <>
      <ScreenHeader
        title="고백"
        subtitle="공개 범위는 직접 고릅니다."
        screenId="SCR-RPT-CNF-001"
      />

      <main className="shell__main">
        <form action={draftConfessionAction} className="stack">
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="section__title">종류</legend>
            <div className="segmented">
              {CONFESSION_TYPES.map((type, index) => (
                <label key={type} className="segmented__item">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    defaultChecked={index === 0}
                    style={{ marginRight: 'var(--space-2)' }}
                  />
                  {CONFESSION_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="section__title" htmlFor="confession-content">
            내용
          </label>
          <textarea
            id="confession-content"
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

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="section__title">공개 범위</legend>
            <div className="stack">
              {PRIVACY_OPTIONS.map((option, index) => (
                <label key={option} className="segmented__item" style={{ justifyContent: 'flex-start' }}>
                  <input
                    type="radio"
                    name="privacy"
                    value={option}
                    defaultChecked={index === 0}
                    style={{ marginRight: 'var(--space-2)' }}
                  />
                  {PRIVACY_LABELS[option]}
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="cta">
            미리보기
          </button>
          <p className="note">게시 전에 미리보기로 확인합니다.</p>
        </form>

        <section className="section" aria-label="내 고백">
          <p className="section__title">내 기록</p>
          {!own.ok ? (
            <ErrorState />
          ) : own.value.length === 0 ? (
            <EmptyState title="아직 고백 기록이 없습니다." />
          ) : (
            <ul>
              {own.value.map((confession) => (
                <li key={confession.id} className="card">
                  <p className="card__meta">
                    {confession.day} · {CONFESSION_TYPE_LABELS[confession.type]} ·{' '}
                    {PRIVACY_LABELS[confession.privacy]}
                    {confession.lifecycle === 'draft' ? ' · 작성 중' : ''}
                  </p>
                  <p className="card__body">{confession.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* SCR-RPT-COM-001 */}
        <section className="section" aria-label="함께 나눈 기록" data-screen-id="SCR-RPT-COM-001">
          <p className="section__title">함께 나눈 기록</p>
          {!shared.ok ? (
            <ErrorState />
          ) : shared.value.length === 0 ? (
            <EmptyState title="아직 나눈 기록이 없습니다." />
          ) : (
            <ul>
              {shared.value.map(({ confession, displayName }) => (
                <li key={confession.id} className="card">
                  <p className="card__meta">
                    {confession.day} · {CONFESSION_TYPE_LABELS[confession.type]} · {displayName}
                  </p>
                  <p className="card__body">{confession.content}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="note" style={{ marginTop: 'var(--space-3)' }}>
            최신순으로만 보여집니다.
          </p>
        </section>
      </main>
    </>
  );
}
