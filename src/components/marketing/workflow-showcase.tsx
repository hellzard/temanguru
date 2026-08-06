"use client";

import { useState } from "react";
import {
  BookOpenText,
  CalendarCheck2,
  ChartNoAxesColumnIncreasing,
  Check,
  ClipboardCheck,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Workflow = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  items: Array<{ label: string; value: string; done?: boolean }>;
};

const workflows: Workflow[] = [
  {
    id: "pagi",
    label: "Pagi",
    eyebrow: "Sebelum bel pertama",
    title: "Tahu apa yang perlu disiapkan hari ini.",
    description:
      "Jadwal, kelas berikutnya, dan pekerjaan yang belum selesai muncul dalam satu ringkasan.",
    icon: CalendarCheck2,
    accent: "from-indigo-500 to-violet-500",
    items: [
      { label: "07.00 · Matematika", value: "VIII B · Ruang 12", done: true },
      { label: "09.15 · IPA", value: "VII A · Laboratorium" },
      { label: "Jurnal kemarin", value: "1 catatan belum diselesaikan" },
    ],
  },
  {
    id: "kelas",
    label: "Saat mengajar",
    eyebrow: "Di dalam kelas",
    title: "Presensi dan jurnal berjalan dalam satu alur.",
    description:
      "Tidak perlu berpindah-pindah halaman hanya untuk mencatat hal yang terjadi pada sesi yang sama.",
    icon: ClipboardCheck,
    accent: "from-emerald-500 to-teal-500",
    items: [
      { label: "Presensi", value: "29 hadir · 2 izin", done: true },
      { label: "Topik", value: "Persamaan linear satu variabel", done: true },
      { label: "Catatan kelas", value: "Tambahkan refleksi singkat" },
    ],
  },
  {
    id: "setelah",
    label: "Setelah kelas",
    eyebrow: "Sesudah mengajar",
    title: "Pekerjaan lanjutan tidak tercecer.",
    description:
      "Nilai kosong, jurnal draf, dan dokumen yang perlu dilengkapi terlihat sebagai tindakan berikutnya.",
    icon: ChartNoAxesColumnIncreasing,
    accent: "from-amber-500 to-orange-500",
    items: [
      { label: "Penilaian formatif", value: "6 nilai belum diisi" },
      { label: "Jurnal VIII B", value: "Siap difinalkan", done: true },
      { label: "Rekap minggu ini", value: "Periksa sebelum Jumat" },
    ],
  },
  {
    id: "admin",
    label: "Administrasi",
    eyebrow: "Saat dibutuhkan",
    title: "Dokumen dan catatan sekolah tetap mudah ditemukan.",
    description:
      "Agenda, dokumen, inventaris, dan kebutuhan operasional berada di ruang kerja yang sama.",
    icon: FileText,
    accent: "from-sky-500 to-indigo-500",
    items: [
      { label: "Surat tugas", value: "Draf tersimpan", done: true },
      { label: "Agenda sekolah", value: "Rapat guru · Kamis" },
      { label: "Inventaris kelas", value: "2 item perlu diperiksa" },
    ],
  },
];

export function WorkflowShowcase() {
  const [activeId, setActiveId] = useState(workflows[0].id);
  const active = workflows.find((item) => item.id === activeId) ?? workflows[0];
  const ActiveIcon = active.icon;

  return (
    <div className="grid gap-6 lg:grid-cols-[.78fr_1.22fr] lg:items-stretch">
      <div
        role="tablist"
        aria-label="Alur kerja guru"
        className="grid grid-cols-2 gap-2 rounded-[24px] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] p-2 shadow-[var(--tg-shadow-sm)] backdrop-blur lg:grid-cols-1 lg:content-start"
      >
        {workflows.map((item) => {
          const Icon = item.icon;
          const selected = item.id === active.id;

          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "group flex min-h-14 items-center gap-3 rounded-[18px] px-3.5 py-3 text-left text-sm font-bold transition",
                selected
                  ? "bg-[var(--tg-text)] text-[var(--tg-surface)] shadow-[var(--tg-shadow-md)]"
                  : "text-[var(--tg-text-muted)] hover:bg-[var(--tg-primary-soft)] hover:text-[var(--tg-primary)]",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl transition",
                  selected
                    ? "bg-white/12 text-white"
                    : "bg-[var(--tg-surface-muted)] text-[var(--tg-primary)]",
                )}
              >
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${active.id}`}
        className="relative min-h-[410px] overflow-hidden rounded-[32px] border border-white/15 bg-[#11162a] p-5 text-white shadow-[0_30px_80px_-36px_rgba(15,23,42,.8)] sm:p-7"
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute -right-20 -top-24 size-72 rounded-full bg-gradient-to-br opacity-30 blur-3xl",
            active.accent,
          )}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 size-64 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-200">
                {active.eyebrow}
              </p>
              <h3 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                {active.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                {active.description}
              </p>
            </div>
            <span className="hidden size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-indigo-200 sm:grid">
              <ActiveIcon size={23} aria-hidden="true" />
            </span>
          </div>

          <div className="mt-7 space-y-3">
            {active.items.map((item, index) => (
              <article
                key={item.label}
                className="group flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/[.07] p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.1]"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-[14px]",
                    item.done
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "bg-indigo-400/15 text-indigo-200",
                  )}
                >
                  {item.done ? (
                    <Check size={19} aria-hidden="true" />
                  ) : (
                    <BookOpenText size={19} aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.label}</p>
                  <p className="mt-1 truncate text-sm text-slate-400">{item.value}</p>
                </div>
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300 sm:inline-flex">
                  {item.done ? "Siap" : "Perlu tindakan"}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
