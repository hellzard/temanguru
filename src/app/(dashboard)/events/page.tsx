import { createClient } from "@/lib/supabase/server";
import { EventsClient } from "./client";

export const metadata = {
  title: "Acara & Rapat | Teman Guru",
};

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let events: Record<string, unknown>[] = [];

  if (user) {
    const { data: member } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("user_id", user.id)
      .single();

    if (member) {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("school_id", member.school_id)
        .order("starts_at", { ascending: false });

      if (data) {
        events = data;
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <EventsClient events={events} />
    </div>
  );
}
