"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, FileText, Calendar } from "lucide-react";
import { createAssessment, getAssessments } from "./actions";

type AssignmentOption = {
  id: string;
  class_id: string;
  label: string;
};

type Assessment = {
  id: string;
  title: string;
  category: string;
  assessment_date: string;
  max_score: number;
  weight: number;
};

export default function AssessmentClient({ assignments }: { assignments: AssignmentOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [assignmentId, setAssignmentId] = useState(assignments.length > 0 ? assignments[0].id : "");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("tugas");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [maxScore, setMaxScore] = useState("100");
  const [weight, setWeight] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadAssessments = async (aid: string) => {
    if (!aid) return;
    setLoadingAssessments(true);
    const data = await getAssessments(aid);
    setAssessments(data as Assessment[]);
    setLoadingAssessments(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssessments(assignmentId);
  }, [assignmentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const fd = new FormData();
    fd.append("assignment_id", assignmentId);
    fd.append("title", title);
    fd.append("category", category);
    fd.append("date", date);
    fd.append("max_score", maxScore);
    fd.append("weight", weight);

    startTransition(async () => {
      const result = await createAssessment(null, fd);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg(result.message || "Berhasil ditambahkan!");
        setIsFormOpen(false);
        setTitle("");
        loadAssessments(assignmentId);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Class Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="assignment" className="mb-2 block text-sm font-semibold text-slate-900">
          Kelas & Mata Pelajaran
        </label>
        <select
          id="assignment"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          className="w-full sm:w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
        >
          <option value="" disabled>Pilih Kelas...</option>
          {assignments.map(a => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </div>

      {assignmentId && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Daftar Penilaian</h2>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <Plus size={16} />
              Tambah Penilaian
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              {successMsg}
            </div>
          )}

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-900">Judul Penilaian</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Ulangan Harian 1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-900">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="tugas">Tugas</option>
                    <option value="kuis">Kuis / Ulangan Harian</option>
                    <option value="uts">UTS / PTS</option>
                    <option value="uas">UAS / PAS</option>
                    <option value="proyek">Proyek</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-900">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Skor Maks</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={maxScore}
                      onChange={e => setMaxScore(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Bobot</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  Simpan Penilaian
                </button>
              </div>
            </form>
          )}

          {loadingAssessments ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-slate-500">
              <FileText size={32} className="mb-3 text-slate-400" />
              <p className="text-sm font-medium">Belum ada penilaian untuk kelas ini</p>
              <p className="mt-1 text-xs text-slate-400">Klik &quot;Tambah Penilaian&quot; untuk memulai</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {assessments.map(a => (
                <button
                  key={a.id}
                  onClick={() => router.push(`/assessment/${a.id}`)}
                  className="group flex flex-col justify-start rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between w-full">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-slate-600">
                      {a.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={12} />
                      {a.assessment_date}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {a.title}
                  </h3>
                  <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500">
                    <div>
                      Bobot: <span className="text-slate-900">{a.weight}</span>
                    </div>
                    <div>
                      Maks: <span className="text-slate-900">{a.max_score}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
