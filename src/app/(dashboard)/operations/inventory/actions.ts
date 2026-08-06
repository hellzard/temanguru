"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const createItemSchema = z.object({
  name: z.string().trim().min(1, "Nama barang wajib diisi").max(180),
  code: z.string().trim().min(1, "Kode barang wajib diisi").max(100),
  category: z.enum(["electronics", "furniture", "sports", "books", "other"]),
  location: z.string().trim().max(180).optional(),
  condition: z.enum(["good", "fair", "damaged"]),
  quantity: z.coerce.number().int().min(1).max(100000),
});

export async function createInventoryItem(_previous: unknown, formData: FormData) {
  try {
    const context = await requireActiveSchool();
    if (!["owner", "admin"].includes(context.active.role)) return { success: false, message: "Hanya owner atau admin yang dapat menambah inventaris." };
    const parsed = createItemSchema.safeParse({ name: formData.get("name"), code: formData.get("code"), category: formData.get("category") || "other", location: formData.get("location") || undefined, condition: formData.get("condition") || "good", quantity: formData.get("quantity") || 1 });
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    const supabase = await createClient();
    const { error } = await supabase.from("inventory_items").insert({ school_id: context.active.schoolId, ...parsed.data, location: parsed.data.location || null, is_available: parsed.data.condition !== "damaged" });
    if (error) return { success: false, message: error.code === "23505" ? "Kode barang sudah terdaftar." : "Barang belum berhasil disimpan." };
    revalidatePath("/operations/inventory");
    return { success: true, message: "Barang berhasil ditambahkan." };
  } catch (error) {
    console.error("createInventoryItem", error);
    return { success: false, message: "Ruang kerja sekolah belum dapat ditentukan." };
  }
}

export async function borrowItem(_previous: unknown, formData: FormData) {
  try {
    await requireActiveSchool();
    const itemId = z.string().uuid().safeParse(formData.get("item_id"));
    if (!itemId.success) return { success: false, message: "Barang tidak valid." };
    const supabase = await createClient();
    const { error } = await supabase.rpc("borrow_inventory_item", { p_item_id: itemId.data, p_idempotency_key: randomUUID(), p_due_date: null });
    if (error) {
      console.error("borrow_inventory_item", { code: error.code });
      return { success: false, message: error.message.includes("tidak tersedia") ? "Barang sedang tidak tersedia." : "Peminjaman belum berhasil." };
    }
    revalidatePath("/operations/inventory");
    return { success: true, message: "Barang berhasil dipinjam." };
  } catch (error) {
    console.error("borrowItem", error);
    return { success: false, message: "Peminjaman belum berhasil." };
  }
}

export async function returnItem(_previous: unknown, formData: FormData) {
  try {
    const loanId = z.string().uuid().safeParse(formData.get("loan_id"));
    if (!loanId.success) return { success: false, message: "Peminjaman tidak valid." };
    const supabase = await createClient();
    const { error } = await supabase.rpc("return_inventory_item", { p_loan_id: loanId.data });
    if (error) return { success: false, message: "Pengembalian belum berhasil." };
    revalidatePath("/operations/inventory");
    return { success: true, message: "Barang berhasil dikembalikan." };
  } catch (error) {
    console.error("returnItem", error);
    return { success: false, message: "Pengembalian belum berhasil." };
  }
}
