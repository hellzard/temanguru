import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  scheduled: "bg-sky-100 text-sky-800",
  invited: "bg-sky-100 text-sky-800",
  active: "bg-emerald-100 text-emerald-800",
  approved: "bg-emerald-100 text-emerald-800",
  finalized: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  returned: "bg-emerald-100 text-emerald-800",
  resolved: "bg-emerald-100 text-emerald-800",
  present: "bg-emerald-100 text-emerald-800",
  good: "bg-emerald-100 text-emerald-800",
  done: "bg-emerald-100 text-emerald-800",
  open: "bg-amber-100 text-amber-800",
  proposed: "bg-amber-100 text-amber-800",
  todo: "bg-amber-100 text-amber-800",
  fair: "bg-amber-100 text-amber-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  doing: "bg-indigo-100 text-indigo-800",
  ongoing: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-rose-100 text-rose-800",
  damaged: "bg-rose-100 text-rose-800",
  overdue: "bg-rose-100 text-rose-800",
  absent: "bg-rose-100 text-rose-800",
  suspended: "bg-rose-100 text-rose-800",
};

export function StatusPill({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize",
        tones[value] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {label ?? value.replaceAll("_", " ")}
    </span>
  );
}
