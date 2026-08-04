import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GroupBuilderClient from "./client";

export const metadata = { title: "Pembuat Kelompok | Teman Guru" };

export default async function GroupBuilderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const classId = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: classData } = await supabase
    .from("classes")
    .select("name")
    .eq("id", classId)
    .single();

  if (!classData) {
    redirect("/classes");
  }

  // Get students in this class
  const { data: studentData } = await supabase
    .from("class_students")
    .select(`
      student_id,
      students ( display_name, local_code, gender )
    `)
    .eq("class_id", classId);

  const students = (studentData || []).map(s => {
    const st = s.students as unknown as Record<string, unknown>;
    return {
      id: s.student_id,
      name: st?.display_name as string || "Tanpa Nama",
      local_code: st?.local_code as string || "",
      gender: st?.gender as string || ""
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="mb-4">
        <Link href={`/classes/${classId}`} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition">
          <ChevronLeft size={16} /> Kembali ke Detail Kelas
        </Link>
      </div>
      
      <PageHeader 
        title="Pembuat Kelompok Otomatis" 
        description={`Bagikan ${students.length} murid di kelas ${classData.name} ke dalam beberapa kelompok secara acak.`} 
      />

      <div className="max-w-5xl">
        <GroupBuilderClient students={students} />
      </div>
    </div>
  );
}
