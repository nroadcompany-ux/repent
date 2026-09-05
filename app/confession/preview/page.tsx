/**
 * SCR-RPT-CNF-002 — 공개범위 / 미리보기.
 *
 * Preview shows exactly what a viewer would see before anything is published.
 * A masked post still belongs to a known owner — it is not an anonymous post.
 */

import Link from 'next/link';
import { PRIVACY_LABELS, PRIVACY_OPTIONS } from '@/domain/confession/confession';
import { asId } from '@/domain/shared/identity';
import { previewConfession } from '@/usecase/confession';
import { createContext, currentDisplayName } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { publishConfessionAction, setPrivacyAction } from '../actions';

export default async function ConfessionPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ confessionId?: string }>;
}) {
  const { confessionId } = await searchParams;

  if (!confessionId) {
    return (
      <>
        <ScreenHeader title="미리보기" screenId="SCR-RPT-CNF-002" />
        <main className="shell__main">
          <EmptyState title="미리볼 기록이 없습니다." />
        </main>
      </>
    );
  }

  const result = await previewConfession(createContext(), asId(confessionId), currentDisplayName());

  if (!result.ok) {
    return (
      <>
        <ScreenHeader title="미리보기" screenId="SCR-RPT-CNF-002" />
        <main className="shell__main">
          <ErrorState title="기록을 불러오지 못했습니다." />
        </main>
      </>
    );
  }

  const { confession, displayName, willReachSharedSurface } = result.value;

  return (
    <>
      <ScreenHeader
        title="미리보기"
        subtitle="이대로 보여집니다."
        screenId="SCR-RPT-CNF-002"
      />

      <main className="shell__main">
        <article className="card">
          <p className="card__meta">
            {confession.day} · {displayName}
          </p>
          <p className="card__body">{confession.content}</p>
        </article>

        <section className="section">
          <p className="section__title">공개 범위</p>
          <div className="stack">
            {PRIVACY_OPTIONS.map((option) => (
              <form key={option} action={setPrivacyAction}>
                <input type="hidden" name="confessionId" value={confession.id} />
                <input type="hidden" name="privacy" value={option} />
                <button
                  type="submit"
                  className="segmented__item"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  aria-current={confession.privacy === option}
                >
                  {PRIVACY_LABELS[option]}
                </button>
              </form>
            ))}
          </div>
          <p className="note" style={{ marginTop: 'var(--space-3)' }}>
            {willReachSharedSurface
              ? '함께 나눈 기록에 보여집니다.'
              : '나만 볼 수 있고, 함께 나눈 기록에는 보이지 않습니다.'}
          </p>
        </section>

        <section className="section">
          <div className="stack">
            <form action={publishConfessionAction}>
              <input type="hidden" name="confessionId" value={confession.id} />
              <button type="submit" className="cta">
                게시
              </button>
            </form>
            <Link href="/confession" className="cta cta--secondary">
              돌아가기
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
