"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { saveAssessmentScores } from "../actions";

type Student = {
  id: string;
  name: string;
  local_code: string;
};

type ScoreRecord = {
  student_id: string;
  original_score?: number | null;
  final_score?: number | null;
  note?: string | null;
};

export default function ScoreClient({
  assessmentId,
  students,
  existingScores
}: {
  assessmentId: string;
  students: Student[];
  existingScores: ScoreRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Initialize state from existing scores
  const [scores, setScores] = useState<Record<string, { final: string, note: string }>>(() => {
    const map: Record<string, { final: string, note: string }> = {};
    students.forEach(s => {
      const existing = existingScores.find(es => es.student_id === s.id);
      map[s.id] = {
        final: existing?.final_score != null ? String(existing.final_score) : "",
        note: existing?.note || ""
      };
    });
    return map;
  });

  const handleScoreChange = (studentId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], final: value }
    }));
  };

  const handleNoteChange = (studentId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const payload = students.map(s => {
      const entry = scores[s.id];
      const finalVal = entry.final.trim();
      return {
        student_id: s.id,
        original_score: finalVal ? parseFloat(finalVal) : null, // we use final as original for simplicity in this slice
        final_score: finalVal ? parseFloat(finalVal) : null,
        note: entry.note.trim() || ""
      };
    });

    startTransition(async () => {
      const result = await saveAssessmentScores(assessmentId, payload);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg(result.message || "Berhasil disimpan!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Input Nilai</h2>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan Nilai
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="rounded-tl-lg px-4 py-3 font-semibold">Nama Siswa</th>
              <th className="px-4 py-3 font-semibold w-32">Nilai</th>
              <th className="rounded-tr-lg px-4 py-3 font-semibold">Catatan (Opsional)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-500">
                  Belum ada murid di kelas ini.
                </td>
              </tr>
            ) : (
              students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.local_code}</div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="-"
                      value={scores[s.id].final}
                      onChange={e => handleScoreChange(s.id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Catatan perbaikan / remedial..."
                      value={scores[s.id].note}
                      onChange={e => handleNoteChange(s.id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </form>
  );
}
