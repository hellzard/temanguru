import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { relationObject, relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Rekap Nilai" };

export default async function ReportPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data: assignment, error: assignmentError } = await supabase.from("teaching_assignments").select("id,class_id,classes(name),subjects(name)").eq("id", assignmentId).eq("school_id", context.active.schoolId).maybeSingle();
  if (assignmentError || !assignment) notFound();
  const [{ data: members, error: memberError }, { data: assessments, error: assessmentError }] = await Promise.all([
    supabase.from("class_students").select("students(id,display_name,local_code,status)").eq("class_id", assignment.class_id),
    supabase.from("assessments").select("id,title,max_score,weight,assessment_scores(student_id,original_score,final_score)").eq("teaching_assignment_id", assignmentId).order("assessment_date"),
  ]);
  if (memberError || assessmentError) throw memberError ?? assessmentError;
  const students = ((members ?? []) as Array<Record<string, unknown>>).flatMap((item) => { const raw = relationObject(item.students); return raw?.status === "active" ? [raw] : []; });
  const assessmentRows = (assessments ?? []) as Array<Record<string, unknown>>;

  return <div><PageHeader title="Rekap Nilai" description={`${relationText(assignment.classes)} · ${relationText(assignment.subjects)}. Rerata hanya memakai komponen yang sudah terisi dan bukan keputusan nilai rapor final.`} /><div className="tg-card mt-7 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-[var(--tg-border)] bg-[var(--tg-surface-muted)]"><tr><th className="px-4 py-3">Murid</th>{assessmentRows.map((item) => <th key={String(item.id)} className="min-w-28 px-4 py-3">{String(item.title)}</th>)}<th className="px-4 py-3">Rerata terisi</th></tr></thead><tbody className="divide-y divide-[var(--tg-border)]">{students.map((student) => { let weighted = 0; let enteredWeight = 0; return <tr key={String(student.id)}><td className="px-4 py-3 font-semibold">{String(student.display_name)}</td>{assessmentRows.map((item) => { const scores = (item.assessment_scores ?? []) as Array<Record<string, unknown>>; const score = scores.find((row) => row.student_id === student.id); const rawValue = score?.final_score ?? score?.original_score; const raw = rawValue === null || rawValue === undefined ? null : Number(rawValue); const weight = Number(item.weight ?? 0); if (raw !== null) { weighted += (raw / Number(item.max_score || 100)) * 100 * weight; enteredWeight += weight; } return <td key={String(item.id)} className="px-4 py-3">{raw === null ? "—" : raw.toFixed(1)}</td>; })}<td className="px-4 py-3 font-black text-[var(--tg-primary)]">{enteredWeight ? (weighted / enteredWeight).toFixed(1) : "—"}</td></tr>; })}</tbody></table></div></div>;
}
