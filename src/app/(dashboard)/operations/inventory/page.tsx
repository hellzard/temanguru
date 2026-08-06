import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { InventoryClient, type InventoryItemView } from "./client";

export const metadata = {
  title: "Inventaris",
  robots: { index: false, follow: false },
};

export default async function InventoryPage() {
  const context = await requireActiveSchool();
  const supabase = await createClient();

  const [{ data: items, error: itemError }, { data: loans, error: loanError }] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("id,code,name,category,location,condition,quantity,is_available,created_at")
      .eq("school_id", context.active.schoolId)
      .order("created_at", { ascending: false }),
    supabase
      .from("inventory_loans")
      .select("id,item_id,borrower_id,status,borrowed_at,due_date")
      .eq("school_id", context.active.schoolId)
      .eq("status", "active")
      .order("borrowed_at", { ascending: true }),
  ]);

  if (itemError || loanError) throw itemError ?? loanError;

  const activeLoans = (loans ?? []) as Array<Record<string, unknown>>;
  const loansByItem = new Map<string, Array<Record<string, unknown>>>();
  for (const loan of activeLoans) {
    const itemId = String(loan.item_id);
    const bucket = loansByItem.get(itemId) ?? [];
    bucket.push(loan);
    loansByItem.set(itemId, bucket);
  }

  const rows: InventoryItemView[] = ((items ?? []) as Array<Record<string, unknown>>).map((item) => {
    const itemLoans = loansByItem.get(String(item.id)) ?? [];
    const quantity = Math.max(1, Number(item.quantity ?? 1));
    const ownLoan = itemLoans.find((loan) => String(loan.borrower_id) === context.active.id) ?? null;
    const manageableLoan = ownLoan ?? (['owner', 'admin'].includes(context.active.role) ? itemLoans[0] ?? null : null);

    return {
      ...item,
      quantity,
      activeCount: itemLoans.length,
      availableCount: Math.max(0, quantity - itemLoans.length),
      ownLoan,
      manageableLoan,
    };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <InventoryClient
        items={rows}
        canManage={["owner", "admin"].includes(context.active.role)}
      />
    </div>
  );
}
