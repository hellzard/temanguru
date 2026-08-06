import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300",
  scheduled: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-400",
  invited: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-400",
  active: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  approved: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  finalized: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  completed: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  returned: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  resolved: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  present: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  good: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  done: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  open: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
  proposed: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
  todo: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
  fair: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
  in_progress: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-400",
  doing: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-400",
  ongoing: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-400",
  cancelled: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400",
  damaged: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400",
  overdue: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400",
  absent: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400",
  suspended: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400",
};

export function StatusPill({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset",
        tones[value] ?? "bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300",
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden="true" />
      {label ?? value.replaceAll("_", " ")}
    </span>
  );
}
