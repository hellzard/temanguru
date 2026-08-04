"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, UserCheck, UserX, Clock, Stethoscope, Briefcase, Maximize, Minimize } from "lucide-react";
import { saveClassRecord } from "./actions";
import { saveToOutbox } from "@/lib/offline-db";

type Student = {
  id: string;
  name: string;
  local_code: string;
};

type AssignmentOption = {
  id: string;
  class_id: string;
  label: string;
};

type Props = {
  assignments: AssignmentOption[];
  selectedAssignmentId: string;
  selectedDate: string;
  students: Student[];
  existingJournal?: Record<string, unknown> | null;
  existingAttendance?: Record<string, unknown>[];
};

const STATUS_OPTIONS = [
  { value: "present", label: "H", icon: UserCheck, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { value: "sick", label: "S", icon: Stethoscope, color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "permission", label: "I", icon: Briefcase, color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "absent", label: "A", icon: UserX, color: "text-red-700 bg-red-50 border-red-200" },
  { value: "late", label: "T", icon: Clock, color: "text-purple-700 bg-purple-50 border-purple-200" },
];

export function ClassRecordForm({
  assignments,
  selectedAssignmentId,
  selectedDate,
  students,
  existingJournal,
  existingAttendance
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [assignmentId, setAssignmentId] = useState(selectedAssignmentId);
  const [date, setDate] = useState(selectedDate);
  
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const initialAttendance: Record<string, string> = {};
    students.forEach(s => {
      initialAttendance[s.id] = "present";
    });
    if (existingAttendance && existingAttendance.length > 0) {
      existingAttendance.forEach(a => {
        initialAttendance[a.student_id as string] = a.status as string;
      });
    }
    return initialAttendance;
  });
  
  const [topic, setTopic] = useState((existingJournal?.topic as string) || "");
  const [activitySummary, setActivitySummary] = useState((existingJournal?.activity_summary as string) || "");
  const [reflection, setReflection] = useState((existingJournal?.reflection as string) || "");
  const [obstacle, setObstacle] = useState((existingJournal?.obstacle as string) || "");
  const [followUp, setFollowUp] = useState((existingJournal?.follow_up as string) || "");

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Define an inline type for wakeLock to satisfy TypeScript without using 'any'
  interface WakeLockSentinel { release: () => Promise<void> }
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
        if (wakeLockRef.current) {
          wakeLockRef.current.release().catch(console.error);
          wakeLockRef.current = null;
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFocusMode = async () => {
    if (!document.fullscreenElement) {
      try {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
        if ('wakeLock' in navigator) {
          const nav = navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } };
          wakeLockRef.current = await nav.wakeLock.request('screen');
        }
        setIsFocusMode(true);
      } catch (err) {
        console.error("Error attempting to enable focus mode:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFocusMode(false);
    }

  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setAssignmentId(val);
    router.push(`/record?assignment_id=${val}&date=${date}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDate(val);
    if (assignmentId) {
      router.push(`/record?assignment_id=${assignmentId}&date=${val}`);
    }
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!assignmentId) {
      setErrorMsg("Pilih kelas dan mata pelajaran terlebih dahulu.");
      return;
    }

    if (!topic.trim()) {
      setErrorMsg("Topik pembelajaran wajib diisi.");
      return;
    }

    const attendanceArray = Object.entries(attendance).map(([student_id, status]) => ({
      student_id,
      status
    }));

    const formData = new FormData();
    formData.append("assignment_id", assignmentId);
    formData.append("date", date);
    formData.append("attendance", JSON.stringify(attendanceArray));
    formData.append("topic", topic);
    formData.append("activity_summary", activitySummary);
    formData.append("reflection", reflection);
    formData.append("obstacle", obstacle);
    formData.append("follow_up", followUp);

    startTransition(async () => {
      try {
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
           throw new Error("offline");
        }

        const result = await saveClassRecord(null, formData);
        if (result.error) {
          setErrorMsg(result.error);
        } else {
          setSuccessMsg(result.message || "Berhasil disimpan!");
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sync-status-changed'));
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error && (e.message === "offline" || (e.name === "TypeError" && e.message === "Failed to fetch"))) {
          // Save to IndexedDB
          await saveToOutbox({
            assignment_id: assignmentId,
            date,
            attendance: attendanceArray,
            topic,
            activity_summary: activitySummary,
            reflection,
            obstacle,
            follow_up: followUp
          });
          setSuccessMsg("Koneksi terputus. Data berhasil disimpan sebagai draft offline!");
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sync-status-changed'));
          }
        } else {
          setErrorMsg("Gagal menyimpan data: " + (e instanceof Error ? e.message : "Terjadi kesalahan"));
        }
      }
    });
  };

  return (
    <div ref={containerRef} className={isFocusMode ? "fixed inset-0 z-[100] bg-slate-50 overflow-y-auto p-4 sm:p-8" : ""}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={isFocusMode ? "text-xl font-bold text-slate-900" : "sr-only"}>Mode Fokus Mengajar</h2>
        <button
          type="button"
          onClick={toggleFocusMode}
          className="ml-auto flex items-center gap-2 rounded-xl bg-indigo-100 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-200"
        >
          {isFocusMode ? (
            <>
              <Minimize size={16} /> Keluar Mode Fokus
            </>
          ) : (
            <>
              <Maximize size={16} /> Mode Fokus
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-8 ${isFocusMode ? "max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200" : ""}`}>
        {/* 1. Pengaturan Dasar */}
        <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="assignment" className="text-sm font-semibold text-slate-900">Kelas & Mata Pelajaran</label>
          <select
            id="assignment"
            value={assignmentId}
            onChange={handleAssignmentChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">-- Pilih Kelas --</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-semibold text-slate-900">Tanggal</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>

      {assignmentId && students.length > 0 && (
        <>
          <hr className="border-slate-200" />
          
          {/* 2. Presensi Cepat */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Presensi Murid</h3>
              <div className="text-xs text-slate-500">Sentuh untuk mengubah</div>
            </div>
            
            <div className="space-y-3">
              {students.map(student => {
                const currentStatus = attendance[student.id] || "present";
                
                return (
                  <div key={student.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
                    <div className="font-medium text-slate-900">{student.name}</div>
                    <div className="flex shrink-0 gap-1.5">
                      {STATUS_OPTIONS.map(opt => {
                        const isSelected = currentStatus === opt.value;
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, opt.value)}
                            className={`flex h-10 w-11 flex-col items-center justify-center rounded-lg border text-[10px] font-bold transition-colors ${
                              isSelected ? opt.color : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                            }`}
                            title={opt.label}
                          >
                            <Icon size={14} className="mb-0.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* 3. Jurnal Cepat */}
          <section className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Jurnal Mengajar</h3>
            
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-semibold text-slate-900">Topik / Materi <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Contoh: Operasi Bilangan Bulat"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="activity" className="text-sm font-semibold text-slate-900">Ringkasan Kegiatan</label>
              <textarea
                id="activity"
                value={activitySummary}
                onChange={e => setActivitySummary(e.target.value)}
                placeholder="Apa saja yang dilakukan di kelas ini?"
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reflection" className="text-sm font-semibold text-slate-900">Refleksi Guru (Opsional)</label>
              <textarea
                id="reflection"
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                placeholder="Catatan pribadi atau refleksi tentang kelas hari ini."
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="obstacle" className="text-sm font-semibold text-slate-900">Hambatan (Opsional)</label>
                <textarea
                  id="obstacle"
                  value={obstacle}
                  onChange={e => setObstacle(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="followUp" className="text-sm font-semibold text-slate-900">Tindak Lanjut (Opsional)</label>
                <textarea
                  id="followUp"
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </section>

          {/* Messages */}
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <Check size={16} />
              {successMsg}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {isPending ? "Menyimpan..." : "Simpan Catatan Kelas"}
            </button>
          </div>
        </>
      )}

      {assignmentId && students.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          Belum ada murid di kelas ini.
        </div>
      )}
      </form>
    </div>
  );
}
