"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, RotateCcw, X, History } from "lucide-react";
import { saveAssessmentScores, addRemedialAttempt } from "../actions";
import { useRouter } from "next/navigation";

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

type RemedialAttempt = {
  id: string;
  student_id: string;
  attempt_number: number;
  score: number;
  attempted_on: string;
  note: string;
};

export default function ScoreClient({
  assessmentId,
  students,
  existingScores,
  remedialAttempts
}: {
  assessmentId: string;
  students: Student[];
  existingScores: ScoreRecord[];
  remedialAttempts: RemedialAttempt[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Remedial Modal State
  const [remedialStudent, setRemedialStudent] = useState<Student | null>(null);
  const [remedialDate, setRemedialDate] = useState(new Date().toISOString().split("T")[0]);
  const [remedialScore, setRemedialScore] = useState("");
  const [remedialFinal, setRemedialFinal] = useState("");
  const [remedialNote, setRemedialNote] = useState("");
  const [isRemedialPending, startRemedialTransition] = useTransition();

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
      const existing = existingScores.find(es => es.student_id === s.id);
      return {
        student_id: s.id,
        // Only set original if not already set by previous saves (preserve history)
        original_score: existing?.original_score != null 
          ? existing.original_score 
          : (finalVal ? parseFloat(finalVal) : null),
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
        router.refresh();
      }
    });
  };

  const handleRemedialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remedialStudent) return;
    
    startRemedialTransition(async () => {
      const result = await addRemedialAttempt(
        assessmentId,
        remedialStudent.id,
        parseFloat(remedialScore),
        parseFloat(remedialFinal),
        remedialDate,
        remedialNote
      );

      if (result.error) {
        alert(result.error);
      } else {
        setRemedialStudent(null);
        setRemedialScore("");
        setRemedialFinal("");
        setRemedialNote("");
        setSuccessMsg("Remedial berhasil dicatat!");
        
        // Update local score state to reflect new final score
        setScores(prev => ({
          ...prev,
          [remedialStudent.id]: { 
            ...prev[remedialStudent.id], 
            final: remedialFinal 
          }
        }));
        
        router.refresh();
      }
    });
  };

  const openRemedialModal = (student: Student) => {
    setRemedialStudent(student);
    setRemedialScore("");
    setRemedialFinal("");
    setRemedialNote("");
  };

  return (
    <>
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
                <th className="px-4 py-3 font-semibold w-32">Nilai Akhir</th>
                <th className="px-4 py-3 font-semibold w-48">Catatan</th>
                <th className="rounded-tr-lg px-4 py-3 font-semibold w-32 text-center">Remedial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Belum ada murid di kelas ini.
                  </td>
                </tr>
              ) : (
                students.map(s => {
                  const existing = existingScores.find(es => es.student_id === s.id);
                  const hasOriginal = existing && existing.original_score != null;
                  const attempts = remedialAttempts.filter(r => r.student_id === s.id);
                  
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.local_code}</div>
                        {hasOriginal && existing.original_score !== existing.final_score && (
                          <div className="mt-1 text-[10px] text-slate-400">
                            Asli: {existing.original_score}
                          </div>
                        )}
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
                          placeholder="Catatan opsional..."
                          value={scores[s.id].note}
                          onChange={e => handleNoteChange(s.id, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasOriginal ? (
                          <button
                            type="button"
                            onClick={() => openRemedialModal(s)}
                            className="inline-flex items-center justify-center rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100 transition relative"
                            title="Riwayat Remedial"
                          >
                            <RotateCcw size={16} />
                            {attempts.length > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                                {attempts.length}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Simpan nilai dulu</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </form>

      {/* Remedial Modal */}
      {remedialStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-bold text-slate-900">Riwayat Remedial</h3>
              <button 
                onClick={() => setRemedialStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="font-semibold text-slate-900">{remedialStudent.name}</div>
                <div className="text-sm text-slate-500 mb-3">{remedialStudent.local_code || "Tanpa NIS"}</div>
                
                {(() => {
                  const existing = existingScores.find(es => es.student_id === remedialStudent.id);
                  return (
                    <div className="flex gap-4 text-sm font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs">Nilai Asli</span>
                        <span className="text-slate-900">{existing?.original_score ?? '-'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-indigo-500 text-xs">Nilai Akhir Saat Ini</span>
                        <span className="text-indigo-700">{existing?.final_score ?? '-'}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* History List */}
              {(() => {
                const attempts = remedialAttempts.filter(r => r.student_id === remedialStudent.id);
                if (attempts.length > 0) {
                  return (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <History size={16} className="text-slate-400" />
                        Percobaan Sebelumnya
                      </h4>
                      <div className="space-y-3">
                        {attempts.map(att => (
                          <div key={att.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm flex justify-between items-center shadow-sm">
                            <div>
                              <div className="font-semibold text-slate-700">Percobaan ke-{att.attempt_number}</div>
                              <div className="text-xs text-slate-500 mt-1">{att.attempted_on} {att.note && `• ${att.note}`}</div>
                            </div>
                            <div className="text-lg font-bold text-slate-900">{att.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Add New Attempt Form */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Catat Percobaan Baru</h4>
                <form onSubmit={handleRemedialSubmit} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Tanggal Remedial</label>
                    <input
                      type="date"
                      required
                      value={remedialDate}
                      onChange={e => setRemedialDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Skor Remedial</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={remedialScore}
                        onChange={e => setRemedialScore(e.target.value)}
                        placeholder="0-100"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-indigo-700">Set Nilai Akhir Baru</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={remedialFinal}
                        onChange={e => setRemedialFinal(e.target.value)}
                        placeholder="Misal KKM"
                        className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none bg-indigo-50/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Catatan Tambahan (Opsional)</label>
                    <input
                      type="text"
                      value={remedialNote}
                      onChange={e => setRemedialNote(e.target.value)}
                      placeholder="Contoh: Tes lisan"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRemedialPending}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {isRemedialPending && <Loader2 size={16} className="animate-spin" />}
                    Simpan Remedial
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
