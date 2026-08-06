"use client";

import { useActionState } from "react";
import { createSubject } from "./actions";
import { Button } from "@/components/ui/button";
import { BookMarked } from "lucide-react";

export function SubjectList({ subjects }: { subjects: Record<string, unknown>[] }) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Daftar Mata Pelajaran</h2>
      {subjects.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada mata pelajaran. Silakan tambah baru.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((sub) => (
            <div
              key={sub.id as string}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-500">
                <BookMarked size={20} />
              </span>
              <div>
                <h3 className="font-bold text-slate-950 truncate max-w-[200px]" title={sub.name as string}>
                  {sub.name as string}
                </h3>
                <p className="text-sm text-slate-500">
                  {sub.code ? `Kode: ${sub.code as string}` : "Tidak ada kode"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateSubjectForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      try {
      await createSubject(formData);
      return { error: null, success: true };
    } catch (e: any) {
      if (e?.message?.includes("NEXT_REDIRECT")) throw e;
      return { error: "Terjadi kesalahan", success: false };
    }
    },
    { error: null, success: false }
  );

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-950">Tambah Mata Pelajaran</h2>
      <p className="mt-1 text-sm text-slate-600">
        Mata pelajaran ini dapat dipilih saat membuat jadwal mengajar.
      </p>

      {state.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          Mata pelajaran berhasil ditambahkan.
        </p>
      )}

      <form action={formAction} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-slate-800">
              Nama Mata Pelajaran
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={1}
              maxLength={120}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label htmlFor="code" className="text-sm font-semibold text-slate-800">
              Kode (Opsional, cth: MAT)
            </label>
            <input
              id="code"
              name="code"
              maxLength={50}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </section>
  );
}
