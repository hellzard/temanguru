"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectWithMessage } from "@/lib/action-result";
import { relationObject } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const assessmentSchema = z.object({
  teaching_assignment_id: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  category: z.enum(["tugas", "kuis", "ulangan", "uts", "uas", "praktik", "proyek"]),
  assessment_date: z.string().date().optional(),
  max_score: z.coerce.number().positive().max(10000),
  weight: z.coerce.number().min(0).max(1000),
});

export async function createAssessment(formData: FormData) {
  const assignmentId = String(formData.get("teaching_assignment_id") ?? "");
  const parsed = assessmentSchema.safeParse({
    teaching_assignment_id: assignmentId,
    title: formData.get("title"),
    category: formData.get("category"),
    assessment_date: formData.get("assessment_date") || undefined,
    max_score: formData.get("max_score") || 100,
    weight: formData.get("weight") || 1,
  });
  if (!parsed.success) redirectWithMessage(`/assessment?assignment=${encodeURIComponent(assignmentId)}`, "error", parsed.error.issues[0].message);
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { error } = await supabase.from("assessments").insert({
    school_id: context.active.schoolId,
    created_by: context.userId,
    ...parsed.data,
    assessment_date: parsed.data.assessment_date || null,
  });
  if (error) redirectWithMessage(`/assessment?assignment=${encodeURIComponent(assignmentId)}`, "error", "Penilaian belum berhasil dibuat. Pastikan Anda mengajar kelas tersebut.");
  revalidatePath("/assessment");
  redirectWithMessage(`/assessment?assignment=${encodeURIComponent(assignmentId)}`, "success", "Penilaian berhasil dibuat.");
}

export async function saveAssessmentScores(formData: FormData) {
  const assessmentId = z.string().uuid().safeParse(formData.get("assessment_id"));
  if (!assessmentId.success) redirectWithMessage("/assessment", "error", "Penilaian tidak valid.");
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id,max_score,teaching_assignments(class_id)")
    .eq("id", assessmentId.data)
    .eq("school_id", context.active.schoolId)
    .maybeSingle();
  if (assessmentError || !assessment) redirectWithMessage("/assessment", "error", "Penilaian tidak ditemukan.");

  const assignment = relationObject(assessment.teaching_assignments);
  const classId = typeof assignment?.class_id === "string" ? assignment.class_id : null;
  if (!classId) redirectWithMessage("/assessment", "error", "Kelas penilaian tidak ditemukan.");
  const { data: memberships, error: membershipError } = await supabase.from("class_students").select("student_id").eq("class_id", classId);
  if (membershipError) redirectWithMessage(`/assessment/${assessmentId.data}`, "error", "Daftar murid belum dapat diverifikasi.");
  const allowed = new Set((memberships ?? []).map((row) => row.student_id));
  const maxScore = Number(assessment.max_score);
  const rows: Array<{ assessment_id: string; student_id: string; original_score: number | null; note: null; updated_by: string }> = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("score_")) continue;
    const studentId = z.string().uuid().safeParse(key.slice(6));
    if (!studentId.success || !allowed.has(studentId.data)) continue;
    const raw = String(value).trim();
    const score = raw === "" ? null : Number(raw);
    if (score !== null && (!Number.isFinite(score) || score < 0 || score > maxScore)) redirectWithMessage(`/assessment/${assessmentId.data}`, "error", `Nilai harus berada di antara 0 dan ${maxScore}.`);
    rows.push({ assessment_id: assessmentId.data, student_id: studentId.data, original_score: score, note: null, updated_by: context.userId });
  }

  if (rows.length) {
    const { error } = await supabase.from("assessment_scores").upsert(rows, { onConflict: "assessment_id,student_id" });
    if (error) redirectWithMessage(`/assessment/${assessmentId.data}`, "error", "Nilai belum berhasil disimpan.");
  }
  revalidatePath(`/assessment/${assessmentId.data}`);
  revalidatePath("/dashboard");
  redirectWithMessage(`/assessment/${assessmentId.data}`, "success", "Nilai berhasil disimpan.");
}

export async function getAssessments(assignmentId: string) {
  if (!assignmentId) return [];
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, title, category, assessment_date, max_score, weight")
    .eq("school_id", context.active.schoolId)
    .eq("teaching_assignment_id", assignmentId)
    .order("assessment_date", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
