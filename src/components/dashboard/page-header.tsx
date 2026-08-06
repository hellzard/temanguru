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
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold text-[var(--tg-primary)]">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--tg-text)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 tg-muted sm:text-base">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
