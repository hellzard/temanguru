import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import GradebookClient from "./client";

export const metadata = { title: "Buku Nilai | Teman Guru" };

export default async function GradesPage() {
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
        <PageHeader title="Buku Nilai" description="Pantau rekap nilai akhir seluruh siswa." />
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          Tahun ajaran belum diatur.
        </div>
      </div>
    );
  }

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
  
  const assignmentOptions = assignments.map(a => {
    const classData = a.classes as unknown as Record<string, unknown>;
    const subjectData = a.subjects as unknown as Record<string, unknown>;
    return {
      id: a.id,
      class_id: a.class_id,
      label: `${classData?.name || '-'} · ${subjectData?.name || '-'}`
    };
  });

  return (
    <div>
      <PageHeader 
        title="Buku Nilai" 
        description="Rekapitulasi otomatis berdasarkan pembobotan nilai asesmen." 
      />
      <div className="mt-8">
        <GradebookClient assignments={assignmentOptions} />
      </div>
    </div>
  );
}
