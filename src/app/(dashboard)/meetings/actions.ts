"use server";

import { requireActiveSchool } from "@/lib/schools/active-school";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createMeetingSchema = z.object({
  name: z.string().min(1, "Topik rapat wajib diisi"),
  location: z.string().optional(),
  date: z.string().min(1, "Tanggal rapat wajib diisi"),
  notes: z.string().optional(),
});

export async function createMeeting(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { active: member } = await requireActiveSchool();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createMeetingSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const { error } = await supabase.from("meetings").insert({
    school_id: member.schoolId,
    name: parsed.data.name,
    location: parsed.data.location,
    date: parsed.data.date,
    notes: parsed.data.notes,
    created_by: user.id,
  });

  if (error) {
    console.error("Create meeting error:", error);
    return { success: false, message: "Gagal membuat rapat" };
  }

  revalidatePath("/meetings");
  return { success: true, message: "Rapat berhasil dibuat" };
}

const createDecisionSchema = z.object({
  meeting_id: z.string().uuid(),
  decision: z.string().min(1, "Keputusan wajib diisi"),
});

export async function createMeetingDecision(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { active: member } = await requireActiveSchool();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createDecisionSchema.safeParse({
    meeting_id: formData.get("meeting_id"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const { error } = await supabase.from("meeting_decisions").insert({
    school_id: member.schoolId,
    meeting_id: parsed.data.meeting_id,
    decision: parsed.data.decision,
    status: "pending"
  });

  if (error) {
    console.error("Create decision error:", error);
    return { success: false, message: "Gagal menyimpan keputusan" };
  }

  revalidatePath("/meetings");
  return { success: true, message: "Keputusan rapat berhasil ditambahkan" };
}
