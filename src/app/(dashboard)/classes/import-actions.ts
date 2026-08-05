"use server";

import { requireActiveSchool } from "@/lib/schools/active-school";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const importStudentsSchema = z.array(
  z.object({
    display_name: z.string().trim().min(1).max(150),
    local_code: z.string().trim().max(50).optional().nullable(),
  })
).max(1000, "Maksimal 1000 murid dalam satu kali import.");

export async function importStudentsToClass(classId: string, studentsPayload: { display_name: string, local_code?: string | null }[]) {
  const parsed = importStudentsSchema.safeParse(studentsPayload);

  if (!parsed.success) {
    return { error: "Data murid tidak valid. Pastikan nama tidak kosong dan kurang dari 150 karakter." };
  }

  const studentsToImport = parsed.data;
  if (studentsToImport.length === 0) return { error: "Tidak ada data murid untuk di-import." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: classData } = await supabase
    .from("classes")
    .select("school_id")
    .eq("id", classId)
    .limit(1)
    .single();

  if (!classData) return { error: "Kelas tidak ditemukan." };

  const { active: member } = await requireActiveSchool();

  if (!member) return { error: "Tidak memiliki akses ke sekolah ini." };

  const schoolId = member.schoolId;

  // 1. Separate students into those with local_code and those without
  const studentsWithCode = studentsToImport.filter(s => !!s.local_code);
  const studentsWithoutCode = studentsToImport.filter(s => !s.local_code);

  const finalStudentIds: string[] = [];

  // 2. Process students with local_code
  if (studentsWithCode.length > 0) {
    const codesToFind = studentsWithCode.map(s => s.local_code!);
    
    // Fetch existing students by local_code in this school
    const { data: existingStudents, error: existingError } = await supabase
      .from("students")
      .select("id, local_code")
      .eq("school_id", schoolId)
      .in("local_code", codesToFind);

    if (existingError) {
      console.error("importStudentsToClass: failed to fetch existing students", existingError);
      return { error: "Gagal memverifikasi data murid (Database Error)." };
    }

    const existingMap = new Map<string, string>();
    existingStudents?.forEach(s => existingMap.set(s.local_code!, s.id));

    const newStudentsToInsert: { school_id: string, display_name: string, local_code: string }[] = [];

    studentsWithCode.forEach(s => {
      const existingId = existingMap.get(s.local_code!);
      if (existingId) {
        finalStudentIds.push(existingId);
      } else {
        newStudentsToInsert.push({
          school_id: schoolId,
          display_name: s.display_name,
          local_code: s.local_code!
        });
      }
    });

    if (newStudentsToInsert.length > 0) {
      const { data: insertedNew, error: insertError } = await supabase
        .from("students")
        .insert(newStudentsToInsert)
        .select("id");

      if (insertError) {
        console.error("importStudentsToClass: failed to insert new students with codes", insertError);
        return { error: "Gagal meng-import murid baru (Error insert)." };
      }

      insertedNew?.forEach(s => finalStudentIds.push(s.id));
    }
  }

  // 3. Process students without local_code
  if (studentsWithoutCode.length > 0) {
    const newStudentsWithoutCode = studentsWithoutCode.map(s => ({
      school_id: schoolId,
      display_name: s.display_name,
      local_code: null
    }));

    const { data: insertedWithoutCode, error: insertError2 } = await supabase
      .from("students")
      .insert(newStudentsWithoutCode)
      .select("id");

    if (insertError2) {
      console.error("importStudentsToClass: failed to insert students without codes", insertError2);
      return { error: "Gagal meng-import murid (Error insert tanpa NIS)." };
    }

    insertedWithoutCode?.forEach(s => finalStudentIds.push(s.id));
  }

  // 4. Enroll all to class
  if (finalStudentIds.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const classLinks = finalStudentIds.map(id => ({
      class_id: classId,
      student_id: id,
      joined_on: today
    }));

    // Perform bulk insert into class_students, ignoring conflicts (if student already in class)
    // Unfortunately Supabase JS insert doesn't support 'on conflict do nothing' out of the box natively on array insert without specifying columns constraint,
    // but we can query existing links first.
    
    const { data: existingLinks } = await supabase
      .from("class_students")
      .select("student_id")
      .eq("class_id", classId)
      .in("student_id", finalStudentIds);

    const existingLinkSet = new Set(existingLinks?.map(l => l.student_id) || []);
    const newLinks = classLinks.filter(l => !existingLinkSet.has(l.student_id));

    if (newLinks.length > 0) {
      const { error: linkError } = await supabase
        .from("class_students")
        .insert(newLinks);

      if (linkError) {
        console.error("importStudentsToClass: failed to link students", linkError);
        return { error: "Berhasil membuat murid, tetapi gagal menambahkan beberapa murid ke kelas." };
      }
    }
  }

  revalidatePath(`/classes/${classId}`);
  return { success: true };
}
