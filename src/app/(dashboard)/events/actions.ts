"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectWithMessage } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const eventSchema = z.object({
  title: z.string().trim().min(2).max(220),
  description: z.string().max(5000).optional(),
  location: z.string().trim().max(220).optional(),
  starts_at: z.string().min(10),
  ends_at: z.string().optional(),
  budget_limit: z.coerce.number().min(0).optional(),
});

export async function createEvent(formData: FormData) {
  const parsed = eventSchema.safeParse({ title: formData.get("title"), description: formData.get("description") || undefined, location: formData.get("location") || undefined, starts_at: formData.get("starts_at"), ends_at: formData.get("ends_at") || undefined, budget_limit: formData.get("budget_limit") || undefined });
  if (!parsed.success) redirectWithMessage("/events", "error", parsed.error.issues[0].message);
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({ school_id: context.active.schoolId, title: parsed.data.title, description: parsed.data.description || null, location: parsed.data.location || null, starts_at: new Date(parsed.data.starts_at).toISOString(), ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null, budget_limit: parsed.data.budget_limit ?? null, created_by: context.userId });
  if (error) redirectWithMessage("/events", "error", "Acara belum berhasil dibuat.");
  revalidatePath("/events");
  redirectWithMessage("/events", "success", "Draf acara berhasil dibuat.");
}

const taskSchema = z.object({ event_id: z.string().uuid(), title: z.string().trim().min(1).max(220), description: z.string().max(3000).optional(), assignee_id: z.string().uuid().optional(), due_at: z.string().optional() });
export async function createEventTask(formData: FormData) {
  const parsed = taskSchema.safeParse({ event_id: formData.get("event_id"), title: formData.get("title"), description: formData.get("description") || undefined, assignee_id: formData.get("assignee_id") || undefined, due_at: formData.get("due_at") || undefined });
  if (!parsed.success) redirectWithMessage("/events", "error", "Tugas acara belum valid.");
  const context = await requireActiveSchool();
  if (!["owner", "admin"].includes(context.active.role)) redirectWithMessage(`/events/${parsed.data.event_id}`, "error", "Hanya owner atau admin yang dapat membagi tugas acara.");
  const supabase = await createClient();
  const { error } = await supabase.from("event_tasks").insert({ school_id: context.active.schoolId, event_id: parsed.data.event_id, title: parsed.data.title, description: parsed.data.description || null, assignee_id: parsed.data.assignee_id || null, due_at: parsed.data.due_at ? new Date(parsed.data.due_at).toISOString() : null });
  if (error) redirectWithMessage(`/events/${parsed.data.event_id}`, "error", "Tugas acara belum tersimpan.");
  revalidatePath(`/events/${parsed.data.event_id}`);
  redirectWithMessage(`/events/${parsed.data.event_id}`, "success", "Tugas acara berhasil ditambahkan.");
}

const taskStatusSchema = z.object({ event_id: z.string().uuid(), task_id: z.string().uuid(), status: z.enum(["todo", "doing", "blocked", "done"]) });
export async function updateEventTaskStatus(formData: FormData) {
  const parsed = taskStatusSchema.safeParse({ event_id: formData.get("event_id"), task_id: formData.get("task_id"), status: formData.get("status") });
  if (!parsed.success) redirectWithMessage("/events", "error", "Status tugas tidak valid.");
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("event_tasks").update({ status: parsed.data.status }).eq("id", parsed.data.task_id).eq("event_id", parsed.data.event_id).eq("school_id", context.active.schoolId);
  if (error) redirectWithMessage(`/events/${parsed.data.event_id}`, "error", "Status tugas belum dapat diperbarui.");
  revalidatePath(`/events/${parsed.data.event_id}`);
  redirectWithMessage(`/events/${parsed.data.event_id}`, "success", "Status tugas diperbarui.");
}

const budgetSchema = z.object({ event_id: z.string().uuid(), category: z.string().trim().min(1).max(120), description: z.string().max(1000).optional(), planned_amount: z.coerce.number().min(0), actual_amount: z.coerce.number().min(0) });
export async function createEventBudget(formData: FormData) {
  const parsed = budgetSchema.safeParse({ event_id: formData.get("event_id"), category: formData.get("category"), description: formData.get("description") || undefined, planned_amount: formData.get("planned_amount") || 0, actual_amount: formData.get("actual_amount") || 0 });
  if (!parsed.success) redirectWithMessage("/events", "error", "Data anggaran belum valid.");
  const context = await requireActiveSchool();
  if (!["owner", "admin"].includes(context.active.role)) redirectWithMessage(`/events/${parsed.data.event_id}`, "error", "Hanya owner atau admin yang dapat mengubah anggaran.");
  const supabase = await createClient();
  const { error } = await supabase.from("event_budgets").insert({ school_id: context.active.schoolId, ...parsed.data, description: parsed.data.description || null });
  if (error) redirectWithMessage(`/events/${parsed.data.event_id}`, "error", "Anggaran belum tersimpan.");
  revalidatePath(`/events/${parsed.data.event_id}`);
  redirectWithMessage(`/events/${parsed.data.event_id}`, "success", "Anggaran acara berhasil ditambahkan.");
}
