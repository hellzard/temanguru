"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const createItemSchema = z.object({
  name: z.string().trim().min(1, "Nama barang wajib diisi").max(180),
  code: z.string().trim().min(1, "Kode/Nomor seri wajib diisi").max(100),
  category: z.enum(["electronics", "furniture", "sports", "books", "other"]),
  location: z.string().trim().max(180).optional(),
  condition: z.enum(["good", "fair", "damaged"]),
});

export async function createInventoryItem(_prevState: unknown, formData: FormData) {
  try {
    const context = await requireActiveSchool();
    if (!["owner", "admin"].includes(context.active.role)) {
      return { success: false, message: "Hanya owner atau admin yang dapat menambah inventaris." };
    }

    const parsed = createItemSchema.safeParse({
      name: formData.get("name"),
      code: formData.get("code"),
      category: formData.get("category") || "other",
      location: formData.get("location") || undefined,
      condition: formData.get("condition") || "good",
    });
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0].message };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("inventory_items").insert({
      school_id: context.active.schoolId,
      name: parsed.data.name,
      code: parsed.data.code,
      category: parsed.data.category,
      location: parsed.data.location || null,
      condition: parsed.data.condition,
      is_available: true,
    });

    if (error?.code === "23505") {
      return { success: false, message: "Kode barang sudah terdaftar." };
    }
    if (error) {
      console.error("Create inventory item failed", { code: error.code });
      return { success: false, message: "Barang belum berhasil disimpan." };
    }

    revalidatePath("/operations/inventory");
    return { success: true, message: "Barang berhasil ditambahkan." };
  } catch (error) {
    console.error("Inventory context failed", error);
    return { success: false, message: "Ruang kerja sekolah belum dapat ditentukan." };
  }
}

const loanSchema = z.object({
  item_id: z.string().uuid(),
  idempotency_key: z.string().uuid().optional(),
});

export async function borrowItem(_prevState: unknown, formData: FormData) {
  try {
    await requireActiveSchool();
    const parsed = loanSchema.safeParse({
      item_id: formData.get("item_id"),
      idempotency_key: formData.get("idempotency_key") || undefined,
    });
    if (!parsed.success) return { success: false, message: "Data peminjaman tidak valid." };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("borrow_inventory_item", {
      p_item_id: parsed.data.item_id,
      p_idempotency_key: parsed.data.idempotency_key ?? randomUUID(),
      p_due_date: null,
    });

    if (error) {
      console.error("Borrow inventory failed", { code: error.code });
      return { success: false, message: error.message || "Barang belum dapat dipinjam." };
    }

    revalidatePath("/operations/inventory");
    return {
      success: true,
      message: "Berhasil meminjam barang.",
      loanId: typeof data === "string" ? data : undefined,
    };
  } catch (error) {
    console.error("Borrow context failed", error);
    return { success: false, message: "Ruang kerja sekolah belum dapat ditentukan." };
  }
}
