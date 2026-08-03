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

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .eq("school_id", member.school_id)
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
