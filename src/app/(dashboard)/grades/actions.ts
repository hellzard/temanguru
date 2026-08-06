"use server";

import { createClient } from "@/lib/supabase/server";

export async function getGradebookData(assignment_id: string, class_id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // 1. Ambil daftar murid
  const { data: studentData, error: studentError } = await supabase
    .from("class_students")
    .select(`
      student_id,
      students ( display_name, local_code )
    `)
    .eq("class_id", class_id);

  if (studentError) {
    return { error: "Gagal mengambil data murid." };
  }

  const students = (studentData || []).map(s => {
    const st = s.students as unknown as Record<string, unknown>;
    return {
      id: s.student_id,
      name: st?.display_name as string || "Tanpa Nama",
      local_code: st?.local_code as string || ""
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // 2. Ambil daftar kerangka penilaian (assessments)
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, title, category, assessment_date, max_score, weight")
    .eq("teaching_assignment_id", assignment_id)
    .order("assessment_date", { ascending: true });

  if (assessmentsError) {
    return { error: "Gagal mengambil data penilaian." };
  }

  // 3. Ambil seluruh nilai untuk assessment ini
  const assessmentIds = assessments.map(a => a.id);
  
  let scores: Record<string, unknown>[] = [];
  if (assessmentIds.length > 0) {
    const { data: scoresData, error: scoresError } = await supabase
      .from("assessment_scores")
      .select("assessment_id, student_id, final_score")
      .in("assessment_id", assessmentIds);

    if (!scoresError && scoresData) {
      scores = scoresData;
    }
  }

  return {
    students,
    assessments,
    scores
  };
}
