/**
 * SCR-RPT-SHR-003 — 원본 삭제 시 나눈 사본 처리 선택.
 *
 * Deleting a source never cascades on its own. When share copies exist the user
 * must choose keep or delete, and both choices are equally available.
 */

import Link from 'next/link';
import { asId } from '@/domain/shared/identity';
import { planSourceDeletion } from '@/usecase/sharing';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { deleteSourceAction } from '../actions';
import { parseSourceType } from '../source-type';

export default async function DeleteSourcePage({
  searchParams,
}: {
  searchParams: Promise<{ sourceId?: string; sourceType?: string }>;
}) {
  const { sourceId, sourceType: rawType } = await searchParams;
  const sourceType = parseSourceType(rawType);

  if (!sourceId || !sourceType) {
    return (
      <>
        <ScreenHeader title="기록 삭제" screenId="SCR-RPT-SHR-003" />
        <main className="shell__main">
          <EmptyState title="삭제할 기록을 선택해 주세요." />
        </main>
      </>
    );
  }

  const plan = await planSourceDeletion(createContext(), asId(sourceId), sourceType);

  if (!plan.ok) {
    return (
      <>
        <ScreenHeader title="기록 삭제" screenId="SCR-RPT-SHR-003" />
        <main className="shell__main">
          <ErrorState title="기록을 불러오지 못했습니다." />
        </main>
      </>
    );
  }

  const { affectedShareCopies, choiceRequired } = plan.value;

  return (
    <>
      <ScreenHeader
        title="기록 삭제"
        subtitle={choiceRequired ? '나눈 사본은 따로 선택합니다.' : undefined}
        screenId="SCR-RPT-SHR-003"
      />

      <main className="shell__main">
        {choiceRequired ? (
          <>
            <section className="section">
              <p className="section__title">나눈 사본 {affectedShareCopies.length}개</p>
              <ul>
                {affectedShareCopies.map((copy) => (
                  <li key={copy.id} className="card">
                    <p className="card__meta">
                      {copy.fields.map((field) => field.label).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="section">
              <div className="stack">
                <form action={deleteSourceAction}>
                  <input type="hidden" name="sourceId" value={sourceId} />
                  <input type="hidden" name="sourceType" value={sourceType} />
                  <input type="hidden" name="choice" value="keep_share_copies" />
                  <button type="submit" className="cta cta--secondary">
                    원본만 삭제하고 사본은 두기
                  </button>
                </form>

                <form action={deleteSourceAction}>
                  <input type="hidden" name="sourceId" value={sourceId} />
                  <input type="hidden" name="sourceType" value={sourceType} />
                  <input type="hidden" name="choice" value="delete_share_copies" />
                  <button type="submit" className="cta">
                    사본까지 함께 삭제
                  </button>
                </form>
              </div>
            </section>
          </>
        ) : (
          <>
            <EmptyState title="나눈 사본이 없습니다." body="원본만 삭제됩니다." />
            <section className="section">
              <form action={deleteSourceAction}>
                <input type="hidden" name="sourceId" value={sourceId} />
                <input type="hidden" name="sourceType" value={sourceType} />
                <input type="hidden" name="choice" value="keep_share_copies" />
                <button type="submit" className="cta">
                  삭제
                </button>
              </form>
            </section>
          </>
        )}

        <section className="section">
          <Link href="/journey" className="cta cta--secondary">
            취소
          </Link>
        </section>
      </main>
    </>
  );
}
