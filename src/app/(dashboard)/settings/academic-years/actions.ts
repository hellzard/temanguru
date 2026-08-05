"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createAcademicYearSchema = z.object({
  name: z.string().trim().min(3, "Nama tahun ajaran minimal 3 karakter.").max(40),
  starts_on: z.string().date(),
  ends_on: z.string().date(),
}).refine(data => new Date(data.ends_on) >= new Date(data.starts_on), {
  message: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.",
  path: ["ends_on"],
});

export async function createAcademicYear(prevState: unknown, formData: FormData) {
  const parsed = createAcademicYearSchema.safeParse({
    name: formData.get("name"),
    starts_on: formData.get("starts_on"),
    ends_on: formData.get("ends_on"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) return { error: "Tidak memiliki akses ke sekolah." };
  if (member.role === "teacher") return { error: "Hanya admin/pemilik yang dapat menambah tahun ajaran." };

  const { error } = await supabase.from("academic_years").insert({
    school_id: member.school_id,
    name: parsed.data.name,
    starts_on: parsed.data.starts_on,
    ends_on: parsed.data.ends_on,
  });

  if (error) {
    if (error.code === "23505") return { error: "Tahun ajaran dengan nama ini sudah ada." };
    console.error("createAcademicYear failed:", error);
    return { error: "Gagal menyimpan tahun ajaran." };
  }

  revalidatePath("/settings/academic-years");
  return { success: true };
}

export async function setActiveAcademicYear(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) return { error: "Tidak memiliki akses ke sekolah." };
  if (member.role === "teacher") return { error: "Hanya admin/pemilik yang dapat mengubah tahun ajaran aktif." };

  // 1. Set all to inactive
  await supabase
    .from("academic_years")
    .update({ is_active: false })
    .eq("school_id", member.school_id);

  // 2. Set the chosen one to active
  const { error } = await supabase
    .from("academic_years")
    .update({ is_active: true })
    .eq("id", id)
    .eq("school_id", member.school_id);

  if (error) {
    console.error("setActiveAcademicYear failed:", error);
    return { error: "Gagal mengaktifkan tahun ajaran." };
  }

  revalidatePath("/settings/academic-years");
  return { success: true };
}
