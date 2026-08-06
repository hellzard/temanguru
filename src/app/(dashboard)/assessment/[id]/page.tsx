import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import ScoreClient from "./client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Input Nilai | Teman Guru" };

export default async function AssessmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const assessment_id = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get assessment details
  const { data: assessment } = await supabase
    .from("assessments")
    .select(`
      *,
      teaching_assignments (
        class_id,
        classes ( name ),
        subjects ( name )
      )
    `)
    .eq("id", assessment_id)
    .single();

  if (!assessment) {
    return (
      <div className="p-8 text-center text-slate-500">
        Penilaian tidak ditemukan.
        <br />
        <Link href="/assessment" className="text-indigo-600 hover:underline">Kembali</Link>
      </div>
    );
  }

  const assignment = assessment.teaching_assignments as unknown as Record<string, unknown>;
  const classId = assignment.class_id as string;
  const classData = assignment.classes as Record<string, string>;
  const subjectData = assignment.subjects as Record<string, string>;

  // Get students in this class
  const { data: studentData } = await supabase
    .from("class_students")
    .select(`
      student_id,
      students ( display_name, local_code )
    `)
    .eq("class_id", classId);

  const students = (studentData || []).map(s => {
    const st = s.students as unknown as Record<string, unknown>;
    return {
      id: s.student_id,
      name: st?.display_name as string || "Tanpa Nama",
      local_code: st?.local_code as string || ""
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Get existing scores
  const { data: existingScores } = await supabase
    .from("assessment_scores")
    .select("*")
    .eq("assessment_id", assessment_id);

  // Get remedial history
  const { data: remedialAttempts } = await supabase
    .from("remedial_attempts")
    .select("*")
    .eq("assessment_id", assessment_id)
    .order("attempt_number", { ascending: true });

  return (
    <div>
      <div className="mb-4">
        <Link href="/assessment" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
          <ChevronLeft size={16} /> Kembali ke Daftar Penilaian
        </Link>
      </div>
      
      <PageHeader 
        title={assessment.title} 
        description={`Kategori: ${assessment.category.toUpperCase()} • Max: ${assessment.max_score} • Bobot: ${assessment.weight}`} 
      />
      
      <div className="mt-2 mb-8 inline-block rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
        {classData?.name} — {subjectData?.name}
      </div>

      <div className="max-w-5xl">
        <ScoreClient 
          assessmentId={assessment_id}
          students={students}
          existingScores={existingScores || []}
          remedialAttempts={remedialAttempts || []}
        />
      </div>
    </div>
  );
}
