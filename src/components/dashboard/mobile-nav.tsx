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
    <nav aria-label="Navigasi utama seluler" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
            <Icon size={20} aria-hidden="true" />{label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
