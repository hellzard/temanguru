import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { CalendarRange, BookMarked } from "lucide-react";

export const metadata = { title: "Pengaturan" };

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Pengaturan" description="Kelola konfigurasi sekolah dan preferensi Anda." />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/settings/academic-years"
          className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <CalendarRange size={24} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Tahun Ajaran</h2>
            <p className="mt-1 text-sm text-slate-600">
              Atur tahun ajaran aktif dan kelola periode pembelajaran.
            </p>
          </div>
        </Link>
        <Link
          href="/settings/subjects"
          className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <BookMarked size={24} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Mata Pelajaran</h2>
            <p className="mt-1 text-sm text-slate-600">
              Kelola daftar mata pelajaran yang diajarkan di sekolah.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
