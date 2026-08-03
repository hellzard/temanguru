import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateScheduleForm } from "./client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Tambah Jadwal Mengajar" };

export default async function NewSchedulePage() {
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

  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id")
    .eq("school_id", member.school_id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!activeYear) redirect("/schedules");

  // Fetch available classes and subjects for dropdowns
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("school_id", member.school_id)
    .eq("academic_year_id", activeYear.id)
    .order("name", { ascending: true });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("school_id", member.school_id)
    .order("name", { ascending: true });

  return (
    <div>
      <Link href="/schedules" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition text-slate-500 hover:bg-slate-100 mb-4 -ml-4">
        <ArrowLeft size={16} className="mr-2" /> Kembali ke Jadwal
      </Link>

      <PageHeader 
        title="Tambah Jadwal" 
        description="Buat jadwal mengajar baru. Penugasan akan otomatis disesuaikan." 
      />
      
      <CreateScheduleForm classes={classes || []} subjects={subjects || []} />
    </div>
  );
}
