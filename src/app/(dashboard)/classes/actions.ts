"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createClassSchema = z.object({
  name: z.string().trim().min(1, "Nama kelas tidak boleh kosong.").max(80, "Maksimal 80 karakter."),
  grade_level: z.string().trim().max(50, "Maksimal 50 karakter.").optional(),
});

export async function createClass(formData: FormData) {
  const parsed = createClassSchema.safeParse({
    name: formData.get("name"),
    grade_level: formData.get("grade_level") || undefined,
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

  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id")
    .eq("school_id", member.school_id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!activeYear) return { error: "Tidak ada tahun ajaran aktif. Silakan atur di Pengaturan terlebih dahulu." };

  const { error } = await supabase.from("classes").insert({
    school_id: member.school_id,
    academic_year_id: activeYear.id,
    name: parsed.data.name,
    grade_level: parsed.data.grade_level || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Kelas dengan nama ini sudah ada di tahun ajaran aktif." };
    console.error("createClass failed:", error);
    return { error: "Gagal menyimpan kelas." };
  }

  revalidatePath("/classes");
  return { success: true };
}

const addStudentSchema = z.object({
  display_name: z.string().trim().min(1, "Nama murid tidak boleh kosong.").max(150, "Maksimal 150 karakter."),
  local_code: z.string().trim().max(50, "Maksimal 50 karakter.").optional(),
});

export async function addStudentToClass(classId: string, formData: FormData) {
  const parsed = addStudentSchema.safeParse({
    display_name: formData.get("display_name"),
    local_code: formData.get("local_code") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  // Check access to the class
  const { data: classData } = await supabase
    .from("classes")
    .select("school_id")
    .eq("id", classId)
    .limit(1)
    .single();

  if (!classData) return { error: "Kelas tidak ditemukan." };

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("school_id", classData.school_id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) return { error: "Tidak memiliki akses ke sekolah ini." };

  let studentId: string | null = null;
  const localCode = parsed.data.local_code || null;

  // If local_code is provided, try to find existing student
  if (localCode) {
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("school_id", member.school_id)
      .eq("local_code", localCode)
      .limit(1)
      .maybeSingle();
      
    if (existingStudent) {
      studentId = existingStudent.id;
    }
  }

  // Insert new student if not found
  if (!studentId) {
    const { data: newStudent, error: insertStudentError } = await supabase
      .from("students")
      .insert({
        school_id: member.school_id,
        display_name: parsed.data.display_name,
        local_code: localCode,
      })
      .select("id")
      .single();

    if (insertStudentError) {
      if (insertStudentError.code === "23505") return { error: "Murid dengan nomor unik ini sudah ada (konflik data)." };
      console.error("addStudentToClass: insert student failed:", insertStudentError);
      return { error: "Gagal menyimpan data murid." };
    }
    studentId = newStudent.id;
  } else {
    // Optionally update the student's name if we are re-using the record?
    // Let's keep it simple and just use the existing one.
  }

  // Link student to class
  const { error: linkError } = await supabase
    .from("class_students")
    .insert({
      class_id: classId,
      student_id: studentId,
      joined_on: new Date().toISOString().split("T")[0],
    });

  if (linkError) {
    if (linkError.code === "23505") return { error: "Murid sudah terdaftar di kelas ini." };
    console.error("addStudentToClass: link failed:", linkError);
    return { error: "Gagal mendaftarkan murid ke kelas." };
  }

  revalidatePath(`/classes/${classId}`);
  return { success: true };
}
