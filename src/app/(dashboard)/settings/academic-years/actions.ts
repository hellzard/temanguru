"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectWithMessage } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ name: z.string().trim().min(3).max(40), starts_on: z.string().date(), ends_on: z.string().date() }).refine((v) => v.ends_on >= v.starts_on, { message: "Tanggal akhir harus setelah tanggal mulai" });
export async function createAcademicYear(formData: FormData) {
  const parsed = schema.safeParse({ name: formData.get("name"), starts_on: formData.get("starts_on"), ends_on: formData.get("ends_on") });
  if (!parsed.success) redirectWithMessage("/settings/academic-years", "error", parsed.error.issues[0].message);
  const context = await requireActiveSchool();
  if (!['owner','admin'].includes(context.active.role)) redirectWithMessage("/settings/academic-years", "error", "Hanya owner atau admin yang dapat mengubah tahun ajaran.");
  const supabase = await createClient();
  const { error } = await supabase.from("academic_years").insert({ school_id: context.active.schoolId, ...parsed.data });
  if (error) redirectWithMessage("/settings/academic-years", "error", error.code === "23505" ? "Nama tahun ajaran sudah ada." : "Tahun ajaran belum tersimpan.");
  revalidatePath("/settings/academic-years");
  redirectWithMessage("/settings/academic-years", "success", "Tahun ajaran berhasil dibuat.");
}

export async function activateAcademicYear(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirectWithMessage("/settings/academic-years", "error", "Tahun ajaran tidak valid.");
  const context = await requireActiveSchool();
  if (!['owner','admin'].includes(context.active.role)) redirectWithMessage("/settings/academic-years", "error", "Izin tidak mencukupi.");
  const supabase = await createClient();
  const { error: resetError } = await supabase.from("academic_years").update({ is_active: false }).eq("school_id", context.active.schoolId);
  if (resetError) redirectWithMessage("/settings/academic-years", "error", "Status tahun ajaran belum dapat diperbarui.");
  const { error } = await supabase.from("academic_years").update({ is_active: true }).eq("id", id.data).eq("school_id", context.active.schoolId);
  if (error) redirectWithMessage("/settings/academic-years", "error", "Tahun ajaran belum dapat diaktifkan.");
  revalidatePath("/settings/academic-years");
  redirectWithMessage("/settings/academic-years", "success", "Tahun ajaran aktif diperbarui.");
}
