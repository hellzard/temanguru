"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectWithMessage } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  school_name: z.string().trim().max(180).optional(),
  address: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  website: z.union([z.literal(""), z.string().url()]).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function saveBrandKit(formData: FormData) {
  const parsed = schema.safeParse({
    school_name: formData.get("school_name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    primary_color: formData.get("primary_color"),
    secondary_color: formData.get("secondary_color"),
  });
  if (!parsed.success) redirectWithMessage("/settings/brand-kit", "error", parsed.error.issues[0].message);

  const context = await requireActiveSchool();
  if (!["owner", "admin"].includes(context.active.role)) redirectWithMessage("/settings/brand-kit", "error", "Hanya owner atau admin yang dapat mengubah identitas sekolah.");
  const supabase = await createClient();
  const payload = Object.fromEntries(Object.entries(parsed.data).map(([key, value]) => [key, value || null]));
  const { error } = await supabase.from("brand_kits").upsert({ school_id: context.active.schoolId, ...payload }, { onConflict: "school_id" });
  if (error) redirectWithMessage("/settings/brand-kit", "error", "Brand kit belum berhasil disimpan.");
  revalidatePath("/settings/brand-kit");
  revalidatePath("/documents");
  redirectWithMessage("/settings/brand-kit", "success", "Brand kit sekolah berhasil disimpan.");
}
