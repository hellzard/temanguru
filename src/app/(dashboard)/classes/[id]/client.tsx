"use client";

import { useActionState } from "react";
import { addStudentToClass } from "../actions";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";

export function StudentList({ students }: { students: Record<string, unknown>[] }) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Daftar Murid</h2>
      {students.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada murid di kelas ini. Silakan tambah baru.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <div
              key={student.id as string}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <User size={20} />
              </span>
              <div>
                <h3 className="font-bold text-slate-950 truncate max-w-[200px]" title={student.display_name as string}>
                  {student.display_name as string}
                </h3>
                <p className="text-sm text-slate-500">
                  {student.local_code ? `NIS/NISN: ${student.local_code as string}` : "Tidak ada NIS"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddStudentForm({ classId }: { classId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const res = await addStudentToClass(classId, formData);
      if (res.error) return { error: res.error, success: false };
      return { error: null, success: true };
    },
    { error: null, success: false }
  );

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-950">Tambah Murid</h2>
      <p className="mt-1 text-sm text-slate-600">
        Tambahkan murid ke kelas ini secara manual.
      </p>

      {state.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          Murid berhasil ditambahkan.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <form action={formAction} className="space-y-4 sm:flex-1">
          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <label htmlFor="display_name" className="text-sm font-semibold text-slate-800">
                Nama Murid Lengkap
              </label>
              <input
                id="display_name"
                name="display_name"
                required
                minLength={1}
                maxLength={150}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label htmlFor="local_code" className="text-sm font-semibold text-slate-800">
                NIS/NISN (Opsional, tapi disarankan)
              </label>
              <input
                id="local_code"
                name="local_code"
                maxLength={50}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Menyimpan..." : "Tambah Murid"}
          </Button>
        </form>

        <div className="rounded-2xl bg-indigo-50 p-4 sm:w-64">
          <h3 className="font-semibold text-indigo-900">Punya Banyak Murid?</h3>
          <p className="mt-1 text-sm text-indigo-700 mb-3">Import data murid sekaligus menggunakan file CSV.</p>
          <Link href={`/classes/${classId}/import`} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            Import dari CSV
          </Link>
        </div>
      </div>
    </section>
  );
}
