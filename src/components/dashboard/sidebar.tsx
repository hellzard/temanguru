import { Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export function Sidebar() {
  const appStage = process.env.NEXT_PUBLIC_APP_STAGE ?? process.env.VERCEL_ENV ?? "development";

  return (
    <aside className="tg-glass-nav sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r p-5 lg:block">
      <Logo />
      <SidebarNav />
      {appStage !== "production" ? (
        <div className="tg-card flex items-start gap-2.5 p-4 text-sm">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-[var(--tg-primary)]" aria-hidden="true" />
          <div>
            <strong className="block">Lingkungan {appStage}</strong>
            <span className="tg-muted">Database lokal direkomendasikan untuk menguji migration dan RLS.</span>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
