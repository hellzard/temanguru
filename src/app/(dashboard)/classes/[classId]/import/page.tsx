import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { ImportClient } from "./import-client";

export const metadata = { title: "Impor Murid", robots: { index: false, follow: false } };

export default async function ImportStudentsPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select("id,name").eq("id", classId).eq("school_id", context.active.schoolId).maybeSingle();
  if (error || !data) notFound();
  return <div className="mx-auto max-w-3xl"><PageHeader title={`Impor murid · ${data.name}`} description="File diproses di browser lalu disimpan melalui transaksi database. Maksimal 500 baris." /><div className="mt-7"><ImportClient classId={classId} /></div></div>;
}
