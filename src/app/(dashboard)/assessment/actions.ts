"use server";

import { createClient } from "@/lib/supabase/server";

export async function createAssessment(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const assignment_id = formData.get("assignment_id") as string;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const date = formData.get("date") as string;
  const max_score = formData.get("max_score") as string;
  const weight = formData.get("weight") as string;

  if (!assignment_id || !title || !date) {
    return { error: "Mohon lengkapi semua field yang diwajibkan." };
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("teaching_assignments")
    .select("school_id")
    .eq("id", assignment_id)
    .single();

  if (assignmentError || !assignment) {
    return { error: "Kelas tidak ditemukan atau Anda tidak memiliki akses." };
  }

  const { error } = await supabase
    .from("assessments")
    .insert({
      school_id: assignment.school_id,
      teaching_assignment_id: assignment_id,
      title,
      category: category || "tugas",
      assessment_date: date,
      max_score: parseFloat(max_score) || 100,
      weight: parseFloat(weight) || 1,
      created_by: user.id
    });

  if (error) {
    console.error("Error creating assessment:", error);
    return { error: error.message };
  }

  return { message: "Penilaian berhasil dibuat!" };
}

export async function getAssessments(assignment_id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("teaching_assignment_id", assignment_id)
    .order("assessment_date", { ascending: false });

  if (error) return [];
  return data;
}

export async function saveAssessmentScores(assessment_id: string, scores: { student_id: string, original_score: number | null, final_score: number | null, note: string }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const records = scores.map(s => ({
    assessment_id,
    student_id: s.student_id,
    original_score: s.original_score,
    final_score: s.final_score,
    note: s.note,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from("assessment_scores")
    .upsert(records, { onConflict: "assessment_id, student_id" });

  if (error) {
    console.error("Error saving scores:", error);
    return { error: error.message };
  }

  return { message: "Nilai berhasil disimpan!" };
}
