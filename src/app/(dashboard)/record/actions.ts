"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const attendanceRecordSchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(["present", "sick", "permission", "absent", "late"]),
});

const classRecordSchema = z.object({
  assignment_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  attendance: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      const result = z.array(attendanceRecordSchema).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Struktur data presensi tidak valid" });
        return z.NEVER;
      }
      return result.data;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data presensi bukan JSON valid" });
      return z.NEVER;
    }
  }),
  topic: z.string().min(1, "Topik wajib diisi").max(500, "Maksimal 500 karakter"),
  activity_summary: z.string().max(5000, "Maksimal 5000 karakter").optional().default(""),
  reflection: z.string().max(5000, "Maksimal 5000 karakter").optional().default(""),
  obstacle: z.string().max(3000, "Maksimal 3000 karakter").optional().default(""),
  follow_up: z.string().max(3000, "Maksimal 3000 karakter").optional().default(""),
});

export async function saveClassRecord(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda belum masuk." };
  }

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) {
    return { error: "Akun Anda tidak aktif di sekolah mana pun." };
  }

  const parsed = classRecordSchema.safeParse({
    assignment_id: formData.get("assignment_id"),
    date: formData.get("date"),
    attendance: formData.get("attendance"),
    topic: formData.get("topic"),
    activity_summary: formData.get("activity_summary"),
    reflection: formData.get("reflection"),
    obstacle: formData.get("obstacle"),
    follow_up: formData.get("follow_up"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    assignment_id,
    date,
    attendance,
    topic,
    activity_summary,
    reflection,
    obstacle,
    follow_up
  } = parsed.data;

  // 1. Verify assignment belongs to user
  const { data: assignmentData } = await supabase
    .from("teaching_assignments")
    .select("id")
    .eq("id", assignment_id)
    .eq("teacher_id", user.id)
    .eq("school_id", member.school_id)
    .single();

  if (!assignmentData) {
    return { error: "Penugasan mengajar tidak ditemukan atau Anda tidak memiliki akses." };
  }

  // 2. UPSERT Attendance Session
  const { data: sessionData, error: sessionError } = await supabase
    .from("attendance_sessions")
    .upsert({
      school_id: member.school_id,
      teaching_assignment_id: assignment_id,
      session_date: date,
      state: "final",
      created_by: user.id
    }, {
      onConflict: "teaching_assignment_id, session_date"
    })
    .select("id")
    .single();

  if (sessionError || !sessionData) {
    return { error: `Gagal menyimpan sesi presensi: ${sessionError?.message}` };
  }

  const sessionId = sessionData.id;

  // 3. UPSERT Attendance Records
  if (attendance.length > 0) {
    const recordsPayload = attendance.map(a => ({
      attendance_session_id: sessionId,
      student_id: a.student_id,
      status: a.status
    }));

    const { error: recordsError } = await supabase
      .from("attendance_records")
      .upsert(recordsPayload, {
        onConflict: "attendance_session_id, student_id"
      });

    if (recordsError) {
      return { error: `Gagal menyimpan data presensi murid: ${recordsError.message}` };
    }
  }

  // 4. UPSERT Teaching Journal
  const { error: journalError } = await supabase
    .from("teaching_journals")
    .upsert({
      school_id: member.school_id,
      teaching_assignment_id: assignment_id,
      attendance_session_id: sessionId,
      journal_date: date,
      topic: topic,
      activity_summary: activity_summary || null,
      reflection: reflection || null,
      obstacle: obstacle || null,
      follow_up: follow_up || null,
      state: "final",
      created_by: user.id
    }, {
      onConflict: "teaching_assignment_id, journal_date"
    });

  if (journalError) {
    return { error: `Gagal menyimpan jurnal mengajar: ${journalError.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/record");

  return { success: true, message: "Catatan kelas berhasil disimpan." };
}
