import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-[var(--tg-surface-muted)] text-[var(--tg-text-muted)] ring-1 ring-inset ring-[var(--tg-border)]",
  success: "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400",
  danger: "bg-rose-500/10 text-rose-600 ring-1 ring-inset ring-rose-500/20 dark:text-rose-400",
} as const;

const dotTones = {
  neutral: "bg-current opacity-50",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
} as const;

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  dot?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {dot ? <span className={cn("size-1.5 shrink-0 rounded-full", dotTones[tone])} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
