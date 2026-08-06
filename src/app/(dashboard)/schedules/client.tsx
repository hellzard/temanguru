"use client";

import { CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function ScheduleList({ schedules }: { schedules: Record<string, unknown>[] }) {
  // Group by day_of_week
  const grouped = DAYS.map((dayName, idx) => {
    const dayNumber = idx + 1;
    const daySchedules = schedules.filter(s => s.day_of_week === dayNumber);
    // Sort by starts_at
    daySchedules.sort((a, b) => (a.starts_at as string).localeCompare(b.starts_at as string));
    return { dayName, dayNumber, schedules: daySchedules };
  });

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">Jadwal Mingguan Anda</h2>
        <Link href="/schedules/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50">
          Tambah Jadwal
        </Link>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CalendarDays className="mx-auto mb-3 text-slate-300" size={48} />
          <h3 className="text-lg font-bold text-slate-950">Belum ada jadwal</h3>
          <p className="mt-1 text-sm text-slate-500">Mulai tambahkan jadwal mengajar mingguan Anda.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {grouped.filter(g => g.schedules.length > 0).map((group) => (
            <div key={group.dayNumber} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">{group.dayName}</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {group.schedules.map(sched => {
                  const assignment = sched.teaching_assignments as Record<string, unknown>;
                  const subjectName = (assignment?.subjects as Record<string, unknown>)?.name as string || "Tanpa Mapel";
                  const className = (assignment?.classes as Record<string, unknown>)?.name as string || "Tanpa Kelas";
                  
                  return (
                    <div key={sched.id as string} className="p-5 transition hover:bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-indigo-900">{subjectName}</h4>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                          {className}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <span>{(sched.starts_at as string).slice(0, 5)} - {(sched.ends_at as string).slice(0, 5)}</span>
                        </div>
                        {!!sched.room && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-slate-400" />
                            <span>{sched.room as string}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
