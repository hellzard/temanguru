"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectWithMessage } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const meetingSchema = z.object({ title: z.string().trim().min(2).max(220), agenda: z.string().max(5000).optional(), location: z.string().trim().max(220).optional(), starts_at: z.string().min(10), ends_at: z.string().optional() });
export async function createMeeting(formData: FormData) {
  const parsed = meetingSchema.safeParse({ title: formData.get("title"), agenda: formData.get("agenda") || undefined, location: formData.get("location") || undefined, starts_at: formData.get("starts_at"), ends_at: formData.get("ends_at") || undefined });
  if (!parsed.success) redirectWithMessage("/meetings", "error", parsed.error.issues[0].message);
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("meetings").insert({ school_id: context.active.schoolId, title: parsed.data.title, agenda: parsed.data.agenda || null, location: parsed.data.location || null, starts_at: new Date(parsed.data.starts_at).toISOString(), ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null, created_by: context.userId });
  if (error) redirectWithMessage("/meetings", "error", "Rapat belum berhasil dibuat.");
  revalidatePath("/meetings");
  redirectWithMessage("/meetings", "success", "Rapat berhasil dijadwalkan.");
}

const minutesSchema = z.object({ meeting_id: z.string().uuid(), minutes: z.string().max(20000), status: z.enum(["scheduled", "ongoing", "completed", "cancelled"]) });
export async function saveMeetingMinutes(formData: FormData) {
  const parsed = minutesSchema.safeParse({ meeting_id: formData.get("meeting_id"), minutes: formData.get("minutes") || "", status: formData.get("status") });
  if (!parsed.success) redirectWithMessage("/meetings", "error", "Notulen belum valid.");
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("meetings").update({ minutes: parsed.data.minutes || null, status: parsed.data.status }).eq("id", parsed.data.meeting_id).eq("school_id", context.active.schoolId);
  if (error) redirectWithMessage(`/meetings/${parsed.data.meeting_id}`, "error", "Notulen belum dapat disimpan.");
  revalidatePath(`/meetings/${parsed.data.meeting_id}`);
  redirectWithMessage(`/meetings/${parsed.data.meeting_id}`, "success", "Notulen dan status rapat diperbarui.");
}

const decisionSchema = z.object({ meeting_id: z.string().uuid(), decision: z.string().trim().min(2).max(2000), pic_id: z.string().uuid().optional(), due_on: z.string().date().optional() });
export async function createMeetingDecision(formData: FormData) {
  const parsed = decisionSchema.safeParse({ meeting_id: formData.get("meeting_id"), decision: formData.get("decision"), pic_id: formData.get("pic_id") || undefined, due_on: formData.get("due_on") || undefined });
  if (!parsed.success) redirectWithMessage("/meetings", "error", "Keputusan rapat belum valid.");
  const context = await requireActiveSchool();
  if (!["owner", "admin"].includes(context.active.role)) redirectWithMessage(`/meetings/${parsed.data.meeting_id}`, "error", "Hanya owner atau admin yang dapat mencatat keputusan resmi.");
  const supabase = await createClient();
  const { error } = await supabase.from("meeting_decisions").insert({ school_id: context.active.schoolId, meeting_id: parsed.data.meeting_id, decision: parsed.data.decision, pic_id: parsed.data.pic_id || null, due_on: parsed.data.due_on || null });
  if (error) redirectWithMessage(`/meetings/${parsed.data.meeting_id}`, "error", "Keputusan rapat belum tersimpan.");
  revalidatePath(`/meetings/${parsed.data.meeting_id}`);
  redirectWithMessage(`/meetings/${parsed.data.meeting_id}`, "success", "Keputusan rapat berhasil ditambahkan.");
}

const decisionStatusSchema = z.object({ meeting_id: z.string().uuid(), decision_id: z.string().uuid(), status: z.enum(["open", "in_progress", "done", "cancelled"]) });
export async function updateMeetingDecisionStatus(formData: FormData) {
  const parsed = decisionStatusSchema.safeParse({ meeting_id: formData.get("meeting_id"), decision_id: formData.get("decision_id"), status: formData.get("status") });
  if (!parsed.success) redirectWithMessage("/meetings", "error", "Status keputusan tidak valid.");
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("meeting_decisions").update({ status: parsed.data.status }).eq("id", parsed.data.decision_id).eq("meeting_id", parsed.data.meeting_id).eq("school_id", context.active.schoolId);
  if (error) redirectWithMessage(`/meetings/${parsed.data.meeting_id}`, "error", "Status keputusan belum dapat diperbarui.");
  revalidatePath(`/meetings/${parsed.data.meeting_id}`);
  redirectWithMessage(`/meetings/${parsed.data.meeting_id}`, "success", "Status keputusan diperbarui.");
}
