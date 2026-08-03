import Link from "next/link";
import { Logo } from "@/components/logo";
import { dashboardNavigation } from "@/lib/navigation";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
      <Logo />
      <nav aria-label="Navigasi utama" className="mt-8 space-y-1">
        {dashboardNavigation.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
            <Icon size={19} aria-hidden="true" />{label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-950">
        <strong className="block">Mode pengembangan</strong>
        Hubungkan Supabase untuk memakai data nyata.
      </div>
    </aside>
  );
}
