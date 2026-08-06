"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, ClipboardCheck, GraduationCap, LayoutDashboard, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/classes", label: "Kelas", icon: GraduationCap },
  { href: "/attendance", label: "Presensi", icon: ClipboardCheck },
  { href: "/journal", label: "Jurnal", icon: BookOpenText },
  { href: "/settings", label: "Lainnya", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama seluler"
      className="fixed inset-x-3 bottom-3 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="tg-glass-nav mx-auto flex max-w-md items-center justify-between rounded-2xl border px-1.5 py-1.5 shadow-[var(--tg-shadow-lg)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold text-[var(--tg-text-muted)] transition-all duration-200",
                active && "bg-[var(--tg-primary-soft)] text-[var(--tg-primary)]",
              )}
            >
              <Icon size={19} aria-hidden="true" className={cn("transition-transform", active && "scale-110")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
