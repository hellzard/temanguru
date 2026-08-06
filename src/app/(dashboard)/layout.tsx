import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { resolveActiveSchool } from "@/lib/schools/active-school";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const context = await resolveActiveSchool();
  if (context.status === "unauthenticated") redirect("/login");
  if (context.status === "no-membership") redirect("/onboarding");
  if (context.status === "selection-required") redirect("/school/select");

  return (
    <AppShell schoolName={context.active.schoolName} multipleSchools={context.memberships.length > 1}>
      {children}
    </AppShell>
  );
}
