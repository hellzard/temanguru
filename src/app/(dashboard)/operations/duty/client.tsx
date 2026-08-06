"use client";

import { useTransition, useState } from "react";
import { Plus, CalendarDays, RefreshCw, UserCheck } from "lucide-react";
import { createDutySchedule } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const initialState = { success: false, message: "" };

type ScheduleItem = Record<string, unknown> & {
  id?: string;
  status?: string;
  date?: string;
  duty_type?: string;
  school_members?: { users?: { name?: string; email?: string } };
};

type TeacherItem = Record<string, unknown> & {
  id?: string;
  users?: { name?: string; email?: string };
};

export function DutyClient({ schedules, teachers, isAdmin }: { schedules: ScheduleItem[], teachers: TeacherItem[], isAdmin: boolean }) {
  const [pending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createDutySchedule(formData);
      } catch (e: any) {
        if (e?.message?.includes("NEXT_REDIRECT")) throw e;
        toast.error("Terjadi kesalahan.");
      }
    });
  };

  const dutyTypeMap: Record<string, string> = {
    "morning_gate": "Sambut Pagi (Gerbang)",
    "break_time": "Jaga Istirahat (Kantin & Lapangan)",
    "after_school": "Kepulangan (Gerbang Utama)"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Jadwal Piket Guru</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jadwal guru piket harian dan permohonan pertukaran jadwal.
          </p>
        </div>
        {isAdmin && !isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Buat Jadwal
          </Button>
        )}
      </div>

      {isFormOpen && isAdmin && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Input Jadwal Piket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-slate-800">
                  Tanggal
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="duty_type" className="block text-sm font-semibold text-slate-800">
                  Jenis Piket
                </label>
                <select
                  id="duty_type"
                  name="duty_type"
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
                >
                  <option value="morning_gate">{dutyTypeMap["morning_gate"]}</option>
                  <option value="break_time">{dutyTypeMap["break_time"]}</option>
                  <option value="after_school">{dutyTypeMap["after_school"]}</option>
                </select>
              </div>
              <div>
                <label htmlFor="member_id" className="block text-sm font-semibold text-slate-800">
                  Guru Tugas
                </label>
                <select
                  id="member_id"
                  name="member_id"
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
                  required
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((teacher: TeacherItem) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.users?.name || teacher.users?.email || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan Jadwal"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {schedules.length === 0 && !isFormOpen ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <CalendarDays size={24} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-950">Belum ada jadwal piket</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Minta admin sekolah untuk mengatur jadwal piket harian di halaman ini.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  schedule.status === 'scheduled' ? 'bg-indigo-100 text-indigo-700' :
                  schedule.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {schedule.status === 'scheduled' ? 'Terjadwal' : 
                   schedule.status === 'completed' ? 'Selesai' : 'Ditukar'}
                </span>
              </div>
              
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">
                      {schedule.school_members?.users?.name || schedule.school_members?.users?.email || 'Unknown'}
                    </h3>
                    <p className="text-xs text-slate-500">Guru Piket</p>
                  </div>
                </div>

                <div className="mt-6 flex-1 space-y-2">
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Tanggal</span>
                    <span className="font-medium text-slate-900">
                      {schedule.date ? new Date(schedule.date).toLocaleDateString("id-ID", {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                      }) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Tugas</span>
                    <span className="font-medium text-slate-900 text-right max-w-[150px] line-clamp-2">
                      {dutyTypeMap[schedule.duty_type || ""] || schedule.duty_type}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <Button variant="secondary" className="w-full" disabled={schedule.status !== 'scheduled'}>
                    <RefreshCw size={14} className="mr-2" /> Ajukan Tukar Jadwal
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
