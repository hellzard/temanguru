import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="tg-animate-scale-in grid min-h-56 place-items-center rounded-[var(--tg-radius-lg)] border border-dashed border-[var(--tg-border)] bg-[var(--tg-surface-muted)] p-8 text-center">
      <div>
        <span className="tg-float mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--tg-primary-soft)] text-[var(--tg-primary)]">
          <Icon size={26} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg font-bold">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 tg-muted">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
