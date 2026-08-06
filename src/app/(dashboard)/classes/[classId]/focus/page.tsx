import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { relationObject } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { FocusClient } from "./focus-client";

export const metadata = { title: "Mode Fokus", robots: { index: false, follow: false } };

export default async function FocusPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [{ data: classData, error: classError }, { data: rows, error: rowError }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("id", classId).eq("school_id", context.active.schoolId).maybeSingle(),
    supabase.from("class_students").select("students(id,display_name,status)").eq("class_id", classId),
  ]);
  if (classError || !classData) notFound();
  if (rowError) throw rowError;
  const students = ((rows ?? []) as Array<Record<string, unknown>>).map((row) => relationObject(row.students)).filter((row) => row && row.status === "active").map((row) => ({ id: String(row?.id), name: String(row?.display_name) }));
  return <div><PageHeader title={`Mode Fokus · ${classData.name}`} description="Pilih murid secara acak tanpa merekam penilaian atau label perilaku." /><FocusClient students={students} /></div>;
}
