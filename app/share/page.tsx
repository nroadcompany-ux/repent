/**
 * SCR-RPT-SHR-001 / SCR-RPT-SHR-002 — 공유 항목 선택과 스냅샷 미리보기.
 *
 * Only the ticked fields leave the private source, the preview is exactly what
 * gets published, and the published snapshot is independent of the source from
 * that moment on.
 */

import Link from 'next/link';
import { asId } from '@/domain/shared/identity';
import { PRIVACY_LABELS } from '@/domain/confession/confession';
import { listShareableFields } from '@/usecase/sharing';
import { createContext } from '@/app-runtime/session';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { EmptyState, ErrorState } from '@/ui/components/states';
import { publishShareCopyAction } from './actions';
import { parseSourceType } from './source-type';

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ sourceId?: string; sourceType?: string }>;
}) {
  const { sourceId, sourceType: rawType } = await searchParams;
  const sourceType = parseSourceType(rawType);

  if (!sourceId || !sourceType) {
    return (
      <>
        <ScreenHeader title="나누기" screenId="SCR-RPT-SHR-001" />
        <main className="shell__main">
          <EmptyState title="공유할 기록을 선택해 주세요." />
          <div className="section">
            <Link href="/journey" className="cta cta--secondary">
              여정으로 돌아가기
            </Link>
          </div>
        </main>
      </>
    );
  }

  const result = await listShareableFields(createContext(), asId(sourceId), sourceType);

  if (!result.ok) {
    return (
      <>
        <ScreenHeader title="나누기" screenId="SCR-RPT-SHR-001" />
        <main className="shell__main">
          <ErrorState title="기록을 불러오지 못했습니다." />
        </main>
      </>
    );
  }

  if (result.value.length === 0) {
    return (
      <>
        <ScreenHeader title="나누기" screenId="SCR-RPT-SHR-001" />
        <main className="shell__main">
          <EmptyState title="공유할 수 있는 항목이 없습니다." />
        </main>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="나누기"
        subtitle="고른 항목만 나눠집니다."
        screenId="SCR-RPT-SHR-001"
      />

      <main className="shell__main">
        <form action={publishShareCopyAction} className="stack">
          <input type="hidden" name="sourceId" value={sourceId} />
          <input type="hidden" name="sourceType" value={sourceType} />

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="section__title">공유할 항목</legend>
            <div className="stack">
              {result.value.map((field) => (
                <label key={field.key} className="card" style={{ display: 'block' }}>
                  <span
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                  >
                    <input type="checkbox" name="field" value={field.key} />
                    <span className="card__meta">{field.label}</span>
                  </span>
                  <span className="card__body" style={{ display: 'block' }}>
                    {field.value}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* SCR-RPT-SHR-002 */}
          <fieldset
            style={{ border: 0, padding: 0, margin: 0 }}
            data-screen-id="SCR-RPT-SHR-002"
          >
            <legend className="section__title">공개 범위</legend>
            <div className="stack">
              <label className="segmented__item" style={{ justifyContent: 'flex-start' }}>
                <input
                  type="radio"
                  name="privacy"
                  value="masked"
                  defaultChecked
                  style={{ marginRight: 'var(--space-2)' }}
                />
                {PRIVACY_LABELS.masked}
              </label>
              <label className="segmented__item" style={{ justifyContent: 'flex-start' }}>
                <input
                  type="radio"
                  name="privacy"
                  value="named"
                  style={{ marginRight: 'var(--space-2)' }}
                />
                {PRIVACY_LABELS.named}
              </label>
            </div>
          </fieldset>

          <button type="submit" className="cta">
            이대로 나누기
          </button>
          <p className="note">
            나눈 기록은 원본과 분리된 사본입니다. 원본을 고쳐도 사본은 바뀌지 않습니다.
          </p>
        </form>
      </main>
    </>
  );
}
