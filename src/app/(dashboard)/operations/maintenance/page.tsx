import { createClient } from "@/lib/supabase/server";
import { MaintenanceClient } from "./client";

export const metadata = {
  title: "Laporan Kerusakan | Teman Guru",
};

export default async function MaintenancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let tickets: Record<string, unknown>[] = [];
  let items: Record<string, unknown>[] = [];

  if (user) {
    const { data: member } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("user_id", user.id)
      .single();

    if (member) {
      const { data: tData } = await supabase
        .from("maintenance_tickets")
        .select("*")
        .eq("school_id", member.school_id)
        .order("created_at", { ascending: false });

      if (tData) {
        tickets = tData;
      }
      
      const { data: iData } = await supabase
        .from("inventory_items")
        .select("id, code, name")
        .eq("school_id", member.school_id);
        
      if (iData) {
        items = iData;
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MaintenanceClient tickets={tickets} items={items} />
    </div>
  );
}
