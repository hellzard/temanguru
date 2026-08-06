"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirectWithMessage } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
const schema=z.object({name:z.string().trim().min(2).max(120),code:z.string().trim().max(30).optional()});
export async function createSubject(formData:FormData){const parsed=schema.safeParse({name:formData.get('name'),code:formData.get('code')||undefined});if(!parsed.success)redirectWithMessage('/settings/subjects','error','Mata pelajaran belum valid.');const context=await requireActiveSchool();if(!['owner','admin'].includes(context.active.role))redirectWithMessage('/settings/subjects','error','Izin tidak mencukupi.');const supabase=await createClient();const{error}=await supabase.from('subjects').insert({school_id:context.active.schoolId,name:parsed.data.name,code:parsed.data.code||null});if(error)redirectWithMessage('/settings/subjects','error',error.code==='23505'?'Kode mata pelajaran sudah digunakan.':'Mata pelajaran belum tersimpan.');revalidatePath('/settings/subjects');redirectWithMessage('/settings/subjects','success','Mata pelajaran berhasil dibuat.');}
