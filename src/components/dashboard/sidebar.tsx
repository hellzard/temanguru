import Link from "next/link";
import { Logo } from "@/components/logo";
import { dashboardNavigation } from "@/lib/navigation";

export function Sidebar() {
  const appStage = process.env.NEXT_PUBLIC_APP_STAGE ?? process.env.VERCEL_ENV ?? "development";

  return (
    <aside className="tg-surface sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r p-5 lg:block">
      <Logo />
      <nav aria-label="Navigasi utama" className="mt-8 space-y-1 pb-5">
        {dashboardNavigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--tg-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--tg-primary)_10%,transparent)] hover:text-[var(--tg-primary)]"
          >
            <Icon size={19} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      {appStage !== "production" ? (
        <div className="rounded-2xl border border-[var(--tg-border)] bg-[var(--tg-surface-muted)] p-4 text-sm">
          <strong className="block">Lingkungan {appStage}</strong>
          Database lokal direkomendasikan untuk menguji migration dan RLS.
        </div>
      ) : null}
    </aside>
  );
}
