"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const attendanceRecordSchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(["present", "sick", "permission", "absent", "late"]),
});

const classRecordSchema = z.object({
  assignment_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  attendance: z.array(attendanceRecordSchema),
  topic: z.string().trim().min(1, "Topik wajib diisi").max(500),
  activity_summary: z.string().max(5000).default(""),
  reflection: z.string().max(5000).default(""),
  obstacle: z.string().max(3000).default(""),
  follow_up: z.string().max(3000).default(""),
});

const formSchema = z.object({
  assignment_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attendance: z.string().transform((value, context) => {
    try {
      const result = z.array(attendanceRecordSchema).safeParse(JSON.parse(value));
      if (!result.success) {
        context.addIssue({ code: "custom", message: "Struktur data presensi tidak valid" });
        return z.NEVER;
      }
      return result.data;
    } catch {
      context.addIssue({ code: "custom", message: "Data presensi bukan JSON valid" });
      return z.NEVER;
    }
  }),
  topic: z.string(),
  activity_summary: z.string().optional().default(""),
  reflection: z.string().optional().default(""),
  obstacle: z.string().optional().default(""),
  follow_up: z.string().optional().default(""),
}).transform((value, context) => {
  const result = classRecordSchema.safeParse(value);
  if (!result.success) {
    for (const issue of result.error.issues) {
      context.addIssue({ code: "custom", message: issue.message, path: issue.path });
    }
    return z.NEVER;
  }
  return result.data;
});

type ClassRecordInput = z.infer<typeof classRecordSchema>;

function stableUuid(parts: unknown[]): string {
  const digest = createHash("sha256")
    .update(JSON.stringify(parts))
    .digest("hex")
    .slice(0, 32)
    .split("");
  digest[12] = "5";
  digest[16] = ["8", "9", "a", "b"][Number.parseInt(digest[16], 16) % 4];
  return `${digest.slice(0, 8).join("")}-${digest.slice(8, 12).join("")}-${digest.slice(12, 16).join("")}-${digest.slice(16, 20).join("")}-${digest.slice(20).join("")}`;
}

function normalizeForIdempotency(input: ClassRecordInput) {
  return {
    ...input,
    attendance: [...input.attendance].sort((left, right) =>
      left.student_id.localeCompare(right.student_id),
    ),
  };
}

async function persistClassRecord(input: ClassRecordInput) {
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const idempotencyKey = stableUuid([
    "class-record-v2",
    context.userId,
    context.active.schoolId,
    normalizeForIdempotency(input),
  ]);

  const { data, error } = await supabase.rpc("save_class_record_transaction", {
    p_school_id: context.active.schoolId,
    p_assignment_id: input.assignment_id,
    p_session_date: input.date,
    p_attendance: input.attendance,
    p_topic: input.topic,
    p_activity_summary: input.activity_summary || null,
    p_reflection: input.reflection || null,
    p_obstacle: input.obstacle || null,
    p_follow_up: input.follow_up || null,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    console.error("Save class record RPC failed", { code: error.code });
    return { error: "Catatan kelas belum berhasil disimpan. Periksa penugasan dan coba kembali." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/record");
  return { success: true, message: "Catatan kelas berhasil disimpan.", data };
}

export async function saveClassRecord(_prevState: unknown, formData: FormData) {
  const parsed = formSchema.safeParse({
    assignment_id: formData.get("assignment_id"),
    date: formData.get("date"),
    attendance: formData.get("attendance"),
    topic: formData.get("topic"),
    activity_summary: formData.get("activity_summary") || "",
    reflection: formData.get("reflection") || "",
    obstacle: formData.get("obstacle") || "",
    follow_up: formData.get("follow_up") || "",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    return await persistClassRecord(parsed.data);
  } catch (error) {
    console.error("Class record context failed", error);
    return { error: "Ruang kerja sekolah belum dapat ditentukan." };
  }
}

export async function syncClassRecord(payload: ClassRecordInput) {
  const parsed = classRecordSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    return await persistClassRecord(parsed.data);
  } catch (error) {
    console.error("Class record sync failed", error);
    return { error: "Sinkronisasi belum berhasil." };
  }
}
