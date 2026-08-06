"use client";

import { useActionState } from "react";
import { createClass } from "./actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function ClassList({ classes }: { classes: Record<string, unknown>[] }) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Daftar Kelas</h2>
      {classes.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada kelas di tahun ajaran ini. Silakan tambah baru.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link
              key={cls.id as string}
              href={`/classes/${cls.id}`}
              className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <GraduationCap size={24} />
                </span>
                <div>
                  <h3 className="font-bold text-slate-950">{cls.name as string}</h3>
                  <p className="text-sm text-slate-500">
                    {cls.grade_level ? `Tingkat: ${cls.grade_level as string}` : "Tidak ada tingkat"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateClassForm() {
  const [state, formAction, isPending] = useActionState(async (prevState: unknown, formData: FormData) => {
    try {
      await createClass(formData);
      return { error: null, success: true };
    } catch (e: any) {
      if (e?.message?.includes("NEXT_REDIRECT")) throw e;
      return { error: "Terjadi kesalahan", success: false };
    }
  }, { error: null, success: false });

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-950">Tambah Kelas</h2>
      <p className="mt-1 text-sm text-slate-600">Buat kelas baru untuk diisi dengan murid.</p>
      
      {state.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Kelas berhasil ditambahkan.</p>
      )}

      <form action={formAction} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-slate-800">Nama Kelas (Contoh: X MIPA 1)</label>
            <input
              id="name"
              name="name"
              required
              minLength={1}
              maxLength={80}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label htmlFor="grade_level" className="text-sm font-semibold text-slate-800">Tingkat (Opsional, Contoh: 10)</label>
            <input
              id="grade_level"
              name="grade_level"
              maxLength={50}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Menyimpan..." : "Simpan Kelas"}
        </Button>
      </form>
    </section>
  );
}
