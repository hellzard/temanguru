"use client";

import { useTransition, useState } from "react";
import { Plus, BriefcaseBusiness, GraduationCap, FolderOpen, ExternalLink } from "lucide-react";
import { createStudentPortfolio, createTeacherPortfolio } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const initialStudentState = { success: false, message: "" };
const initialTeacherState = { success: false, message: "" };

type PortfolioItem = Record<string, unknown> & {
  id?: string;
  category?: string;
  title?: string;
  url?: string;
  date_obtained?: string;
  students?: { display_name?: string };
};

type StudentItem = Record<string, unknown> & {
  id?: string;
  display_name?: string;
  local_code?: string;
};

export function PortfoliosClient({ 
  studentPortfolios, 
  teacherPortfolios, 
  students 
}: { 
  studentPortfolios: PortfolioItem[], 
  teacherPortfolios: PortfolioItem[], 
  students: StudentItem[] 
}) {
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  
  const [pendingStudent, startTransitionStudent] = useTransition();
  const [pendingTeacher, startTransitionTeacher] = useTransition();
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionStudent(async () => {
      try {
        await createStudentPortfolio(formData);
      } catch (e: any) {
        if (e?.message?.includes("NEXT_REDIRECT")) throw e;
        toast.error("Terjadi kesalahan.");
      }
    });
  };

  const handleTeacherSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionTeacher(async () => {
      try {
        await createTeacherPortfolio(formData);
      } catch (e: any) {
        if (e?.message?.includes("NEXT_REDIRECT")) throw e;
        toast.error("Terjadi kesalahan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em] text-slate-950">Portofolio & Karya</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kumpulan bukti karya murid dan sertifikat pengembangan keprofesian guru.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Tambah Portofolio
          </Button>
        )}
      </div>

      <div className="flex rounded-xl bg-slate-100 p-1 w-full max-w-sm">
        <button
          onClick={() => { setActiveTab("student"); setIsFormOpen(false); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            activeTab === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Karya Murid
        </button>
        <button
          onClick={() => { setActiveTab("teacher"); setIsFormOpen(false); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            activeTab === "teacher" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sertifikat Guru
        </button>
      </div>

      {isFormOpen && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em] text-slate-950 mb-4">
            {activeTab === "student" ? "Tambah Karya Murid" : "Tambah Portofolio Guru"}
          </h3>
          
          {activeTab === "student" ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="student_id" className="block text-sm font-semibold text-slate-800">
                    Siswa
                  </label>
                  <select
                    id="student_id"
                    name="student_id"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.display_name} ({s.local_code || 'No NISN'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-800">
                    Kategori Karya
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
                  >
                    <option value="assignment">Tugas Harian</option>
                    <option value="project">Proyek Bersama</option>
                    <option value="art">Karya Seni</option>
                    <option value="certificate">Sertifikat / Piagam</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
                    Judul Karya
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Contoh: Makalah Sejarah Kemerdekaan"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="url" className="block text-sm font-semibold text-slate-800">
                    Tautan Bukti (URL Google Drive / YouTube) (Opsional)
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Batal</Button>
                <Button type="submit" disabled={pendingStudent}>
                  {pendingStudent ? "Menyimpan..." : "Simpan Karya"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-800">
                    Kategori Dokumen
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
                  >
                    <option value="certificate">Sertifikat Pelatihan (PKB)</option>
                    <option value="teaching_material">Modul / Bahan Ajar</option>
                    <option value="research">Penelitian Tindakan Kelas (PTK)</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date_obtained" className="block text-sm font-semibold text-slate-800">
                    Tanggal Diperoleh
                  </label>
                  <input
                    type="date"
                    id="date_obtained"
                    name="date_obtained"
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
                    Judul Sertifikat / Karya
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Contoh: Sertifikat Webinar Kurikulum Merdeka"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="url" className="block text-sm font-semibold text-slate-800">
                    Tautan Bukti (URL Google Drive) (Opsional)
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Batal</Button>
                <Button type="submit" disabled={pendingTeacher}>
                  {pendingTeacher ? "Menyimpan..." : "Simpan Portofolio"}
                </Button>
              </div>
            </form>
          )}
        </section>
      )}

      {activeTab === "student" ? (
        studentPortfolios.length === 0 && !isFormOpen ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-indigo-50 text-indigo-500">
              <GraduationCap size={24} />
            </div>
            <h3 className="mt-4 font-[family-name:var(--font-display)] font-bold tracking-[-0.03em] text-slate-950">Belum ada karya murid</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Kumpulkan bukti fisik maupun digital hasil belajar murid untuk persiapan presentasi konseling/rapor.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studentPortfolios.map((port) => (
              <div key={port.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{port.category}</span>
                  <h4 className="mt-1 font-bold text-slate-900 line-clamp-2">{port.title}</h4>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {port.students?.display_name?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">{port.students?.display_name}</span>
                  </div>
                </div>
                {port.url && (
                  <div className="mt-5 border-t border-slate-100 pt-3">
                    <a href={port.url} target="_blank" rel="noreferrer" className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                      <ExternalLink size={16} className="mr-1" /> Lihat Karya
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        teacherPortfolios.length === 0 && !isFormOpen ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-500">
              <BriefcaseBusiness size={24} />
            </div>
            <h3 className="mt-4 font-[family-name:var(--font-display)] font-bold tracking-[-0.03em] text-slate-950">Belum ada portofolio guru</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Simpan bukti Pengembangan Keprofesian Berkelanjutan (PKB) Anda di sini agar mudah ditemukan.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teacherPortfolios.map((port) => (
              <div key={port.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">{port.category ? port.category.replace("_", " ") : "Tidak Terkategori"}</span>
                  <h4 className="mt-1 font-bold text-slate-900 line-clamp-2">{port.title}</h4>
                  {port.date_obtained && (
                    <p className="mt-2 text-xs text-slate-500">
                      Diperoleh pada {new Date(port.date_obtained).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>
                {port.url && (
                  <div className="mt-5 border-t border-slate-100 pt-3">
                    <a href={port.url} target="_blank" rel="noreferrer" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-800">
                      <FolderOpen size={16} className="mr-1" /> Buka Dokumen
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
