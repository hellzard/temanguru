"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createScheduleSchema = z.object({
  class_id: z.string().uuid("Pilih kelas yang valid."),
  subject_id: z.string().uuid("Pilih mata pelajaran yang valid."),
  day_of_week: z.coerce.number().min(1).max(7),
  starts_at: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid (HH:MM)."),
  ends_at: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid (HH:MM)."),
  room: z.string().trim().max(100, "Maksimal 100 karakter.").optional(),
});

export async function createSchedule(formData: FormData) {
  const parsed = createScheduleSchema.safeParse({
    class_id: formData.get("class_id"),
    subject_id: formData.get("subject_id"),
    day_of_week: formData.get("day_of_week"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    room: formData.get("room") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { class_id, subject_id, day_of_week, starts_at, ends_at, room } = parsed.data;

  // Basic time validation
  if (starts_at >= ends_at) {
    return { error: "Waktu mulai harus lebih awal dari waktu selesai." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) return { error: "Tidak memiliki akses ke sekolah." };

  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id")
    .eq("school_id", member.school_id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!activeYear) return { error: "Tidak ada tahun ajaran aktif." };

  // Step 1: Find or create teaching assignment
  let assignmentId: string | null = null;

  const { data: existingAssignment } = await supabase
    .from("teaching_assignments")
    .select("id")
    .eq("school_id", member.school_id)
    .eq("academic_year_id", activeYear.id)
    .eq("teacher_id", user.id)
    .eq("class_id", class_id)
    .eq("subject_id", subject_id)
    .limit(1)
    .maybeSingle();

  if (existingAssignment) {
    assignmentId = existingAssignment.id;
  } else {
    // Check if another teacher is already assigned to this class and subject in this year?
    // According to unique constraint (academic_year_id, teacher_id, class_id, subject_id), another teacher COULD technically teach the same subject to the same class. (e.g. Co-teaching). We'll allow it.
    
    const { data: newAssignment, error: assignmentError } = await supabase
      .from("teaching_assignments")
      .insert({
        school_id: member.school_id,
        academic_year_id: activeYear.id,
        teacher_id: user.id,
        class_id: class_id,
        subject_id: subject_id,
      })
      .select("id")
      .single();

    if (assignmentError) {
      console.error("createSchedule: assignment creation failed", assignmentError);
      return { error: "Gagal membuat penugasan mengajar." };
    }
    assignmentId = newAssignment.id;
  }

  // Step 2: Create schedule
  const { error: scheduleError } = await supabase
    .from("schedules")
    .insert({
      school_id: member.school_id,
      teaching_assignment_id: assignmentId,
      day_of_week: day_of_week,
      starts_at: starts_at,
      ends_at: ends_at,
      room: room || null,
    });

  if (scheduleError) {
    console.error("createSchedule: schedule creation failed", scheduleError);
    return { error: "Gagal menyimpan jadwal mengajar." };
  }

  revalidatePath("/schedules");
  return { success: true };
}
