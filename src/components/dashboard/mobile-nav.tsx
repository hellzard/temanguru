import Link from "next/link";
import { BookOpenText, ClipboardCheck, GraduationCap, LayoutDashboard, MoreHorizontal } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/classes", label: "Kelas", icon: GraduationCap },
  { href: "/attendance", label: "Presensi", icon: ClipboardCheck },
  { href: "/journal", label: "Jurnal", icon: BookOpenText },
  { href: "/settings", label: "Lainnya", icon: MoreHorizontal },
];

export function MobileNav() {
  return (
    <nav
      aria-label="Navigasi utama seluler"
      className="tg-surface fixed inset-x-0 bottom-0 z-40 border-t px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-[var(--tg-text-muted)] hover:text-[var(--tg-primary)]"
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
