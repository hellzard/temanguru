"use client";

import { useActionState } from "react";
import { createAcademicYear, setActiveAcademicYear } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function AcademicYearList({ years }: { years: Record<string, unknown>[] }) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Daftar Tahun Ajaran</h2>
      {years.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada tahun ajaran. Silakan tambah baru.</p>
      ) : (
        <div className="space-y-3">
          {years.map((year) => (
            <div key={year.id as string} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-950">{year.name as string}</h3>
                  {year.is_active ? <Badge tone="success">Aktif</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(year.starts_on as string).toLocaleDateString("id-ID")} — {new Date(year.ends_on as string).toLocaleDateString("id-ID")}
                </p>
              </div>
              {!year.is_active && (
                <form action={async () => { await setActiveAcademicYear(year.id as string); }}>
                  <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                    <CheckCircle2 className="mr-2" size={16} /> Aktifkan
                  </Button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateAcademicYearForm() {
  const [state, formAction, isPending] = useActionState(async (prevState: unknown, formData: FormData) => {
    try {
      await createAcademicYear(formData);
      return { error: null, success: true };
    } catch (e: any) {
      if (e?.message?.includes("NEXT_REDIRECT")) throw e;
      return { error: "Terjadi kesalahan", success: false };
    }
  }, { error: null, success: false });

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-950">Tambah Tahun Ajaran</h2>
      <p className="mt-1 text-sm text-slate-600">Buat periode baru untuk kelas dan penilaian.</p>
      
      {state.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Tahun ajaran berhasil ditambahkan.</p>
      )}

      <form action={formAction} className="mt-5 space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-slate-800">Nama (Contoh: 2026/2027 Ganjil)</label>
          <input
            id="name"
            name="name"
            required
            minLength={3}
            maxLength={40}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="starts_on" className="text-sm font-semibold text-slate-800">Tanggal Mulai</label>
            <input
              id="starts_on"
              name="starts_on"
              type="date"
              required
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label htmlFor="ends_on" className="text-sm font-semibold text-slate-800">Tanggal Selesai</label>
            <input
              id="ends_on"
              name="ends_on"
              type="date"
              required
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Menyimpan..." : "Simpan Tahun Ajaran"}
        </Button>
      </form>
    </section>
  );
}
