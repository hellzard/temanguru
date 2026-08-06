import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="tg-animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--tg-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.04em] text-[var(--tg-text)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--tg-text-muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
