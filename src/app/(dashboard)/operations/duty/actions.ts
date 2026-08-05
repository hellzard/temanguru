"use server";

import { requireActiveSchool } from "@/lib/schools/active-school";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createDutySchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  duty_type: z.enum(["morning_gate", "break_time", "after_school"]),
  member_id: z.string().uuid("Pilih guru piket"),
});

export async function createDutySchedule(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { active: member } = await requireActiveSchool();

  if (!member || member.role !== "admin") {
    return { success: false, message: "Hanya admin yang dapat menyusun jadwal" };
  }

  const parsed = createDutySchema.safeParse({
    date: formData.get("date"),
    duty_type: formData.get("duty_type"),
    member_id: formData.get("member_id"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const { error } = await supabase.from("duty_schedules").insert({
    school_id: member.schoolId,
    member_id: parsed.data.member_id,
    date: parsed.data.date,
    duty_type: parsed.data.duty_type,
    status: "scheduled"
  });

  if (error) {
    console.error("Create duty error:", error);
    return { success: false, message: "Gagal membuat jadwal piket" };
  }

  revalidatePath("/operations/duty");
  return { success: true, message: "Jadwal piket berhasil ditambahkan" };
}
