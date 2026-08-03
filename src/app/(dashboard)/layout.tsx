import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import SyncStatus from "@/components/ui/SyncStatus";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  return (
    <>
      <AppShell>{children}</AppShell>
      <SyncStatus />
    </>
  );
}
