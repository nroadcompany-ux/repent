'use client';

import { ErrorState } from '@/ui/components/states';

/**
 * Shared error boundary. Technical failure only — the copy never interprets the
 * user's spiritual state (docs/final/08 §3).
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="shell__main">
      <ErrorState />
      <div className="section">
        <button type="button" className="cta cta--secondary" onClick={reset}>
          다시 시도
        </button>
      </div>
    </main>
  );
}
