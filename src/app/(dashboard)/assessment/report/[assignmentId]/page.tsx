import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import ReportClient from "./client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Rapor Kelas | Teman Guru" };

export default async function AssessmentReportPage(props: { params: Promise<{ assignmentId: string }> }) {
  const params = await props.params;
  const assignmentId = params.assignmentId;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get teaching assignment details
  const { data: assignment } = await supabase
    .from("teaching_assignments")
    .select(`
      id,
      class_id,
      classes ( name ),
      subjects ( name )
    `)
    .eq("id", assignmentId)
    .single();

  if (!assignment) {
    return (
      <div className="p-8 text-center text-slate-500">
        Data kelas tidak ditemukan.
        <br />
        <Link href="/assessment" className="text-indigo-600 hover:underline">Kembali</Link>
      </div>
    );
  }

  const classId = assignment.class_id;
  const classData = assignment.classes as unknown as Record<string, string>;
  const subjectData = assignment.subjects as unknown as Record<string, string>;

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

  // Get all assessments for this assignment
  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, title, category, max_score, weight")
    .eq("teaching_assignment_id", assignmentId)
    .order("created_at", { ascending: true });

  // Get all scores for these assessments
  const assessmentIds = (assessments || []).map(a => a.id);
  
  type Score = {
    assessment_id: string;
    student_id: string;
    original_score: number | null;
    final_score: number | null;
  };
  let scores: Score[] = [];
  if (assessmentIds.length > 0) {
    const { data: scoreData } = await supabase
      .from("assessment_scores")
      .select("assessment_id, student_id, original_score, final_score")
      .in("assessment_id", assessmentIds);
      
    scores = (scoreData as unknown as Score[]) || [];
  }

  return (
    <div>
      <div className="mb-4 print:hidden">
        <Link href="/assessment" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
          <ChevronLeft size={16} /> Kembali ke Daftar Penilaian
        </Link>
      </div>
      
      <div className="print:hidden">
        <PageHeader 
          title="Rapor Kelas" 
          description={`Rekapitulasi nilai akhir siswa`} 
        />
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Laporan Hasil Belajar</h1>
        <p className="text-slate-600 mt-2">Mata Pelajaran: {subjectData?.name}</p>
        <p className="text-slate-600">Kelas: {classData?.name}</p>
      </div>
      
      <div className="mt-2 mb-8 inline-block rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 print:hidden">
        {classData?.name} — {subjectData?.name}
      </div>

      <div className="w-full">
        <ReportClient 
          students={students}
          assessments={assessments || []}
          scores={scores}
        />
      </div>
    </div>
  );
}
