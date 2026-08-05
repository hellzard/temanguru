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
    const { data: member } = await supabase
      .from("school_members")
      .select("id, school_id")
      .eq("user_id", user.id)
      .single();

    if (member) {
      const { data: spData } = await supabase
        .from("portfolios_student")
        .select(`*, students(display_name, local_code)`)
        .eq("school_id", member.school_id)
        .order("created_at", { ascending: false });

      if (spData) studentPortfolios = spData;
      
      const { data: tpData } = await supabase
        .from("portfolios_teacher")
        .select("*")
        .eq("school_id", member.school_id)
        .eq("member_id", member.id)
        .order("created_at", { ascending: false });
        
      if (tpData) teacherPortfolios = tpData;

      const { data: stData } = await supabase
        .from("students")
        .select("id, display_name, local_code")
        .eq("school_id", member.school_id)
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
