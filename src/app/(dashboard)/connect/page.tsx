import { createClient } from "@/lib/supabase/server";
import { ConnectClient } from "./client";

export const metadata = {
  title: "Komunikasi & Wali | Teman Guru",
};

export default async function ConnectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let students: Record<string, unknown>[] = [];

  if (user) {
    const { data: member } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("user_id", user.id)
      .single();

    if (member) {
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
      <ConnectClient students={students} />
    </div>
  );
}
