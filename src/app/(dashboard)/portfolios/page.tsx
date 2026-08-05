import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { PortfoliosClient } from "./client";

export const metadata = {
  title: "Portofolio | Teman Guru",
};

export default async function PortfoliosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let studentPortfolios: Record<string, unknown>[] = [];
  let teacherPortfolios: Record<string, unknown>[] = [];
  let students: Record<string, unknown>[] = [];

  if (user) {
    const { active: member } = await requireActiveSchool();

    if (member) {
      const { data: spData } = await supabase
        .from("portfolios_student")
        .select(`*, students(display_name, local_code)`)
        .eq("school_id", member.schoolId)
        .order("created_at", { ascending: false });

      if (spData) studentPortfolios = spData;
      
      const { data: tpData } = await supabase
        .from("portfolios_teacher")
        .select("*")
        .eq("school_id", member.schoolId)
        .eq("member_id", member.id)
        .order("created_at", { ascending: false });
        
      if (tpData) teacherPortfolios = tpData;

      const { data: stData } = await supabase
        .from("students")
        .select("id, display_name, local_code")
        .eq("school_id", member.schoolId)
        .order("display_name", { ascending: true });
        
      if (stData) students = stData;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PortfoliosClient 
        studentPortfolios={studentPortfolios} 
        teacherPortfolios={teacherPortfolios} 
        students={students} 
      />
    </div>
  );
}
