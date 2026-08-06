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
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tg-primary)]">
            <span className="size-1.5 rounded-full bg-[var(--tg-primary)]" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--tg-text)] sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 tg-muted sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
