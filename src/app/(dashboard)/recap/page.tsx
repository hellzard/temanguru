import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RecapClient from "./client";

export const metadata = {
  title: "Rekap & Tindak Lanjut - Teman Guru",
};

export default async function RecapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!member) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Anda belum terdaftar di sekolah manapun.</p>
      </div>
    );
  }

  // 1. Get active academic year
  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id, name")
    .eq("school_id", member.school_id)
    .eq("is_active", true)
    .single();

  if (!activeYear) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
        <p className="text-slate-600">Belum ada tahun ajaran aktif.</p>
      </div>
    );
  }

  // 2. Fetch teaching assignments for this user
  const { data: assignments } = await supabase
    .from("teaching_assignments")
    .select(`
      id,
      class_id,
      subject_id,
      classes:class_id(name),
      subjects:subject_id(name)
    `)
    .eq("teacher_id", user.id)
    .eq("academic_year_id", activeYear.id)
    .order("created_at", { ascending: true });

  if (!assignments || assignments.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
        <p className="text-slate-600">Anda belum memiliki jadwal mengajar di tahun ajaran ini.</p>
      </div>
    );
  }

  const assignmentOptions = assignments.map(a => {
    const classData = a.classes as unknown as Record<string, unknown>;
    const subjectData = a.subjects as unknown as Record<string, unknown>;
    return {
      id: a.id,
      class_id: a.class_id,
      subject_id: a.subject_id,
      class_name: classData?.name as string || "Tanpa Kelas",
      subject_name: subjectData?.name as string || "Tanpa Mapel",
    };
  });

  // Resolve search parameters
  const sp = await searchParams;
  const assignment_id = typeof sp.assignmentId === "string" ? sp.assignmentId : "";
  
  // Default to current month if not provided
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthStr = typeof sp.month === "string" ? sp.month : currentMonthStr;

  let sessionData: Record<string, unknown>[] = [];
  let journalData: Record<string, unknown>[] = [];
  
  if (assignment_id && monthStr) {
    // Determine date range for the month
    // monthStr is format "YYYY-MM"
    const [year, month] = monthStr.split('-').map(Number);
    
    // First day of month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    
    // Last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    // Fetch sessions in range with attendance counts
    const { data: sessions } = await supabase
      .from("attendance_sessions")
      .select(`
        id,
        session_date,
        attendance_records (
          status
        )
      `)
      .eq("teaching_assignment_id", assignment_id)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: true });
      
    if (sessions) {
      sessionData = sessions as unknown as Record<string, unknown>[];
    }

    // Fetch journals in range
    const { data: journals } = await supabase
      .from("teaching_journals")
      .select(`
        id,
        attendance_session_id,
        journal_date,
        topic,
        activity_summary,
        reflection,
        obstacle,
        follow_up
      `)
      .eq("teaching_assignment_id", assignment_id)
      .gte("journal_date", startDate)
      .lte("journal_date", endDate)
      .order("journal_date", { ascending: true });

    if (journals) {
      journalData = journals as unknown as Record<string, unknown>[];
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Rekap & Tindak Lanjut</h1>
        <p className="text-sm text-slate-500">
          Lihat riwayat mengajar bulanan dan data murid yang perlu perhatian.
        </p>
      </div>

      <RecapClient 
        key={`${assignment_id}-${monthStr}`}
        assignments={assignmentOptions}
        selectedAssignmentId={assignment_id}
        selectedMonth={monthStr}
        sessions={sessionData}
        journals={journalData}
      />
    </div>
  );
}
