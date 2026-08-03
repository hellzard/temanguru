"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Nama mata pelajaran wajib diisi.").max(120, "Maksimal 120 karakter."),
  code: z.string().trim().max(50, "Maksimal 50 karakter.").optional(),
});

export async function createSubject(formData: FormData) {
  const parsed = createSubjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) return { error: "Tidak memiliki akses ke sekolah." };

  const { error } = await supabase.from("subjects").insert({
    school_id: member.school_id,
    name: parsed.data.name,
    code: parsed.data.code || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Kode mata pelajaran ini sudah digunakan di sekolah Anda." };
    console.error("createSubject failed:", error);
    return { error: "Gagal menyimpan mata pelajaran." };
  }

  revalidatePath("/settings/subjects");
  return { success: true };
}
