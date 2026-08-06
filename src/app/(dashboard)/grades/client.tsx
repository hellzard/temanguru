"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, FileSpreadsheet, Download } from "lucide-react";
import { getGradebookData } from "./actions";

type AssignmentOption = {
  id: string;
  class_id: string;
  label: string;
};

type Student = {
  id: string;
  name: string;
  local_code: string;
};

type Assessment = {
  id: string;
  title: string;
  category: string;
  max_score: number;
  weight: number;
};

type ScoreRecord = {
  assessment_id: string;
  student_id: string;
  final_score: number | null;
};

export default function GradebookClient({ assignments }: { assignments: AssignmentOption[] }) {
  const [assignmentId, setAssignmentId] = useState(assignments.length > 0 ? assignments[0].id : "");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Mastery Map Thresholds
  const [kkm, setKkm] = useState(75);
  const [mahirThreshold, setMahirThreshold] = useState(85);

  const selectedAssignment = assignments.find(a => a.id === assignmentId);

  useEffect(() => {
    async function loadData() {
      if (!assignmentId || !selectedAssignment) return;
      
      setLoading(true);
      setErrorMsg("");
      const result = await getGradebookData(assignmentId, selectedAssignment.class_id);
      
      if (result.error) {
        setErrorMsg(result.error);
        setStudents([]);
        setAssessments([]);
        setScores([]);
      } else {
        setStudents(result.students || []);
        setAssessments(result.assessments || []);
        setScores(result.scores as ScoreRecord[] || []);
      }
      setLoading(false);
    }
    
    loadData();
  }, [assignmentId, selectedAssignment]);

  const calculateFinalGrade = (studentId: string) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let missingCount = 0;

    assessments.forEach(assessment => {
      const record = scores.find(s => s.assessment_id === assessment.id && s.student_id === studentId);
      if (!record || record.final_score == null) {
        missingCount++;
      } else {
        const scorePercentage = (record.final_score / assessment.max_score) * 100;
        totalWeightedScore += scorePercentage * assessment.weight;
        totalWeight += assessment.weight;
      }
    });

    const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    return { finalScore, missingCount };
  };

  const getMasteryCategory = (score: number) => {
    if (score >= mahirThreshold) return "mahir";
    if (score >= kkm) return "cakap";
    return "intervensi";
  };

  const getMasteryColor = (category: string) => {
    switch (category) {
      case "mahir": return "text-emerald-700 bg-emerald-50";
      case "cakap": return "text-blue-700 bg-blue-50";
      case "intervensi": return "text-rose-700 bg-rose-50";
      default: return "text-slate-700 bg-slate-50";
    }
  };

  // Compute Mastery Map Stats
  const stats = { mahir: 0, cakap: 0, intervensi: 0 };
  const studentGrades = students.map(s => {
    const { finalScore, missingCount } = calculateFinalGrade(s.id);
    const category = getMasteryCategory(finalScore);
    if (finalScore > 0 || missingCount < assessments.length) {
      stats[category as keyof typeof stats]++;
    }
    return { ...s, finalScore, missingCount, category };
  });

  const totalGraded = stats.mahir + stats.cakap + stats.intervensi;

  const handleExportCSV = () => {
    if (!selectedAssignment || students.length === 0) return;

    const headers = [
      "Nama Siswa",
      "Nomor Induk (NIS/Lokal)",
      "Nilai Akhir",
      "Kategori Penguasaan",
      ...assessments.map(a => `${a.title} (Max: ${a.max_score}, Bobot: ${a.weight})`)
    ];

    const rows = studentGrades.map(s => {
      const rowData = [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.local_code.replace(/"/g, '""')}"`,
        s.finalScore.toFixed(2),
        s.category.toUpperCase()
      ];

      assessments.forEach(a => {
        const record = scores.find(sc => sc.assessment_id === a.id && sc.student_id === s.id);
        rowData.push(record && record.final_score != null ? String(record.final_score) : "");
      });

      return rowData.join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `Buku_Nilai_${selectedAssignment.label.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Class Selector & Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="assignment" className="mb-2 block text-sm font-semibold text-slate-900">
              Kelas & Mata Pelajaran
            </label>
            <select
              id="assignment"
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="" disabled>Pilih Kelas...</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Batas KKM</label>
              <input 
                type="number" 
                value={kkm} 
                onChange={(e) => setKkm(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Batas Mahir</label>
              <input 
                type="number" 
                value={mahirThreshold} 
                onChange={(e) => setMahirThreshold(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {errorMsg}
        </div>
      )}

      {assignmentId && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em] text-slate-900">Peta Penguasaan (Mastery Map)</h2>
              <p className="text-sm text-slate-500 mt-1">
                Distribusi nilai siswa berdasarkan KKM {kkm} dan Batas Mahir {mahirThreshold}.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={loading || students.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Download size={16} />
              Unduh CSV
            </button>
          </div>

          {/* Mastery Map Stats */}
          {!loading && assessments.length > 0 && students.length > 0 && (
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-200">
              <div className="p-4 flex flex-col items-center justify-center bg-emerald-50/30">
                <div className="text-2xl font-black text-emerald-700">{stats.mahir}</div>
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">Mahir (≥{mahirThreshold})</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{totalGraded > 0 ? Math.round(stats.mahir/totalGraded*100) : 0}% dari kelas</div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center bg-blue-50/30">
                <div className="text-2xl font-black text-blue-700">{stats.cakap}</div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">Cakap (≥{kkm})</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{totalGraded > 0 ? Math.round(stats.cakap/totalGraded*100) : 0}% dari kelas</div>
              </div>
              <div className="p-4 flex flex-col items-center justify-center bg-rose-50/30">
                <div className="text-2xl font-black text-rose-700">{stats.intervensi}</div>
                <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mt-1">Intervensi (&lt;{kkm})</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{totalGraded > 0 ? Math.round(stats.intervensi/totalGraded*100) : 0}% dari kelas</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <FileSpreadsheet size={32} className="mb-3 text-slate-400" />
              <p className="text-sm font-medium">Belum ada penilaian untuk kelas ini</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-sm font-medium">Belum ada murid di kelas ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap min-w-[200px] sticky left-0 z-10 bg-slate-50 shadow-[1px_0_0_0_#e2e8f0]">
                      Nama Siswa
                    </th>
                    <th className="px-5 py-4 font-bold text-slate-700 whitespace-nowrap bg-slate-100/50">
                      Nilai Akhir
                    </th>
                    {assessments.map(a => (
                      <th key={a.id} className="px-5 py-4 font-semibold whitespace-nowrap min-w-[120px]">
                        <div className="flex flex-col gap-1">
                          <span className="truncate max-w-[150px]" title={a.title}>{a.title}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md inline-block w-fit font-medium">
                            Bobot: {a.weight}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentGrades.map(s => {
                    const colorClass = getMasteryColor(s.category);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 shadow-[1px_0_0_0_#e2e8f0]">
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{s.local_code || "-"}</div>
                          {s.missingCount > 0 && (
                            <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                              <AlertTriangle size={10} />
                              {s.missingCount} belum dinilai
                            </div>
                          )}
                        </td>
                        <td className={`px-5 py-3 font-bold text-lg ${colorClass}`}>
                          {s.finalScore.toFixed(1)}
                        </td>
                        {assessments.map(a => {
                          const record = scores.find(sc => sc.assessment_id === a.id && sc.student_id === s.id);
                          const isMissing = !record || record.final_score == null;
                          return (
                            <td key={a.id} className="px-5 py-3">
                              {isMissing ? (
                                <span className="text-slate-300 font-medium">-</span>
                              ) : (
                                <span className="font-medium text-slate-900">{record.final_score}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
