import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { EventDetailClient } from "./client";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Detail Acara | Teman Guru",
};

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { active: member } = await requireActiveSchool();

  if (!member) {
    notFound();
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .eq("school_id", member.schoolId)
    .single();

  if (!event) {
    notFound();
  }

  const { data: tasks } = await supabase
    .from("event_tasks")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl">
      <EventDetailClient event={event} tasks={tasks || []} />
    </div>
  );
}
