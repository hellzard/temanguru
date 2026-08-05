"use server";

import { requireActiveSchool } from "@/lib/schools/active-school";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createTaskSchema = z.object({
  event_id: z.string().uuid(),
  title: z.string().min(1, "Judul tugas wajib diisi"),
  description: z.string().optional(),
});

export async function createEventTask(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { active: member } = await requireActiveSchool();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createTaskSchema.safeParse({
    event_id: formData.get("event_id"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const { error } = await supabase.from("event_tasks").insert({
    school_id: member.schoolId,
    event_id: parsed.data.event_id,
    title: parsed.data.title,
    description: parsed.data.description,
    status: "pending"
  });

  if (error) {
    console.error("Create task error:", error);
    return { success: false, message: "Gagal membuat tugas" };
  }

  revalidatePath(`/events/${parsed.data.event_id}`);
  return { success: true, message: "Tugas berhasil ditambahkan" };
}
