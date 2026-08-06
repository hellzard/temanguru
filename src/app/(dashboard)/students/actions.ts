"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectWithMessage } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const studentSchema = z.object({
  display_name: z.string().trim().min(2).max(150),
  local_code: z.string().trim().max(80).optional(),
});

export async function createStudent(formData: FormData) {
  const parsed = studentSchema.safeParse({ display_name: formData.get("display_name"), local_code: formData.get("local_code") || undefined });
  if (!parsed.success) redirectWithMessage("/students", "error", "Nama murid belum valid.");
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("students").insert({ school_id: context.active.schoolId, display_name: parsed.data.display_name, local_code: parsed.data.local_code || null });
  if (error) redirectWithMessage("/students", "error", error.code === "23505" ? "Kode murid sudah digunakan." : "Murid belum berhasil disimpan.");
  revalidatePath("/students");
  redirectWithMessage("/students", "success", "Murid berhasil ditambahkan.");
}

const enrollmentSchema = z.object({ student_id: z.string().uuid(), class_id: z.string().uuid() });
export async function assignStudentToClass(formData: FormData) {
  const parsed = enrollmentSchema.safeParse({ student_id: formData.get("student_id"), class_id: formData.get("class_id") });
  if (!parsed.success) redirectWithMessage("/students", "error", "Murid atau kelas tidak valid.");
  await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("class_students").upsert({ class_id: parsed.data.class_id, student_id: parsed.data.student_id, joined_on: new Date().toISOString().slice(0, 10), left_on: null }, { onConflict: "class_id,student_id" });
  if (error) redirectWithMessage("/students", "error", "Murid belum berhasil dimasukkan ke kelas. Pastikan Anda mengajar kelas tersebut atau memiliki peran admin.");
  revalidatePath("/students");
  revalidatePath("/classes");
  redirectWithMessage("/students", "success", "Keanggotaan kelas berhasil disimpan.");
}

export async function setStudentInactive(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirectWithMessage("/students", "error", "Data murid tidak valid.");
  const context = await requireActiveSchool();
  if (!["owner", "admin"].includes(context.active.role)) redirectWithMessage("/students", "error", "Hanya owner atau admin yang dapat menonaktifkan murid.");
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ status: "inactive" }).eq("id", id.data).eq("school_id", context.active.schoolId);
  if (error) redirectWithMessage("/students", "error", "Status murid belum berhasil diperbarui.");
  revalidatePath("/students");
  redirectWithMessage("/students", "success", "Murid dipindahkan ke status tidak aktif.");
}
