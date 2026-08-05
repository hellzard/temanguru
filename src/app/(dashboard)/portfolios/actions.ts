"use server";

import { requireActiveSchool } from "@/lib/schools/active-school";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createStudentPortfolioSchema = z.object({
  student_id: z.string().uuid("Pilih siswa"),
  title: z.string().min(1, "Judul karya wajib diisi"),
  category: z.enum(["assignment", "project", "art", "certificate", "other"]),
  url: z.string().optional(),
});

export async function createStudentPortfolio(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { active: member } = await requireActiveSchool();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createStudentPortfolioSchema.safeParse({
    student_id: formData.get("student_id"),
    title: formData.get("title"),
    category: formData.get("category") || "assignment",
    url: formData.get("url"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  const { error } = await supabase.from("portfolios_student").insert({
    school_id: member.schoolId,
    student_id: parsed.data.student_id,
    title: parsed.data.title,
    category: parsed.data.category,
    url: parsed.data.url,
  });

  if (error) {
    console.error("Create portfolio error:", error);
    return { success: false, message: "Gagal menyimpan portofolio" };
  }

  revalidatePath("/portfolios");
  return { success: true, message: "Karya siswa berhasil ditambahkan" };
}

const createTeacherPortfolioSchema = z.object({
  title: z.string().min(1, "Judul dokumen wajib diisi"),
  category: z.enum(["certificate", "teaching_material", "research", "other"]),
  date_obtained: z.string().optional(),
  url: z.string().optional(),
});

export async function createTeacherPortfolio(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { active: member } = await requireActiveSchool();

  if (!member) return { success: false, message: "User not in a school" };

  const parsed = createTeacherPortfolioSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category") || "certificate",
    date_obtained: formData.get("date_obtained"),
    url: formData.get("url"),
  });

  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  let date_obtained = null;
  if (parsed.data.date_obtained && parsed.data.date_obtained.trim() !== "") {
    date_obtained = parsed.data.date_obtained;
  }

  const { error } = await supabase.from("portfolios_teacher").insert({
    school_id: member.schoolId,
    member_id: member.id,
    title: parsed.data.title,
    category: parsed.data.category,
    date_obtained,
    url: parsed.data.url,
  });

  if (error) {
    console.error("Create teacher portfolio error:", error);
    return { success: false, message: "Gagal menyimpan portofolio guru" };
  }

  revalidatePath("/portfolios");
  return { success: true, message: "Portofolio guru berhasil ditambahkan" };
}
