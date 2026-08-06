import { notFound } from "next/navigation";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { relationObject } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { saveAssessmentScores } from "../actions";

export const metadata = { title: "Isi Nilai" };

export default async function ScorePage({ params, searchParams }: { params: Promise<{ assessmentId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { assessmentId } = await params;
  const query = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data: assessment, error } = await supabase.from("assessments").select("id,title,max_score,teaching_assignments(class_id)").eq("id", assessmentId).eq("school_id", context.active.schoolId).maybeSingle();
  if (error || !assessment) notFound();
  const assignment = relationObject(assessment.teaching_assignments);
  const classId = typeof assignment?.class_id === "string" ? assignment.class_id : null;
  if (!classId) notFound();
  const [{ data: members, error: memberError }, { data: scores, error: scoreError }] = await Promise.all([
    supabase.from("class_students").select("students(id,display_name,local_code,status)").eq("class_id", classId),
    supabase.from("assessment_scores").select("student_id,original_score,final_score").eq("assessment_id", assessmentId),
  ]);
  if (memberError || scoreError) throw memberError ?? scoreError;
  const scoreMap = new Map((scores ?? []).map((row) => [String(row.student_id), row]));
  const students = ((members ?? []) as Array<Record<string, unknown>>).flatMap((item) => { const raw = relationObject(item.students); return raw?.status === "active" ? [raw] : []; }).sort((a, b) => String(a.display_name).localeCompare(String(b.display_name), "id"));

  return <div><PageHeader title={String(assessment.title)} description={`Masukkan skor 0–${String(assessment.max_score)}. Kolom kosong tetap dianggap belum dinilai, bukan nol.`} /><form action={saveAssessmentScores} className="tg-card mt-7 overflow-hidden"><input type="hidden" name="assessment_id" value={assessmentId} /><div className="border-b border-[var(--tg-border)] p-5"><FormMessage error={firstParam(query.error)} success={firstParam(query.success)} /></div><div className="divide-y divide-[var(--tg-border)]">{students.map((student) => { const saved = scoreMap.get(String(student.id)); return <label key={String(student.id)} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><span className="flex-1"><span className="block font-semibold">{String(student.display_name)}</span><span className="text-sm tg-muted">{student.local_code ? `Kode ${String(student.local_code)}` : "Tanpa kode lokal"}</span></span><input aria-label={`Nilai ${String(student.display_name)}`} type="number" min="0" max={Number(assessment.max_score)} step="0.01" name={`score_${String(student.id)}`} defaultValue={saved?.final_score ?? saved?.original_score ?? ""} className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 sm:w-36" /></label>; })}</div><div className="p-5"><SubmitButton>Simpan seluruh nilai</SubmitButton></div></form></div>;
}
