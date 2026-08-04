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

export async function addRemedialAttempt(
  assessment_id: string,
  student_id: string,
  remedial_score: number,
  final_score: number,
  attempt_date: string,
  note: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // 1. Get school_id and ensure access
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("school_id")
    .eq("id", assessment_id)
    .single();

  if (assessmentError || !assessment) {
    return { error: "Penilaian tidak ditemukan." };
  }

  // 2. Determine attempt_number
  const { data: existingAttempts, error: attemptsError } = await supabase
    .from("remedial_attempts")
    .select("attempt_number")
    .eq("assessment_id", assessment_id)
    .eq("student_id", student_id)
    .order("attempt_number", { ascending: false })
    .limit(1);

  if (attemptsError) {
    return { error: "Gagal memuat riwayat remedial." };
  }

  const nextAttemptNumber = existingAttempts && existingAttempts.length > 0
    ? existingAttempts[0].attempt_number + 1
    : 1;

  // 3. Insert remedial attempt
  const { error: insertError } = await supabase
    .from("remedial_attempts")
    .insert({
      school_id: assessment.school_id,
      assessment_id,
      student_id,
      attempt_number: nextAttemptNumber,
      score: remedial_score,
      attempted_on: attempt_date,
      note,
      created_by: user.id
    });

  if (insertError) {
    console.error("Error inserting remedial attempt:", insertError);
    return { error: "Gagal menyimpan data remedial." };
  }

  // 4. Update final_score in assessment_scores
  const { error: updateError } = await supabase
    .from("assessment_scores")
    .update({ final_score, updated_at: new Date().toISOString() })
    .eq("assessment_id", assessment_id)
    .eq("student_id", student_id);

  if (updateError) {
    console.error("Error updating final score:", updateError);
    return { error: "Gagal memperbarui nilai akhir." };
  }

  return { message: "Remedial berhasil dicatat!" };
}
