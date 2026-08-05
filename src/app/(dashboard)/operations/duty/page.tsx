import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { DutyClient } from "./client";

export const metadata = {
  title: "Jadwal Piket | Teman Guru",
};

export default async function DutyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let schedules: Record<string, unknown>[] = [];
  let teachers: Record<string, unknown>[] = [];
  let isAdmin = false;

  if (user) {
    const { active: member } = await requireActiveSchool();

    if (member) {
      isAdmin = member.role === "admin";

      const { data: sData } = await supabase
        .from("duty_schedules")
        .select(`
          *,
          school_members(
            id,
            users(name, email)
          )
        `)
        .eq("school_id", member.schoolId)
        .order("date", { ascending: true });

      if (sData) {
        schedules = sData;
      }

      if (isAdmin) {
        const { data: tData } = await supabase
          .from("school_members")
          .select(`
            id,
            role,
            users(name, email)
          `)
          .eq("school_id", member.schoolId)
          .eq("status", "active")
          .order("role", { ascending: false });
          
        if (tData) teachers = tData;
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DutyClient schedules={schedules} teachers={teachers} isAdmin={isAdmin} />
    </div>
  );
}
