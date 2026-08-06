import Link from "next/link";
import { Building2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { SyncStatus } from "./sync-status";
import { UserMenu } from "./user-menu";

export function Topbar({ schoolName, multipleSchools }: { schoolName: string; multipleSchools: boolean }) {
  return (
    <header className="tg-glass-nav sticky top-0 z-30 flex min-h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
      <div className="lg:hidden">
        <Logo compact />
        <span className="sr-only">Teman Guru</span>
      </div>
      <div className="hidden min-w-0 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] tg-muted">Ruang kerja aktif</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--tg-primary-soft)] text-[var(--tg-primary)]">
            <Building2 size={15} aria-hidden="true" />
          </span>
          <p className="truncate text-sm font-bold">{schoolName}</p>
          {multipleSchools ? (
            <Link
              href="/school/select?change=1"
              className="rounded-full px-2 py-0.5 text-xs font-bold text-[var(--tg-primary)] transition hover:bg-[var(--tg-primary-soft)]"
            >
              Ganti
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SyncStatus />
        <UserMenu multipleSchools={multipleSchools} />
      </div>
    </header>
  );
}
