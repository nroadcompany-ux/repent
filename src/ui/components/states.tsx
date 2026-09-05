/**
 * Shared Empty / Error / Loading states.
 *
 * Source: docs/final/08-screen-specification.md §3 Global Screen Rules —
 * empty and error are technical states only. No spiritual evaluation wording, no
 * encouragement framed as a verdict on the user's faith.
 */

export interface EmptyStateProps {
  readonly title: string;
  readonly body?: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="state" role="status">
      <p className="state__title">{title}</p>
      {body ? <p className="state__body">{body}</p> : null}
    </div>
  );
}

export interface ErrorStateProps {
  /** Technical failure message. Never an interpretation of the user's state. */
  readonly title?: string;
  readonly body?: string;
}

export function ErrorState({
  title = '불러오지 못했습니다.',
  body = '잠시 후 다시 시도해 주세요.',
}: ErrorStateProps) {
  return (
    <div className="state" role="alert">
      <p className="state__title">{title}</p>
      <p className="state__body">{body}</p>
    </div>
  );
}

export function LoadingState({ label = '불러오는 중' }: { readonly label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <p className="state__body">{label}</p>
    </div>
  );
}
