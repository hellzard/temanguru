import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { relationObject } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { GroupBuilderClient } from "./group-builder-client";

export const metadata = { title: "Pembuat Kelompok", robots: { index: false, follow: false } };

export default async function GroupBuilderPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [{ data: classData, error: classError }, { data: rows, error: rowError }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("id", classId).eq("school_id", context.active.schoolId).maybeSingle(),
    supabase.from("class_students").select("students(id,display_name,local_code,status)").eq("class_id", classId),
  ]);
  if (classError || !classData) notFound();
  if (rowError) throw rowError;
  const students = ((rows ?? []) as Array<Record<string, unknown>>).map((row) => relationObject(row.students)).filter((row) => row && row.status === "active").map((row) => ({ id: String(row?.id), name: String(row?.display_name), code: row?.local_code ? String(row.local_code) : null }));
  return <div><PageHeader title={`Pembuat Kelompok · ${classData.name}`} description="Pengacakan berlangsung di browser dan tidak mengubah data kelas." /><div className="mt-7"><GroupBuilderClient students={students} /></div></div>;
}
