import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { MeetingsClient } from "./client";

export const metadata = {
  title: "Rapat & Keputusan | Teman Guru",
};

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let meetings: Record<string, unknown>[] = [];
  let decisions: Record<string, unknown>[] = [];

  if (user) {
    const { active: member } = await requireActiveSchool();

    if (member) {
      const { data: mData } = await supabase
        .from("meetings")
        .select("*")
        .eq("school_id", member.schoolId)
        .order("date", { ascending: false });

      if (mData) {
        meetings = mData;
        
        const meetingIds = meetings.map(m => m.id);
        if (meetingIds.length > 0) {
          const { data: dData } = await supabase
            .from("meeting_decisions")
            .select("*")
            .in("meeting_id", meetingIds)
            .order("created_at", { ascending: true });
            
          if (dData) decisions = dData;
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MeetingsClient meetings={meetings} decisions={decisions} />
    </div>
  );
}
