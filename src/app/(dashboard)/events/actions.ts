"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createEventSchema = z.object({
  name: z.string().min(1, "Nama acara wajib diisi"),
  description: z.string().optional(),
  starts_at: z.string().min(1, "Tanggal mulai wajib diisi"),
  ends_at: z.string().optional(),
});

export async function createEvent(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createEventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const starts_at = new Date(parsed.data.starts_at).toISOString();
  let ends_at = null;
  if (parsed.data.ends_at && parsed.data.ends_at.trim() !== "") {
     ends_at = new Date(parsed.data.ends_at).toISOString();
  }

  const { error } = await supabase.from("events").insert({
    school_id: member.school_id,
    name: parsed.data.name,
    description: parsed.data.description,
    starts_at,
    ends_at,
    created_by: user.id,
    status: "draft"
  });

  if (error) {
    console.error("Create event error:", error);
    return { success: false, message: "Gagal membuat acara" };
  }

  revalidatePath("/events");
  return { success: true, message: "Acara berhasil dibuat" };
}
