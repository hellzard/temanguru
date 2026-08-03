import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScheduleList } from "./client";

export const metadata = { title: "Jadwal Mengajar" };

export default async function SchedulesPage() {
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

  if (!member) redirect("/onboarding");

  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id, name")
    .eq("school_id", member.school_id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!activeYear) {
    return (
      <div>
        <PageHeader title="Jadwal Mengajar" description="Kelola jadwal mingguan Anda." />
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-lg font-bold">Tahun Ajaran Belum Diatur</h2>
          <p className="mt-2 text-sm text-amber-800">
            Anda harus memiliki setidaknya satu Tahun Ajaran aktif untuk melihat atau membuat jadwal.
          </p>
        </div>
      </div>
    );
  }

  // Fetch schedules for this teacher in the active year
  const { data: schedules } = await supabase
    .from("schedules")
    .select(`
      *,
      teaching_assignments!inner (
        id,
        teacher_id,
        academic_year_id,
        classes ( name ),
        subjects ( name )
      )
    `)
    .eq("school_id", member.school_id)
    .eq("teaching_assignments.teacher_id", user.id)
    .eq("teaching_assignments.academic_year_id", activeYear.id);

  return (
    <div>
      <PageHeader 
        title="Jadwal Mengajar" 
        description={`Tahun Ajaran ${activeYear.name}`} 
      />
      
      <ScheduleList schedules={schedules || []} />
    </div>
  );
}
