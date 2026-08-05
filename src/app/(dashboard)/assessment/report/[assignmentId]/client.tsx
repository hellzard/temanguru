"use client";

import { Printer } from "lucide-react";

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

type Score = {
  assessment_id: string;
  student_id: string;
  original_score: number | null;
  final_score: number | null;
};

type ReportClientProps = {
  students: Student[];
  assessments: Assessment[];
  scores: Score[];
};

export default function ReportClient({ students, assessments, scores }: ReportClientProps) {
  
  // Calculate total weight
  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);

  // Map scores for easy access: student_id -> assessment_id -> score
  const scoreMap: Record<string, Record<string, number>> = {};
  
  scores.forEach(s => {
    if (!scoreMap[s.student_id]) {
      scoreMap[s.student_id] = {};
    }
    // Use final_score if available, otherwise original_score, otherwise 0
    const baseScore = s.final_score ?? s.original_score ?? 0;
    scoreMap[s.student_id][s.assessment_id] = baseScore;
  });

  // Calculate final grades
  const studentGrades = students.map(student => {
    let weightedSum = 0;
    
    const studentScores = scoreMap[student.id] || {};
    
    assessments.forEach(a => {
      const baseScore = studentScores[a.id] || 0;
      const percentage = (baseScore / a.max_score) * 100;
      weightedSum += percentage * a.weight;
    });

    const finalGrade = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
    
    return {
      ...student,
      finalGrade,
      scores: studentScores
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <Printer size={16} />
          Cetak Rapor
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm print:border-none print:shadow-none">
        <table className="w-full text-left text-sm text-slate-600 print:text-black">
          <thead className="border-b border-slate-200 bg-slate-50 print:bg-transparent print:border-b-2 print:border-black">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-900 print:text-black">No</th>
              <th className="px-4 py-3 font-semibold text-slate-900 print:text-black">Nama Siswa</th>
              <th className="px-4 py-3 font-semibold text-slate-900 print:text-black">NIS</th>
              {assessments.map(a => (
                <th key={a.id} className="px-4 py-3 font-semibold text-slate-900 print:text-black min-w-[100px]">
                  <div className="flex flex-col">
                    <span className="truncate" title={a.title}>{a.title}</span>
                    <span className="text-xs font-normal text-slate-500 print:text-black">Max: {a.max_score} | W: {a.weight}</span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-slate-900 print:text-black bg-indigo-50/50 print:bg-transparent">
                Nilai Akhir
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-slate-300">
            {studentGrades.length === 0 ? (
              <tr>
                <td colSpan={4 + assessments.length} className="px-4 py-8 text-center text-slate-500">
                  Belum ada siswa di kelas ini.
                </td>
              </tr>
            ) : (
              studentGrades.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 print:text-black">{student.name}</td>
                  <td className="px-4 py-3 text-xs">{student.local_code || '-'}</td>
                  
                  {assessments.map(a => {
                    const score = student.scores[a.id];
                    return (
                      <td key={a.id} className="px-4 py-3">
                        {score !== undefined ? score : '-'}
                      </td>
                    );
                  })}
                  
                  <td className="px-4 py-3 font-bold text-indigo-700 print:text-black bg-indigo-50/50 print:bg-transparent">
                    {student.finalGrade.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
