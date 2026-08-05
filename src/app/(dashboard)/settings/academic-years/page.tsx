import { requireActiveSchool } from "@/lib/schools/active-school";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AcademicYearList, CreateAcademicYearForm } from "./client";

export const metadata = { title: "Tahun Ajaran | Pengaturan" };

export default async function AcademicYearsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { active: member } = await requireActiveSchool();

  if (!member) {
    redirect("/onboarding");
  }

  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .eq("school_id", member.schoolId)
    .order("starts_on", { ascending: false });

  return (
    <div>
      <PageHeader 
        title="Tahun Ajaran" 
        description="Kelola periode tahun ajaran untuk sekolah Anda." 
      />
      
      {member.role !== "teacher" && <CreateAcademicYearForm />}
      
      <AcademicYearList years={years || []} />
    </div>
  );
}
