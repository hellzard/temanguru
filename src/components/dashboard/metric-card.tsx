import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon,
  helper,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  helper?: string;
}) {
  return (
    <article className="tg-card p-5">
      <span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]">
        <Icon size={21} aria-hidden="true" />
      </span>
      <p className="mt-5 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      {helper ? <p className="mt-2 text-xs tg-muted">{helper}</p> : null}
    </article>
  );
}
