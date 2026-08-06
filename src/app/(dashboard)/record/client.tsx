"use client";

import { CheckCircle2, CloudOff, Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { saveToOutbox, type AttendanceValue, type ClassRecordPayload } from "@/lib/offline-db";
import { saveClassRecord } from "./actions";

export type RecordStudent = { id: string; name: string; code: string | null };

const attendanceOptions: Array<{ value: AttendanceValue; label: string }> = [
  { value: "present", label: "Hadir" },
  { value: "sick", label: "Sakit" },
  { value: "permission", label: "Izin" },
  { value: "late", label: "Terlambat" },
  { value: "absent", label: "Alpa" },
];

export function RecordClient({ assignmentId, date, students }: { assignmentId: string; date: string; students: RecordStudent[] }) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceValue>>(() => Object.fromEntries(students.map((student) => [student.id, "present"])));
  const [online, setOnline] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const attendancePayload = useMemo(
    () => students.map((student) => ({ student_id: student.id, status: attendance[student.id] ?? "present" })),
    [attendance, students],
  );

  function buildPayload(form: HTMLFormElement): ClassRecordPayload {
    const data = new FormData(form);
    return {
      assignment_id: assignmentId,
      date,
      attendance: attendancePayload,
      topic: String(data.get("topic") ?? "").trim(),
      activity_summary: String(data.get("activity_summary") ?? "").trim(),
      reflection: String(data.get("reflection") ?? "").trim(),
      obstacle: String(data.get("obstacle") ?? "").trim(),
      follow_up: String(data.get("follow_up") ?? "").trim(),
    };
  }

  async function submit(form: HTMLFormElement) {
    const payload = buildPayload(form);
    if (!payload.topic) {
      setMessage({ type: "error", text: "Topik pembelajaran wajib diisi." });
      return;
    }

    if (!window.navigator.onLine) {
      await saveToOutbox(payload);
      window.dispatchEvent(new Event("temanguru-outbox-changed"));
      setMessage({ type: "success", text: "Koneksi offline. Catatan disimpan di perangkat dan akan disinkronkan saat online." });
      return;
    }

    const data = new FormData(form);
    data.set("assignment_id", assignmentId);
    data.set("date", date);
    data.set("attendance", JSON.stringify(attendancePayload));
    startTransition(async () => {
      const result = await saveClassRecord(null, data);
      if ("error" in result && result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: ("message" in result && result.message) ? String(result.message) : "Catatan berhasil disimpan." });
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }}>
      {message ? <p role={message.type === "error" ? "alert" : "status"} className={`rounded-xl border p-3 text-sm ${message.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{message.text}</p> : null}
      <section className="tg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Presensi</h2><p className="text-sm tg-muted">Semua murid ditandai hadir secara default.</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{students.length} murid</span></div>
        <div className="mt-5 space-y-3">{students.map((student) => <article key={student.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--tg-border)] p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-semibold">{student.name}</p><p className="text-sm tg-muted">{student.code ? `Kode ${student.code}` : "Tanpa kode lokal"}</p></div><select aria-label={`Status ${student.name}`} value={attendance[student.id]} onChange={(event) => setAttendance((current) => ({ ...current, [student.id]: event.target.value as AttendanceValue }))} className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">{attendanceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></article>)}</div>
      </section>
      <section className="tg-card p-5 sm:p-6"><h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Jurnal mengajar</h2><div className="mt-5 grid gap-4"><label className="block text-sm font-bold">Topik pembelajaran<input name="topic" required maxLength={500} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Ringkasan kegiatan<textarea name="activity_summary" rows={4} maxLength={5000} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" /></label><div className="grid gap-4 lg:grid-cols-3"><label className="block text-sm font-bold">Refleksi<textarea name="reflection" rows={3} maxLength={5000} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" /></label><label className="block text-sm font-bold">Kendala<textarea name="obstacle" rows={3} maxLength={3000} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" /></label><label className="block text-sm font-bold">Tindak lanjut<textarea name="follow_up" rows={3} maxLength={3000} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" /></label></div></div></section>
      <button type="submit" disabled={pending || students.length === 0} className="tg-primary-button min-h-12 px-5">{pending ? <Loader2 className="animate-spin" size={18} /> : online ? <Save size={18} /> : <CloudOff size={18} />}{pending ? "Menyimpan…" : online ? "Simpan presensi & jurnal" : "Simpan untuk disinkronkan"}</button>
      <p className="flex items-center gap-2 text-xs tg-muted"><CheckCircle2 size={15} className="text-emerald-600" />Penyimpanan online dilakukan dalam satu transaksi database dan aman untuk retry.</p>
    </form>
  );
}
