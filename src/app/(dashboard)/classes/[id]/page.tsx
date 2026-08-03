import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddStudentForm, StudentList } from "./client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Detail Kelas" };

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: classData } = await supabase
    .from("classes")
    .select("*, academic_years(name, is_active)")
    .eq("id", classId)
    .limit(1)
    .single();

  if (!classData) redirect("/classes");

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("school_id", classData.school_id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) redirect("/classes");

  // Fetch students by joining class_students -> students
  const { data: classStudents } = await supabase
    .from("class_students")
    .select(`
      student_id,
      students (
        id,
        display_name,
        local_code
      )
    `)
    .eq("class_id", classId);

  // Safely flatten
  const students = (classStudents as { students: Record<string, unknown> }[] | null)?.map((cs) => cs.students).filter(Boolean) || [];

  return (
    <div>
      <Link href="/classes" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition text-slate-500 hover:bg-slate-100 mb-4 -ml-4">
        <ArrowLeft size={16} className="mr-2" /> Kembali ke Daftar Kelas
      </Link>

      <PageHeader 
        title={`Kelas: ${classData.name}`} 
        description={`Tingkat: ${classData.grade_level || "-"} | Tahun Ajaran: ${classData.academic_years?.name}`} 
      />
      
      <AddStudentForm classId={classId} />
      
      <StudentList students={students} />
    </div>
  );
}
