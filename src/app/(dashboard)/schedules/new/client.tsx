"use client";

import { useActionState } from "react";
import { createSchedule } from "../actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const DAYS = [
  { id: 1, name: "Senin" },
  { id: 2, name: "Selasa" },
  { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" },
  { id: 5, name: "Jumat" },
  { id: 6, name: "Sabtu" },
  { id: 7, name: "Minggu" }
];

export function CreateScheduleForm({ classes, subjects }: { classes: Record<string, unknown>[], subjects: Record<string, unknown>[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const res = await createSchedule(prevState, formData);
      if (res.error) return { error: res.error, success: false };
      router.push("/schedules");
      return { error: null, success: true };
    },
    { error: null, success: false }
  );

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 max-w-2xl">
      <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em] text-slate-950">Detail Jadwal Mengajar</h2>
      
      {state.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>
      )}

      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="class_id" className="block text-sm font-semibold text-slate-800 mb-2">
              Kelas
            </label>
            <select
              id="class_id"
              name="class_id"
              required
              className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Pilih Kelas...</option>
              {classes.map(c => (
                <option key={c.id as string} value={c.id as string}>{c.name as string}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subject_id" className="block text-sm font-semibold text-slate-800 mb-2">
              Mata Pelajaran
            </label>
            <select
              id="subject_id"
              name="subject_id"
              required
              className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Pilih Mapel...</option>
              {subjects.map(s => (
                <option key={s.id as string} value={s.id as string}>{s.name as string}</option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">Belum ada mapel. Tambahkan di Pengaturan.</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="day_of_week" className="block text-sm font-semibold text-slate-800 mb-2">
            Hari
          </label>
          <select
            id="day_of_week"
            name="day_of_week"
            required
            className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-1/2"
          >
            <option value="">Pilih Hari...</option>
            {DAYS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="starts_at" className="block text-sm font-semibold text-slate-800 mb-2">
              Waktu Mulai
            </label>
            <input
              type="time"
              id="starts_at"
              name="starts_at"
              required
              className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label htmlFor="ends_at" className="block text-sm font-semibold text-slate-800 mb-2">
              Waktu Selesai
            </label>
            <input
              type="time"
              id="ends_at"
              name="ends_at"
              required
              className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="room" className="block text-sm font-semibold text-slate-800 mb-2">
            Ruangan (Opsional)
          </label>
          <input
            id="room"
            name="room"
            maxLength={100}
            className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
