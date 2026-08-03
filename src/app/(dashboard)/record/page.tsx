import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { ClassRecordForm } from "./client";
import { Calendar } from "lucide-react";

export const metadata = { title: "Catat Kelas 60 Detik" };

export default async function RecordPage(
  props: {
    searchParams: Promise<{ assignment_id?: string; date?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const assignment_id = searchParams?.assignment_id;
  const dateStr = searchParams?.date || new Date().toISOString().split("T")[0];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) redirect("/dashboard");

  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id")
    .eq("school_id", member.school_id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!activeYear) {
    return (
      <div>
        <PageHeader title="Catat Kelas" description="Rekam presensi dan jurnal dengan cepat." />
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          Tahun ajaran belum diatur.
        </div>
      </div>
    );
  }

  // Ambil daftar assignment milik guru ini
  const { data: rawAssignments } = await supabase
    .from("teaching_assignments")
    .select(`
      id,
      class_id,
      classes ( name ),
      subjects ( name )
    `)
    .eq("school_id", member.school_id)
    .eq("teacher_id", user.id)
    .eq("academic_year_id", activeYear.id);

  const assignments = rawAssignments || [];
  
  // Format assignments for dropdown
  const assignmentOptions = assignments.map(a => {
    const classData = a.classes as unknown as Record<string, unknown>;
    const subjectData = a.subjects as unknown as Record<string, unknown>;
    return {
      id: a.id,
      class_id: a.class_id,
      label: `${classData?.name || '-'} · ${subjectData?.name || '-'}`
    };
  });

  let students: { id: string; name: string; local_code: string; }[] = [];
  let existingJournal: Record<string, unknown> | null = null;
  let existingAttendance: Record<string, unknown>[] = [];

  // Jika assignment_id diberikan, ambil daftar murid
  if (assignment_id) {
    const selectedAssignment = assignments.find(a => a.id === assignment_id);
    
    if (selectedAssignment) {
      const { data: studentData } = await supabase
        .from("class_students")
        .select(`
          student_id,
          students ( display_name, local_code )
        `)
        .eq("class_id", selectedAssignment.class_id);

      if (studentData) {
        students = studentData.map(s => {
          const st = s.students as unknown as Record<string, unknown>;
          return {
            id: s.student_id,
            name: st?.display_name as string || "Tanpa Nama",
            local_code: st?.local_code as string || ""
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
      }

      // Pre-fetch if there's already data for this date
      const { data: existingSession } = await supabase
        .from("attendance_sessions")
        .select("id")
        .eq("teaching_assignment_id", assignment_id)
        .eq("session_date", dateStr)
        .limit(1)
        .single();
        
      if (existingSession) {
        const { data: attData } = await supabase
          .from("attendance_records")
          .select("student_id, status")
          .eq("attendance_session_id", existingSession.id);
          
        if (attData) existingAttendance = attData;

        const { data: journalData } = await supabase
          .from("teaching_journals")
          .select("topic, activity_summary, reflection, obstacle, follow_up")
          .eq("teaching_assignment_id", assignment_id)
          .eq("journal_date", dateStr)
          .limit(1)
          .single();
          
        if (journalData) existingJournal = journalData;
      }
    }
  }

  // Indonesian date formatting
  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const dateObj = new Date(dateStr);
  const formattedDate = formatter.format(dateObj);

  return (
    <div>
      <PageHeader 
        title="Catat Kelas 60 Detik" 
        description="Pusat pencatatan cepat. Isi presensi dan jurnal mengajar sekaligus." 
      />

      <div className="mt-8 max-w-2xl">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700 mb-4">
            <Calendar size={20} className="text-indigo-600" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <ClassRecordForm 
            key={`${assignment_id || 'none'}-${dateStr}`}
            assignments={assignmentOptions}
            selectedAssignmentId={assignment_id || ""}
            selectedDate={dateStr}
            students={students}
            existingJournal={existingJournal}
            existingAttendance={existingAttendance}
          />
        </div>
      </div>
    </div>
  );
}
