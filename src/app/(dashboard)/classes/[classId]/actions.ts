"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

const rowSchema = z.object({
  display_name: z.string().trim().min(1).max(150),
  local_code: z.string().trim().max(50).optional().default(""),
});
const importSchema = z.object({
  class_id: z.string().uuid(),
  rows: z.array(rowSchema).min(1).max(500),
});

async function importRows(classId: string, rows: z.infer<typeof rowSchema>[]) {
  await requireActiveSchool();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("import_class_students", {
    p_class_id: classId,
    p_rows: rows,
  });
  if (error) {
    console.error("import_class_students", { code: error.code });
    return { success: false as const, message: "Data murid belum berhasil disimpan." };
  }
  revalidatePath(`/classes/${classId}`);
  revalidatePath("/students");
  return { success: true as const, message: "Data murid berhasil diperbarui.", data };
}

export async function addStudentToClass(formData: FormData) {
  const classId = z.string().uuid().safeParse(formData.get("class_id"));
  const row = rowSchema.safeParse({
    display_name: formData.get("display_name"),
    local_code: formData.get("local_code") || "",
  });
  if (!classId.success || !row.success) redirect("/classes?error=data-murid-tidak-valid");
  const result = await importRows(classId.data, [row.data]);
  const key = result.success ? "success" : "error";
  redirect(`/classes/${classId.data}?${key}=${encodeURIComponent(result.message)}`);
}

export async function importStudentsFromCsv(payload: unknown) {
  const parsed = importSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false as const, message: "Format impor tidak valid atau melebihi 500 murid." };
  }
  return importRows(parsed.data.class_id, parsed.data.rows);
}
