export interface ScreenHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  /** Screen ID from docs/final/08-screen-specification.md, for traceability. */
  readonly screenId: string;
}

export function ScreenHeader({ title, subtitle, screenId }: ScreenHeaderProps) {
  return (
    <header className="header" data-screen-id={screenId}>
      <h1 className="header__title">{title}</h1>
      {subtitle ? <p className="header__subtitle">{subtitle}</p> : null}
    </header>
  );
}
