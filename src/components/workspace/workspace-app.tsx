"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Check,
  ClipboardCheck,
  Cloud,
  CloudOff,
  DatabaseBackup,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { downloadWorkspaceBackup, parseWorkspaceBackup } from "@/lib/workspace/backup";
import { fetchCloudWorkspace, uploadCloudWorkspace } from "@/lib/workspace/cloud";
import { createId, createSampleWorkspace, isWorkspaceEmpty } from "@/lib/workspace/defaults";
import type {
  AttendanceStatus,
  LocalAssessment,
  LocalClass,
  LocalDocument,
  LocalEvent,
  LocalInventoryItem,
} from "@/lib/workspace/types";
import { useWorkspace } from "@/lib/workspace/workspace-provider";

type WorkspaceView = "dashboard" | "classes" | "record" | "assessment" | "documents" | "events" | "inventory" | "backup";
type AccountState = { userId: string; email: string } | null;
type SyncState = "idle" | "checking" | "syncing" | "synced" | "error";

const navigation: { id: WorkspaceView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { id: "classes", label: "Kelas & Murid", icon: GraduationCap },
  { id: "record", label: "Catat Kelas", icon: ClipboardCheck },
  { id: "assessment", label: "Penilaian", icon: BarChart3 },
  { id: "documents", label: "Dokumen", icon: FileText },
  { id: "events", label: "Agenda", icon: CalendarDays },
  { id: "inventory", label: "Inventaris", icon: Package },
  { id: "backup", label: "Backup & Sinkron", icon: DatabaseBackup },
];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function inputClass() {
  return "mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 text-[var(--tg-text)] outline-none focus:border-[var(--tg-primary)]";
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal tg-muted">{hint}</span> : null}
    </label>
  );
}

function SectionTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
        <p className="mt-1 text-sm leading-6 tg-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--tg-border)] p-8 text-center">
      <p className="font-bold">{title}</p>
      <p className="mt-2 text-sm tg-muted">{text}</p>
    </div>
  );
}

