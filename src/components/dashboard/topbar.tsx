import { Bell, Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { SyncStatus } from "./sync-status";
import { UserMenu } from "./user-menu";

export function Topbar() {
  return (
    <header className="tg-surface flex min-h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
      <div className="lg:hidden">
        <Logo compact />
        <span className="sr-only">Teman Guru</span>
      </div>
      <div className="hidden lg:block">
        <p className="text-sm tg-muted">Ruang kerja sekolah aktif</p>
      </div>
      <div className="flex items-center gap-2">
        <SyncStatus />
        <button
          aria-label="Buka notifikasi"
          className="grid size-11 place-items-center rounded-xl text-[var(--tg-text-muted)] hover:bg-[var(--tg-surface-muted)]"
        >
          <Bell size={20} />
        </button>
        <UserMenu />
        <button
          aria-label="Buka menu"
          className="grid size-11 place-items-center rounded-xl text-[var(--tg-text-muted)] lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
