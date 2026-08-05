import { createClient } from "@/lib/supabase/server";
import { InventoryClient } from "./client";

export const metadata = {
  title: "Inventaris | Teman Guru",
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let items: Record<string, unknown>[] = [];

  if (user) {
    const { data: member } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("user_id", user.id)
      .single();

    if (member) {
      const { data } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("school_id", member.school_id)
        .order("created_at", { ascending: false });

      if (data) {
        items = data;
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <InventoryClient items={items} />
    </div>
  );
}
