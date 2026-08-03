import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClassList, CreateClassForm } from "./client";
import Link from "next/link";
import { Settings } from "lucide-react";

export const metadata = { title: "Daftar Kelas" };

export default async function ClassesPage() {
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

  // Get active academic year
  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id, name")
    .eq("school_id", member.school_id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!activeYear) {
    return (
      <div>
        <PageHeader title="Daftar Kelas" description="Kelola kelas dan murid untuk sekolah Anda." />
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-lg font-bold">Tahun Ajaran Belum Diatur</h2>
          <p className="mt-2 text-sm text-amber-800">
            Anda harus memiliki setidaknya satu Tahun Ajaran aktif untuk membuat kelas.
          </p>
          <div className="mt-5">
            <Link href="/settings/academic-years" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition bg-indigo-600 text-white hover:bg-indigo-700">
              <Settings className="mr-2" size={16} /> Buka Pengaturan Tahun Ajaran
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("school_id", member.school_id)
    .eq("academic_year_id", activeYear.id)
    .order("name", { ascending: true });

  return (
    <div>
      <PageHeader 
        title="Daftar Kelas" 
        description={`Kelola kelas untuk Tahun Ajaran ${activeYear.name}.`} 
      />
      
      <CreateClassForm />
      
      <ClassList classes={classes || []} />
    </div>
  );
}
