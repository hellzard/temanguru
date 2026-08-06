"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation, dashboardNavigationGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="mt-8 space-y-6 pb-5">
      {dashboardNavigationGroups.map((group) => (
        <div key={group}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tg-text-muted)]/70">
            {group}
          </p>
          <div className="mt-2 space-y-1">
            {dashboardNavigation
              .filter((item) => item.group === group)
              .map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname?.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "tg-nav-item flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--tg-text-muted)] hover:bg-[var(--tg-primary-soft)] hover:text-[var(--tg-primary)]",
                    )}
                  >
                    <Icon size={19} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}
