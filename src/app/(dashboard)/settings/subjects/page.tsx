import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateSubjectForm, SubjectList } from "./client";

export const metadata = { title: "Mata Pelajaran" };

export default async function SubjectsPage() {
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

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("school_id", member.school_id)
    .order("name", { ascending: true });

  return (
    <div>
      <PageHeader 
        title="Mata Pelajaran" 
        description="Kelola daftar mata pelajaran yang diajarkan di sekolah ini." 
      />
      
      <CreateSubjectForm />
      
      <SubjectList subjects={subjects || []} />
    </div>
  );
}
