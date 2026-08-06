import type { ReactNode } from "react";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export function AppShell({
  children,
  schoolName,
  multipleSchools,
}: {
  children: ReactNode;
  schoolName: string;
  multipleSchools: boolean;
}) {
  return (
    <div className="tg-app-shell lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar schoolName={schoolName} multipleSchools={multipleSchools} />
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
