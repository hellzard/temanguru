import { BookOpenCheck } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 font-bold text-slate-950">
      <span className="grid size-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm"><BookOpenCheck aria-hidden="true" size={22} /></span>
      {!compact && <span>Teman Guru</span>}
    </div>
  );
}
