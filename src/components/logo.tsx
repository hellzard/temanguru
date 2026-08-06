import { BookOpenCheck } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 font-black text-[var(--tg-text)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--tg-primary),var(--tg-primary-strong))] text-white shadow-[var(--tg-shadow-glow)]">
        <BookOpenCheck aria-hidden="true" size={22} />
      </span>
      {!compact && <span className="text-[15px] tracking-tight">Teman Guru</span>}
    </div>
  );
}
