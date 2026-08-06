import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  icon: Icon,
  helper,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  helper?: string;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
}) {
  return (
    <article className="tg-card tg-card-accent group relative overflow-hidden p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "var(--tg-primary)" }}
      />
      <div className="relative flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-[var(--tg-primary-soft)] text-[var(--tg-primary)] transition-transform duration-300 group-hover:scale-110">
          <Icon size={21} aria-hidden="true" />
        </span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
              trend.direction === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              trend.direction === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              trend.direction === "neutral" && "bg-slate-500/10 text-slate-600 dark:text-slate-300",
            )}
          >
            {trend.direction === "up" ? <TrendingUp size={13} /> : trend.direction === "down" ? <TrendingDown size={13} /> : null}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="relative mt-5 text-2xl font-black tracking-tight tabular-nums">{value}</p>
      <p className="relative mt-1 text-sm font-semibold">{label}</p>
      {helper ? <p className="relative mt-2 text-xs tg-muted">{helper}</p> : null}
    </article>
  );
}