function ConfirmDeleteButton({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Hapus ${label}`}
      onClick={() => {
        if (window.confirm(`Hapus ${label}? Tindakan ini tidak dapat dibatalkan kecuali melalui backup.`)) onDelete();
      }}
      className="grid size-10 place-items-center rounded-xl text-rose-600 hover:bg-rose-50"
    >
      <Trash2 size={17} />
    </button>
  );
}

function AccountSync({ onOpenBackup }: { onOpenBackup: () => void }) {
  const { workspace, replaceWorkspace } = useWorkspace();
  const [account, setAccount] = useState<AccountState>(null);
  const [checkingAccount, setCheckingAccount] = useState(hasSupabaseEnv);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [message, setMessage] = useState("");
  const lastSyncedWorkspaceUpdate = useRef<string | null>(null);
  const accountRef = useRef<AccountState>(null);
  const workspaceRef = useRef(workspace);

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  const syncNow = useCallback(async (mode: "auto" | "upload" | "download" = "auto") => {
    const currentAccount = accountRef.current;
    const currentWorkspace = workspaceRef.current;
    if (!currentAccount || !hasSupabaseEnv) return;
    setSyncState("syncing");
    setMessage("");
    try {
      const remote = await fetchCloudWorkspace(currentAccount.userId);
      if (mode === "download") {
        if (!remote) throw new Error("Belum ada backup cloud untuk akun ini.");
        replaceWorkspace(remote.payload, { touch: false });
        lastSyncedWorkspaceUpdate.current = remote.payload.updatedAt;
        setMessage("Data cloud sudah disalin ke perangkat ini.");
      } else if (mode === "upload") {
        await uploadCloudWorkspace(currentAccount.userId, currentWorkspace);
        lastSyncedWorkspaceUpdate.current = currentWorkspace.updatedAt;
        setMessage("Data perangkat sudah disimpan ke cloud.");
      } else if (!remote) {
        await uploadCloudWorkspace(currentAccount.userId, currentWorkspace);
        lastSyncedWorkspaceUpdate.current = currentWorkspace.updatedAt;
        setMessage("Backup cloud pertama berhasil dibuat.");
      } else {
        const localTime = new Date(currentWorkspace.updatedAt).getTime();
        const remoteTime = new Date(remote.payload.updatedAt).getTime();
        if (isWorkspaceEmpty(currentWorkspace) || remoteTime > localTime) {
          replaceWorkspace(remote.payload, { touch: false });
          lastSyncedWorkspaceUpdate.current = remote.payload.updatedAt;
          setMessage("Versi terbaru dari cloud dipulihkan.");
        } else {
          await uploadCloudWorkspace(currentAccount.userId, currentWorkspace);
          lastSyncedWorkspaceUpdate.current = currentWorkspace.updatedAt;
          setMessage("Perubahan terbaru tersinkron ke cloud.");
        }
      }
      setSyncState("synced");
    } catch (error) {
      setSyncState("error");
      setMessage(error instanceof Error ? error.message : "Sinkronisasi gagal.");
    }
  }, [replaceWorkspace]);

  useEffect(() => {
    if (!hasSupabaseEnv) return;
    const supabase = createClient();
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const next = data.user ? { userId: data.user.id, email: data.user.email ?? "Akun Teman Guru" } : null;
      accountRef.current = next;
      setAccount(next);
      setCheckingAccount(false);
      if (next) void syncNow("auto");
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ? { userId: session.user.id, email: session.user.email ?? "Akun Teman Guru" } : null;
      accountRef.current = next;
      setAccount(next);
      if (next) window.setTimeout(() => void syncNow("auto"), 0);
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [syncNow]);

  useEffect(() => {
    if (!account || syncState === "checking" || syncState === "syncing") return;
    if (lastSyncedWorkspaceUpdate.current === workspace.updatedAt) return;
    const timeout = window.setTimeout(() => void syncNow("upload"), 1800);
    return () => window.clearTimeout(timeout);
  }, [account, syncNow, syncState, workspace.updatedAt]);

  async function signOut() {
    if (!hasSupabaseEnv) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    accountRef.current = null;
    setAccount(null);
    setMessage("Kamu keluar dari akun. Data lokal tetap aman di perangkat ini.");
    setSyncState("idle");
  }

  if (checkingAccount) {
    return <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--tg-border)] px-3 text-sm"><Loader2 className="animate-spin" size={16} /> Memeriksa akun</span>;
  }

  if (!hasSupabaseEnv) {
    return (
      <button type="button" onClick={onOpenBackup} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 text-sm font-bold text-amber-900">
        <CloudOff size={16} /> Mode lokal
      </button>
    );
  }

  if (!account) {
    return (
      <Link href="/login?next=/workspace" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--tg-primary)] px-3 text-sm font-bold text-white">
        <LogIn size={16} /> Masuk untuk sinkron
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" onClick={() => void syncNow("auto")} disabled={syncState === "syncing"} title={message || "Sinkronkan sekarang"} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 text-sm font-bold">
        {syncState === "syncing" ? <Loader2 className="animate-spin" size={16} /> : syncState === "error" ? <CloudOff className="text-rose-600" size={16} /> : <Cloud className="text-emerald-600" size={16} />}
        <span className="hidden sm:inline">{syncState === "syncing" ? "Menyinkronkan" : "Tersambung"}</span>
      </button>
      <div className="hidden max-w-44 truncate text-xs tg-muted md:block" title={account.email}>{account.email}</div>
      <button type="button" onClick={() => void signOut()} aria-label="Keluar dari akun" className="grid size-10 place-items-center rounded-xl text-[var(--tg-text-muted)] hover:bg-[var(--tg-surface-muted)]"><LogOut size={17} /></button>
    </div>
  );
}

function DashboardView({ setView }: { setView: (view: WorkspaceView) => void }) {
  const { workspace } = useWorkspace();
  const presentCount = workspace.classRecords.reduce((total, record) => total + Object.values(record.attendance).filter((status) => status === "present").length, 0);
  const recentRecords = [...workspace.classRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const upcomingEvents = [...workspace.events].filter((event) => event.status !== "completed").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  return (
    <div className="space-y-6">
      <SectionTitle title={`Halo${workspace.profile.teacherName ? `, ${workspace.profile.teacherName}` : ""}!`} description="Semua perubahan tersimpan otomatis di perangkat. Login hanya diperlukan bila ingin sinkron antarperangkat." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {([
          { value: workspace.classes.length, label: "Kelas", icon: GraduationCap },
          { value: workspace.students.length, label: "Murid", icon: Users },
          { value: workspace.classRecords.length, label: "Catatan kelas", icon: ClipboardCheck },
          { value: presentCount, label: "Kehadiran tercatat", icon: Check },
        ] as const).map(({ value, label, icon: Icon }) => (
          <article key={String(label)} className="tg-card p-5">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold tg-muted">{String(label)}</span><Icon size={20} className="text-[var(--tg-primary)]" /></div>
            <p className="mt-4 text-3xl font-black">{String(value)}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="tg-card p-5">
          <div className="flex items-center justify-between"><h3 className="font-black">Catatan terbaru</h3><button onClick={() => setView("record")} className="text-sm font-bold text-[var(--tg-primary)]">Catat kelas</button></div>
          <div className="mt-4 space-y-3">
            {recentRecords.length === 0 ? <EmptyState title="Belum ada catatan" text="Catat presensi, materi, dan jurnal dalam satu langkah." /> : recentRecords.map((record) => {
              const selectedClass = workspace.classes.find((item) => item.id === record.classId);
              return <div key={record.id} className="rounded-2xl border border-[var(--tg-border)] p-4"><div className="flex justify-between gap-3"><p className="font-bold">{selectedClass?.name ?? "Kelas dihapus"}</p><span className="text-xs tg-muted">{formatDate(record.date)}</span></div><p className="mt-1 text-sm">{record.topic}</p><p className="mt-2 line-clamp-2 text-xs tg-muted">{record.notes || "Tanpa catatan tambahan"}</p></div>;
            })}
          </div>
        </section>
        <section className="tg-card p-5">
          <div className="flex items-center justify-between"><h3 className="font-black">Agenda berikutnya</h3><button onClick={() => setView("events")} className="text-sm font-bold text-[var(--tg-primary)]">Kelola agenda</button></div>
          <div className="mt-4 space-y-3">
            {upcomingEvents.length === 0 ? <EmptyState title="Agenda masih kosong" text="Tambahkan acara, rapat, atau tugas agar tidak terlewat." /> : upcomingEvents.map((event) => <div key={event.id} className="flex items-center gap-4 rounded-2xl border border-[var(--tg-border)] p-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><CalendarDays size={20} /></span><div className="min-w-0"><p className="truncate font-bold">{event.title}</p><p className="text-sm tg-muted">{formatDate(event.date)} · {event.category}</p></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}

function ClassesView() {
  const { workspace, updateWorkspace } = useWorkspace();
  const [selectedClassId, setSelectedClassId] = useState(workspace.classes[0]?.id ?? "");
  const selectedClass = workspace.classes.find((item) => item.id === selectedClassId) ?? workspace.classes[0] ?? null;
  const students = selectedClass ? workspace.students.filter((student) => student.classId === selectedClass.id) : [];

  useEffect(() => {
    if (!selectedClassId && workspace.classes[0]) setSelectedClassId(workspace.classes[0].id);
    if (selectedClassId && !workspace.classes.some((item) => item.id === selectedClassId)) setSelectedClassId(workspace.classes[0]?.id ?? "");
  }, [selectedClassId, workspace.classes]);

  function addClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    const id = createId("class");
    const item: LocalClass = {
      id,
      name,
      subject: String(form.get("subject") ?? "").trim(),
      grade: String(form.get("grade") ?? "").trim(),
      schedule: String(form.get("schedule") ?? "").trim(),
      createdAt: new Date().toISOString(),
    };
    updateWorkspace((draft) => { draft.classes.push(item); });
    setSelectedClassId(id);
    event.currentTarget.reset();
  }

  function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClass) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("studentName") ?? "").trim();
    if (!name) return;
    updateWorkspace((draft) => {
      draft.students.push({
        id: createId("student"),
        classId: selectedClass.id,
        name,
        studentCode: String(form.get("studentCode") ?? "").trim(),
        parentPhone: String(form.get("parentPhone") ?? "").trim(),
        createdAt: new Date().toISOString(),
      });
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Kelas dan murid" description="Data disimpan lokal. Nomor orang tua bersifat opsional dan tidak perlu diisi bila tidak dibutuhkan." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <section className="tg-card p-5">
          <h3 className="font-black">Tambah kelas</h3>
          <form onSubmit={addClass} className="mt-4 space-y-4">
            <Field label="Nama kelas"><input name="name" required maxLength={80} className={inputClass()} placeholder="VIII A" /></Field>
            <Field label="Mata pelajaran"><input name="subject" maxLength={100} className={inputClass()} placeholder="Matematika" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tingkat"><input name="grade" maxLength={20} className={inputClass()} placeholder="8" /></Field>
              <Field label="Jadwal"><input name="schedule" maxLength={80} className={inputClass()} placeholder="Senin 07.00" /></Field>
            </div>
            <button className="tg-primary-button w-full"><Plus size={17} /> Tambah kelas</button>
          </form>
          <div className="mt-6 space-y-2">
            {workspace.classes.map((item) => (
              <div key={item.id} className={`flex items-center rounded-xl border ${selectedClass?.id === item.id ? "border-[var(--tg-primary)] bg-[color-mix(in_srgb,var(--tg-primary)_8%,transparent)]" : "border-[var(--tg-border)]"}`}>
                <button type="button" onClick={() => setSelectedClassId(item.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><p className="truncate font-bold">{item.name}</p><p className="truncate text-xs tg-muted">{item.subject || "Tanpa mata pelajaran"}</p></button>
                <ConfirmDeleteButton label={`kelas ${item.name} beserta data terkait`} onDelete={() => updateWorkspace((draft) => {
                  const studentIds = new Set(draft.students.filter((student) => student.classId === item.id).map((student) => student.id));
                  const assessmentIds = new Set(draft.assessments.filter((assessment) => assessment.classId === item.id).map((assessment) => assessment.id));
                  draft.classes = draft.classes.filter((entry) => entry.id !== item.id);
                  draft.students = draft.students.filter((student) => student.classId !== item.id);
                  draft.classRecords = draft.classRecords.filter((record) => record.classId !== item.id);
                  draft.assessments = draft.assessments.filter((assessment) => assessment.classId !== item.id);
                  draft.scores = draft.scores.filter((score) => !studentIds.has(score.studentId) && !assessmentIds.has(score.assessmentId));
                })} />
              </div>
            ))}
          </div>
        </section>

        <section className="tg-card p-5">
          {!selectedClass ? <EmptyState title="Buat kelas pertama" text="Setelah kelas dibuat, kamu dapat menambahkan murid dan mencatat kegiatan." /> : (
            <>
              <div className="flex flex-col gap-2 border-b border-[var(--tg-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h3 className="text-xl font-black">{selectedClass.name}</h3><p className="text-sm tg-muted">{selectedClass.subject || "Mata pelajaran belum diisi"} · {students.length} murid</p></div>
                <select value={selectedClass.id} onChange={(event) => setSelectedClassId(event.target.value)} className="min-h-10 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 text-sm sm:hidden">{workspace.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              </div>
              <form onSubmit={addStudent} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Nama murid"><input name="studentName" required maxLength={150} className={inputClass()} /></Field>
                <Field label="NIS/NISN opsional"><input name="studentCode" maxLength={50} className={inputClass()} /></Field>
                <Field label="WhatsApp orang tua opsional"><input name="parentPhone" inputMode="tel" maxLength={30} className={inputClass()} /></Field>
                <button className="tg-primary-button mt-7"><Plus size={17} /> Tambah murid</button>
              </form>
              <div className="mt-6 overflow-x-auto">
                {students.length === 0 ? <EmptyState title="Belum ada murid" text="Tambahkan murid satu per satu. Backup JSON dapat memindahkan seluruh data sekaligus." /> : (
                  <table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[var(--tg-border)] text-xs uppercase tracking-wide tg-muted"><th className="px-3 py-3">Nama</th><th className="px-3 py-3">Kode</th><th className="px-3 py-3">Kontak</th><th className="w-12"></th></tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-b border-[var(--tg-border)]"><td className="px-3 py-3 font-semibold">{student.name}</td><td className="px-3 py-3 tg-muted">{student.studentCode || "—"}</td><td className="px-3 py-3 tg-muted">{student.parentPhone || "—"}</td><td><ConfirmDeleteButton label={`murid ${student.name}`} onDelete={() => updateWorkspace((draft) => {
                    draft.students = draft.students.filter((item) => item.id !== student.id);
                    draft.scores = draft.scores.filter((score) => score.studentId !== student.id);
                    draft.classRecords.forEach((record) => { delete record.attendance[student.id]; });
                  })} /></td></tr>)}</tbody></table>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function RecordView() {
  const { workspace, updateWorkspace } = useWorkspace();
  const [classId, setClassId] = useState(workspace.classes[0]?.id ?? "");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const students = workspace.students.filter((student) => student.classId === classId);
  const recent = [...workspace.classRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  useEffect(() => {
    setAttendance(Object.fromEntries(students.map((student) => [student.id, "present" as AttendanceStatus])));
  }, [classId, students.length]);

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!classId) return;
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date") ?? "");
    const topic = String(form.get("topic") ?? "").trim();
    if (!date || !topic) return;
    const now = new Date().toISOString();
    updateWorkspace((draft) => {
      draft.classRecords.push({ id: createId("record"), classId, date, topic, notes: String(form.get("notes") ?? "").trim(), attendance, createdAt: now, updatedAt: now });
    });
    event.currentTarget.reset();
    setAttendance(Object.fromEntries(students.map((student) => [student.id, "present" as AttendanceStatus])));
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Catat kelas" description="Presensi, materi, dan jurnal disimpan menjadi satu catatan lokal. Tidak perlu koneksi internet." />
      {workspace.classes.length === 0 ? <EmptyState title="Belum ada kelas" text="Buat kelas dan murid terlebih dahulu dari menu Kelas & Murid." /> : (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <form onSubmit={saveRecord} className="tg-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kelas"><select value={classId} onChange={(event) => setClassId(event.target.value)} className={inputClass()}>{workspace.classes.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.subject}</option>)}</select></Field>
              <Field label="Tanggal"><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass()} /></Field>
            </div>
            <Field label="Materi atau topik"><input name="topic" required maxLength={200} className={inputClass()} placeholder="Materi yang dipelajari hari ini" /></Field>
            <Field label="Catatan jurnal"><textarea name="notes" rows={4} maxLength={3000} className={inputClass()} placeholder="Refleksi pembelajaran, tugas, atau tindak lanjut" /></Field>
            <div className="mt-5">
              <p className="text-sm font-bold">Presensi</p>
              {students.length === 0 ? <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Kelas ini belum memiliki murid. Catatan tetap dapat disimpan tanpa daftar presensi.</p> : <div className="mt-3 grid gap-3 sm:grid-cols-2">{students.map((student) => <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--tg-border)] p-3"><span className="min-w-0 truncate font-semibold">{student.name}</span><select aria-label={`Status ${student.name}`} value={attendance[student.id] ?? "present"} onChange={(event) => setAttendance((current) => ({ ...current, [student.id]: event.target.value as AttendanceStatus }))} className="min-h-9 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] px-2 text-sm"><option value="present">Hadir</option><option value="sick">Sakit</option><option value="excused">Izin</option><option value="absent">Alpa</option></select></div>)}</div>}
            </div>
            <button className="tg-primary-button mt-5"><Save size={17} /> Simpan catatan</button>
          </form>
          <section className="tg-card p-5"><h3 className="font-black">Riwayat terbaru</h3><div className="mt-4 space-y-3">{recent.length === 0 ? <EmptyState title="Belum ada riwayat" text="Catatan yang disimpan akan tampil di sini." /> : recent.map((record) => <article key={record.id} className="rounded-xl border border-[var(--tg-border)] p-3"><div className="flex justify-between gap-2"><p className="font-bold">{workspace.classes.find((item) => item.id === record.classId)?.name ?? "Kelas dihapus"}</p><ConfirmDeleteButton label="catatan kelas" onDelete={() => updateWorkspace((draft) => { draft.classRecords = draft.classRecords.filter((item) => item.id !== record.id); })} /></div><p className="text-xs tg-muted">{formatDate(record.date)}</p><p className="mt-2 text-sm">{record.topic}</p></article>)}</div></section>
        </div>
      )}
    </div>
  );
}

function AssessmentView() {
  const { workspace, updateWorkspace } = useWorkspace();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(workspace.assessments[0]?.id ?? "");
  const selected = workspace.assessments.find((item) => item.id === selectedAssessmentId) ?? workspace.assessments[0] ?? null;
  const students = selected ? workspace.students.filter((student) => student.classId === selected.classId) : [];
  const scoreMap = useMemo(() => new Map(workspace.scores.filter((score) => score.assessmentId === selected?.id).map((score) => [score.studentId, score.score])), [selected?.id, workspace.scores]);
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraftScores(Object.fromEntries(students.map((student) => [student.id, String(scoreMap.get(student.id) ?? "")])));
  }, [selected?.id, students.length, workspace.scores.length]);

  function addAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const classId = String(form.get("classId") ?? "");
    const title = String(form.get("title") ?? "").trim();
    if (!classId || !title) return;
    const id = createId("assessment");
    const item: LocalAssessment = {
      id,
      classId,
      title,
      category: String(form.get("category") ?? "Tugas").trim(),
      date: String(form.get("date") ?? ""),
      maxScore: Math.max(1, Number(form.get("maxScore") ?? 100)),
      weight: Math.max(0, Math.min(100, Number(form.get("weight") ?? 0))),
      createdAt: new Date().toISOString(),
    };
    updateWorkspace((draft) => { draft.assessments.push(item); });
    setSelectedAssessmentId(id);
    event.currentTarget.reset();
  }

  function saveScores() {
    if (!selected) return;
    const now = new Date().toISOString();
    updateWorkspace((draft) => {
      for (const student of students) {
        const raw = draftScores[student.id];
        if (raw === "" || raw == null) {
          draft.scores = draft.scores.filter((score) => !(score.assessmentId === selected.id && score.studentId === student.id));
          continue;
        }
        const scoreValue = Math.max(0, Math.min(selected.maxScore, Number(raw)));
        const existing = draft.scores.find((score) => score.assessmentId === selected.id && score.studentId === student.id);
        if (existing) { existing.score = scoreValue; existing.updatedAt = now; }
        else draft.scores.push({ id: createId("score"), assessmentId: selected.id, studentId: student.id, score: scoreValue, updatedAt: now });
      }
    });
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Penilaian" description="Buat penilaian, masukkan nilai, dan lihat rekap sederhana tanpa mengirim data ke server." />
      {workspace.classes.length === 0 ? <EmptyState title="Belum ada kelas" text="Tambahkan kelas sebelum membuat penilaian." /> : (
        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <section className="tg-card p-5"><h3 className="font-black">Penilaian baru</h3><form onSubmit={addAssessment} className="mt-4 space-y-4">
            <Field label="Kelas"><select name="classId" required className={inputClass()}>{workspace.classes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Judul"><input name="title" required maxLength={150} className={inputClass()} placeholder="Kuis Bab 1" /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Kategori"><input name="category" maxLength={50} defaultValue="Tugas" className={inputClass()} /></Field><Field label="Tanggal"><input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass()} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Nilai maksimum"><input name="maxScore" type="number" min="1" max="10000" defaultValue="100" className={inputClass()} /></Field><Field label="Bobot (%)"><input name="weight" type="number" min="0" max="100" defaultValue="0" className={inputClass()} /></Field></div>
            <button className="tg-primary-button w-full"><Plus size={17} /> Buat penilaian</button>
          </form><div className="mt-6 space-y-2">{workspace.assessments.map((item) => <div key={item.id} className={`flex items-center rounded-xl border ${selected?.id === item.id ? "border-[var(--tg-primary)]" : "border-[var(--tg-border)]"}`}><button type="button" onClick={() => setSelectedAssessmentId(item.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><p className="truncate font-bold">{item.title}</p><p className="text-xs tg-muted">{workspace.classes.find((entry) => entry.id === item.classId)?.name ?? "Kelas dihapus"}</p></button><ConfirmDeleteButton label={`penilaian ${item.title}`} onDelete={() => updateWorkspace((draft) => { draft.assessments = draft.assessments.filter((entry) => entry.id !== item.id); draft.scores = draft.scores.filter((score) => score.assessmentId !== item.id); })} /></div>)}</div></section>
          <section className="tg-card p-5">{!selected ? <EmptyState title="Belum ada penilaian" text="Buat penilaian pertama untuk memasukkan nilai murid." /> : <><div className="flex flex-col gap-3 border-b border-[var(--tg-border)] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xl font-black">{selected.title}</h3><p className="text-sm tg-muted">Maks. {selected.maxScore} · Bobot {selected.weight}% · {formatDate(selected.date)}</p></div><button type="button" onClick={saveScores} className="tg-primary-button"><Save size={17} /> Simpan nilai</button></div>{students.length === 0 ? <div className="mt-5"><EmptyState title="Kelas belum memiliki murid" text="Tambahkan murid dari menu Kelas & Murid." /></div> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="border-b border-[var(--tg-border)]"><th className="px-3 py-3">Murid</th><th className="w-40 px-3 py-3">Nilai</th><th className="w-32 px-3 py-3">Persentase</th></tr></thead><tbody>{students.map((student) => { const value = Number(draftScores[student.id] || 0); return <tr key={student.id} className="border-b border-[var(--tg-border)]"><td className="px-3 py-3 font-semibold">{student.name}</td><td className="px-3 py-3"><input aria-label={`Nilai ${student.name}`} type="number" min="0" max={selected.maxScore} value={draftScores[student.id] ?? ""} onChange={(event) => setDraftScores((current) => ({ ...current, [student.id]: event.target.value }))} className="min-h-10 w-full rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></td><td className="px-3 py-3 tg-muted">{selected.maxScore ? `${Math.round((value / selected.maxScore) * 100)}%` : "—"}</td></tr>; })}</tbody></table></div>}</>}</section>
        </div>
      )}
    </div>
  );
}

function DocumentsView() {
  const { workspace, updateWorkspace } = useWorkspace();
  const [selectedId, setSelectedId] = useState(workspace.documents[0]?.id ?? "");
  const selected = workspace.documents.find((item) => item.id === selectedId) ?? null;

  function addDocument() {
    const now = new Date().toISOString();
    const id = createId("document");
    updateWorkspace((draft) => { draft.documents.unshift({ id, title: "Dokumen baru", type: "Catatan", content: "", status: "draft", createdAt: now, updatedAt: now }); });
    setSelectedId(id);
  }

  function updateSelected(patch: Partial<LocalDocument>) {
    if (!selected) return;
    updateWorkspace((draft) => {
      const item = draft.documents.find((document) => document.id === selected.id);
      if (item) Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    });
  }

  return (
    <div className="space-y-6"><SectionTitle title="Dokumen lokal" description="Tulis surat, notulen, catatan, atau portofolio. Konten tidak meninggalkan perangkat kecuali kamu mengaktifkan sinkron akun." action={<button type="button" onClick={addDocument} className="tg-primary-button"><Plus size={17} /> Dokumen baru</button>} />
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]"><section className="tg-card p-4"><div className="space-y-2">{workspace.documents.length === 0 ? <EmptyState title="Belum ada dokumen" text="Buat dokumen pertama untuk mulai menulis." /> : workspace.documents.map((document) => <div key={document.id} className={`flex items-center rounded-xl border ${selected?.id === document.id ? "border-[var(--tg-primary)]" : "border-[var(--tg-border)]"}`}><button type="button" onClick={() => setSelectedId(document.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><p className="truncate font-bold">{document.title}</p><p className="text-xs tg-muted">{document.type} · {document.status}</p></button><ConfirmDeleteButton label={`dokumen ${document.title}`} onDelete={() => { updateWorkspace((draft) => { draft.documents = draft.documents.filter((item) => item.id !== document.id); }); if (selectedId === document.id) setSelectedId(""); }} /></div>)}</div></section><section className="tg-card p-5">{!selected ? <EmptyState title="Pilih dokumen" text="Pilih dokumen dari daftar atau buat dokumen baru." /> : <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-[1fr_180px_140px]"><Field label="Judul"><input value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} maxLength={200} className={inputClass()} /></Field><Field label="Jenis"><input value={selected.type} onChange={(event) => updateSelected({ type: event.target.value })} maxLength={80} className={inputClass()} /></Field><Field label="Status"><select value={selected.status} onChange={(event) => updateSelected({ status: event.target.value as LocalDocument["status"] })} className={inputClass()}><option value="draft">Draf</option><option value="final">Final</option></select></Field></div><Field label="Isi dokumen"><textarea value={selected.content} onChange={(event) => updateSelected({ content: event.target.value })} rows={18} maxLength={100_000} className={`${inputClass()} font-mono text-sm leading-6`} placeholder="Mulai menulis..." /></Field><p className="text-xs tg-muted">Tersimpan otomatis · Diperbarui {formatDateTime(selected.updatedAt)}</p></div>}</section></div>
    </div>
  );
}

function EventsView() {
  const { workspace, updateWorkspace } = useWorkspace();
  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) return;
    const item: LocalEvent = { id: createId("event"), title, category: String(form.get("category") ?? "event") as LocalEvent["category"], date: String(form.get("date") ?? ""), status: "planned", notes: String(form.get("notes") ?? "").trim(), createdAt: new Date().toISOString() };
    updateWorkspace((draft) => { draft.events.push(item); });
    event.currentTarget.reset();
  }
  const ordered = [...workspace.events].sort((a, b) => a.date.localeCompare(b.date));
  return <div className="space-y-6"><SectionTitle title="Agenda, rapat, dan tugas" description="Satu daftar sederhana untuk agenda kerja. Semua dapat dipakai tanpa akun." /><div className="grid gap-5 xl:grid-cols-[360px_1fr]"><form onSubmit={addEvent} className="tg-card h-fit p-5"><h3 className="font-black">Tambah agenda</h3><div className="mt-4 space-y-4"><Field label="Judul"><input name="title" required maxLength={180} className={inputClass()} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Jenis"><select name="category" className={inputClass()}><option value="event">Acara</option><option value="meeting">Rapat</option><option value="task">Tugas</option></select></Field><Field label="Tanggal"><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass()} /></Field></div><Field label="Catatan"><textarea name="notes" rows={4} maxLength={2000} className={inputClass()} /></Field><button className="tg-primary-button w-full"><Plus size={17} /> Tambah agenda</button></div></form><section className="tg-card p-5"><div className="space-y-3">{ordered.length === 0 ? <EmptyState title="Agenda kosong" text="Tambahkan acara, rapat, atau tugas pertama." /> : ordered.map((item) => <article key={item.id} className="rounded-2xl border border-[var(--tg-border)] p-4"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><CalendarDays size={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{item.title}</h3><span className="rounded-full bg-[var(--tg-surface-muted)] px-2 py-1 text-xs font-bold">{item.category}</span></div><p className="mt-1 text-sm tg-muted">{formatDate(item.date)}</p><p className="mt-2 text-sm">{item.notes || "Tanpa catatan"}</p><select value={item.status} onChange={(event) => updateWorkspace((draft) => { const entry = draft.events.find((eventItem) => eventItem.id === item.id); if (entry) entry.status = event.target.value as LocalEvent["status"]; })} className="mt-3 min-h-9 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] px-2 text-sm"><option value="planned">Direncanakan</option><option value="ongoing">Berjalan</option><option value="completed">Selesai</option></select></div><ConfirmDeleteButton label={`agenda ${item.title}`} onDelete={() => updateWorkspace((draft) => { draft.events = draft.events.filter((entry) => entry.id !== item.id); })} /></div></article>)}</div></section></div></div>;
}

function InventoryView() {
  const { workspace, updateWorkspace } = useWorkspace();
  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    const item: LocalInventoryItem = { id: createId("inventory"), name, code: String(form.get("code") ?? "").trim(), quantity: Math.max(0, Number(form.get("quantity") ?? 0)), condition: String(form.get("condition") ?? "good") as LocalInventoryItem["condition"], notes: String(form.get("notes") ?? "").trim(), updatedAt: new Date().toISOString() };
    updateWorkspace((draft) => { draft.inventory.push(item); });
    event.currentTarget.reset();
  }
  return <div className="space-y-6"><SectionTitle title="Inventaris sederhana" description="Catat jumlah dan kondisi barang. Mode lokal cocok untuk inventaris pribadi atau kelas kecil." /><div className="grid gap-5 xl:grid-cols-[360px_1fr]"><form onSubmit={addItem} className="tg-card h-fit p-5"><h3 className="font-black">Tambah barang</h3><div className="mt-4 space-y-4"><Field label="Nama barang"><input name="name" required maxLength={150} className={inputClass()} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Kode opsional"><input name="code" maxLength={60} className={inputClass()} /></Field><Field label="Jumlah"><input name="quantity" type="number" min="0" max="1000000" defaultValue="1" className={inputClass()} /></Field></div><Field label="Kondisi"><select name="condition" className={inputClass()}><option value="good">Baik</option><option value="needs_attention">Perlu diperiksa</option><option value="damaged">Rusak</option></select></Field><Field label="Catatan"><textarea name="notes" rows={3} maxLength={1500} className={inputClass()} /></Field><button className="tg-primary-button w-full"><Plus size={17} /> Tambah barang</button></div></form><section className="tg-card p-5">{workspace.inventory.length === 0 ? <EmptyState title="Inventaris kosong" text="Tambahkan barang pertama untuk mulai mencatat." /> : <div className="grid gap-3 sm:grid-cols-2">{workspace.inventory.map((item) => <article key={item.id} className="rounded-2xl border border-[var(--tg-border)] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{item.name}</h3><p className="text-xs tg-muted">{item.code || "Tanpa kode"}</p></div><ConfirmDeleteButton label={`barang ${item.name}`} onDelete={() => updateWorkspace((draft) => { draft.inventory = draft.inventory.filter((entry) => entry.id !== item.id); })} /></div><div className="mt-4 flex items-center gap-2"><button type="button" onClick={() => updateWorkspace((draft) => { const entry = draft.inventory.find((value) => value.id === item.id); if (entry) { entry.quantity = Math.max(0, entry.quantity - 1); entry.updatedAt = new Date().toISOString(); } })} className="grid size-9 place-items-center rounded-lg border border-[var(--tg-border)] font-bold">−</button><span className="min-w-12 text-center text-xl font-black">{item.quantity}</span><button type="button" onClick={() => updateWorkspace((draft) => { const entry = draft.inventory.find((value) => value.id === item.id); if (entry) { entry.quantity += 1; entry.updatedAt = new Date().toISOString(); } })} className="grid size-9 place-items-center rounded-lg border border-[var(--tg-border)] font-bold">+</button></div><select value={item.condition} onChange={(event) => updateWorkspace((draft) => { const entry = draft.inventory.find((value) => value.id === item.id); if (entry) { entry.condition = event.target.value as LocalInventoryItem["condition"]; entry.updatedAt = new Date().toISOString(); } })} className="mt-4 min-h-9 w-full rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] px-2 text-sm"><option value="good">Baik</option><option value="needs_attention">Perlu diperiksa</option><option value="damaged">Rusak</option></select><p className="mt-3 text-sm tg-muted">{item.notes || "Tanpa catatan"}</p></article>)}</div>}</section></div></div>;
}

function BackupView() {
  const { workspace, replaceWorkspace, resetWorkspace, updateWorkspace } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");

  async function importBackup(file: File | undefined) {
    if (!file) return;
    try {
      const next = await parseWorkspaceBackup(file);
      if (!window.confirm(`Pulihkan backup "${next.name}"? Data lokal saat ini akan diganti.`)) return;
      replaceWorkspace(next);
      setStatus("Backup berhasil dipulihkan.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Backup gagal dibaca.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return <div className="space-y-6"><SectionTitle title="Backup dan sinkronisasi" description="Tanpa login, backup dilakukan manual ke file JSON. Dengan akun, salinan terbaru disimpan ke cloud dan dapat dipulihkan di perangkat lain." />
    <div className="grid gap-5 lg:grid-cols-2"><section className="tg-card p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Download size={20} /></span><div><h3 className="font-black">Backup manual</h3><p className="text-sm tg-muted">Cocok untuk mode tanpa login.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => downloadWorkspaceBackup(workspace)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--tg-border)] font-bold"><Download size={17} /> Unduh backup</button><button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--tg-border)] font-bold"><Upload size={17} /> Pulihkan backup</button><input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => void importBackup(event.target.files?.[0])} /></div><p className="mt-4 text-xs leading-5 tg-muted">Simpan file backup di Drive, flashdisk, atau tempat aman. File berisi data yang kamu masukkan dan tidak diberi kata sandi.</p></section>
    <section className="tg-card p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Cloud size={20} /></span><div><h3 className="font-black">Sinkron antarperangkat</h3><p className="text-sm tg-muted">Login memakai email dan kata sandi.</p></div></div><p className="mt-5 text-sm leading-6 tg-muted">Setelah login, Teman Guru membandingkan waktu perubahan terakhir. Perangkat baru yang masih kosong akan mengambil backup cloud; perangkat dengan perubahan terbaru akan mengunggahnya.</p>{hasSupabaseEnv ? <Link href="/login?next=/workspace" className="tg-primary-button mt-4"><LogIn size={17} /> Masuk atau buat akun</Link> : <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Supabase belum dikonfigurasi. Mode lokal tetap dapat dipakai.</p>}</section></div>
    <section className="tg-card p-5"><h3 className="font-black">Identitas ruang kerja</h3><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="Nama ruang kerja"><input value={workspace.name} onChange={(event) => updateWorkspace((draft) => { draft.name = event.target.value; })} maxLength={120} className={inputClass()} /></Field><Field label="Nama guru"><input value={workspace.profile.teacherName} onChange={(event) => updateWorkspace((draft) => { draft.profile.teacherName = event.target.value; })} maxLength={150} className={inputClass()} /></Field><Field label="Nama sekolah"><input value={workspace.profile.schoolName} onChange={(event) => updateWorkspace((draft) => { draft.profile.schoolName = event.target.value; })} maxLength={180} className={inputClass()} /></Field><Field label="Tahun ajaran"><input value={workspace.profile.academicYear} onChange={(event) => updateWorkspace((draft) => { draft.profile.academicYear = event.target.value; })} maxLength={40} className={inputClass()} /></Field></div></section>
    <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-950"><h3 className="font-black">Zona berisiko</h3><p className="mt-2 text-sm">Unduh backup sebelum menghapus data perangkat.</p><button type="button" onClick={() => { if (window.confirm("Hapus seluruh data ruang kerja lokal?")) { resetWorkspace(); setStatus("Data lokal telah dikosongkan."); } }} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-700 px-4 font-bold text-white"><Trash2 size={17} /> Hapus semua data lokal</button></section>
    {status ? <p role="status" className="rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3 text-sm">{status}</p> : null}
  </div>;
}

export function WorkspaceApp() {
  const { workspace, ready, saving, replaceWorkspace } = useWorkspace();
  const [view, setView] = useState<WorkspaceView>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as WorkspaceView;
    if (navigation.some((item) => item.id === hash)) setView(hash);
  }, []);

  function changeView(next: WorkspaceView) {
    setView(next);
    setMobileOpen(false);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) {
    return <main className="grid min-h-dvh place-items-center"><div className="text-center"><Loader2 className="mx-auto animate-spin text-[var(--tg-primary)]" size={30} /><p className="mt-3 text-sm tg-muted">Membuka data perangkat...</p></div></main>;
  }

  const content = {
    dashboard: <DashboardView setView={changeView} />,
    classes: <ClassesView />,
    record: <RecordView />,
    assessment: <AssessmentView />,
    documents: <DocumentsView />,
    events: <EventsView />,
    inventory: <InventoryView />,
    backup: <BackupView />,
  }[view];

  return (
    <div className="tg-app-shell min-h-dvh lg:flex">
      <aside className={`tg-surface fixed inset-y-0 left-0 z-50 w-72 border-r p-4 transition-transform lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between"><Logo /><button type="button" className="grid size-10 place-items-center rounded-xl lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={20} /></button></div>
        <div className="mt-6 rounded-2xl border border-[var(--tg-border)] bg-[var(--tg-surface-muted)] p-4"><p className="text-xs font-bold uppercase tracking-wider tg-muted">Mode perangkat</p><p className="mt-1 truncate font-black" title={workspace.name}>{workspace.name}</p><p className="mt-1 text-xs tg-muted">Data lokal · login opsional</p></div>
        <nav className="mt-5 space-y-1" aria-label="Navigasi ruang kerja">{navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeView(id)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold ${view === id ? "bg-[var(--tg-primary)] text-white" : "hover:bg-[var(--tg-surface-muted)]"}`}><Icon size={19} />{label}</button>)}</nav>
        <div className="absolute bottom-4 left-4 right-4"><Link href="/" className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--tg-border)] text-sm font-bold">Kembali ke beranda</Link></div>
      </aside>
      {mobileOpen ? <button aria-label="Tutup menu" className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <div className="min-w-0 flex-1">
        <header className="tg-surface sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b px-4 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--tg-border)] lg:hidden" aria-label="Buka menu"><Menu size={20} /></button><div className="min-w-0"><p className="truncate text-sm font-black">{navigation.find((item) => item.id === view)?.label}</p><p className="text-xs tg-muted">{saving ? "Menyimpan di perangkat..." : "Tersimpan otomatis"}</p></div></div><AccountSync onOpenBackup={() => changeView("backup")} /></header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{content}</main>
      </div>
      <div className="fixed bottom-4 right-4 z-30 hidden sm:block"><button type="button" onClick={() => { if (window.confirm("Ganti data saat ini dengan contoh?")) replaceWorkspace(createSampleWorkspace()); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] px-4 text-xs font-bold shadow-lg backdrop-blur"><RefreshCw size={15} /> Muat data contoh</button></div>
    </div>
  );
}
