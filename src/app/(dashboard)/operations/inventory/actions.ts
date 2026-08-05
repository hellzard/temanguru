"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1, "Nama barang wajib diisi"),
  code: z.string().min(1, "Kode/Nomor seri wajib diisi"),
  category: z.enum(["electronics", "furniture", "sports", "books", "other"]),
  location: z.string().optional(),
  condition: z.enum(["good", "fair", "damaged"]),
});

export async function createInventoryItem(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createItemSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    category: formData.get("category") || "other",
    location: formData.get("location"),
    condition: formData.get("condition") || "good",
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const { error } = await supabase.from("inventory_items").insert({
    school_id: member.school_id,
    name: parsed.data.name,
    code: parsed.data.code,
    category: parsed.data.category,
    location: parsed.data.location,
    condition: parsed.data.condition,
    is_available: true
  });

  if (error) {
    if (error.code === '23505') { // unique violation
      return { success: false, message: "Kode barang sudah terdaftar" };
    }
    console.error("Create item error:", error);
    return { success: false, message: "Gagal menyimpan barang" };
  }

  revalidatePath("/operations/inventory");
  return { success: true, message: "Barang berhasil ditambahkan" };
}

const loanSchema = z.object({
  item_id: z.string().uuid(),
});

export async function borrowItem(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { data: member } = await supabase
    .from("school_members")
    .select("id, school_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = loanSchema.safeParse({
    item_id: formData.get("item_id"),
  });

  if (!parsed.success) return { success: false, message: "ID Barang tidak valid" };

  // Check if item is available
  const { data: item } = await supabase
    .from("inventory_items")
    .select("is_available")
    .eq("id", parsed.data.item_id)
    .single();
    
  if (!item || !item.is_available) {
    return { success: false, message: "Barang sedang tidak tersedia/dipinjam" };
  }

  // Update item availability
  await supabase.from("inventory_items").update({ is_available: false }).eq("id", parsed.data.item_id);

  // Insert loan
  const { error } = await supabase.from("inventory_loans").insert({
    school_id: member.school_id,
    item_id: parsed.data.item_id,
    borrower_id: member.id,
    status: "active"
  });

  if (error) {
    // rollback
    await supabase.from("inventory_items").update({ is_available: true }).eq("id", parsed.data.item_id);
    return { success: false, message: "Gagal mencatat peminjaman" };
  }

  revalidatePath("/operations/inventory");
  return { success: true, message: "Berhasil meminjam barang" };
}
