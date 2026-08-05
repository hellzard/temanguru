"use server";

import { requireActiveSchool } from "@/lib/schools/active-school";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createTicketSchema = z.object({
  title: z.string().min(1, "Judul laporan wajib diisi"),
  description: z.string().optional(),
  item_id: z.string().uuid().optional().or(z.literal("")),
});

export async function createMaintenanceTicket(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { active: member } = await requireActiveSchool();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createTicketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    item_id: formData.get("item_id"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const item_id = parsed.data.item_id && parsed.data.item_id.trim() !== "" ? parsed.data.item_id : null;

  const { error } = await supabase.from("maintenance_tickets").insert({
    school_id: member.schoolId,
    reporter_id: member.id,
    item_id,
    title: parsed.data.title,
    description: parsed.data.description,
    status: "open"
  });

  if (error) {
    console.error("Create ticket error:", error);
    return { success: false, message: "Gagal membuat laporan" };
  }

  revalidatePath("/operations/maintenance");
  return { success: true, message: "Laporan kerusakan berhasil dikirim" };
}
