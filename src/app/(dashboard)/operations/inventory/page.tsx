import { createClient } from "@/lib/supabase/server";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { InventoryClient } from "./client";

export const metadata = {
  title: "Inventaris | Teman Guru",
  robots: { index: false, follow: false },
};

export default async function InventoryPage() {
  const context = await requireActiveSchool();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("school_id", context.active.schoolId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <InventoryClient items={(data ?? []) as Record<string, unknown>[]} />
    </div>
  );
}
