"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import Papa from "papaparse";

type RecapClientProps = {
  assignments: {
    id: string;
    class_id: string;
    subject_id: string;
    class_name: string;
    subject_name: string;
  }[];
  selectedAssignmentId: string;
  selectedMonth: string;
  sessions: Record<string, unknown>[];
  journals: Record<string, unknown>[];
};

export default function RecapClient({
  assignments,
  selectedAssignmentId,
  selectedMonth,
  sessions,
  journals
}: RecapClientProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  // Group data by date
  const groupedData = new Map<string, Record<string, unknown>>();
  
  sessions.forEach(s => {
    const sessionDate = s.session_date as string;
    groupedData.set(sessionDate, {
      ...groupedData.get(sessionDate),
      session: s,
      date: sessionDate
    });
  });

  journals.forEach(j => {
    const journalDate = j.journal_date as string;
    groupedData.set(journalDate, {
      ...groupedData.get(journalDate),
      journal: j,
      date: journalDate
    });
  });

  const sortedDates = Array.from(groupedData.keys()).sort();
  const mergedData = sortedDates.map(date => groupedData.get(date));

  const followUps = journals.filter(j => {
    const obstacle = j.obstacle as string | undefined;
    const follow_up = j.follow_up as string | undefined;
    return (obstacle && obstacle.trim().length > 0) || 
           (follow_up && follow_up.trim().length > 0);
  });

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/recap?assignmentId=${e.target.value}&month=${selectedMonth}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`/recap?assignmentId=${selectedAssignmentId}&month=${e.target.value}`);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const csvData = mergedData.map(item => {
        const j = item?.journal as Record<string, unknown> | undefined;
        const s = item?.session as Record<string, unknown> | undefined;
        
        let hadir = 0, sakit = 0, izin = 0, alpa = 0, telat = 0;
        if (s?.attendance_records) {
          (s.attendance_records as Record<string, unknown>[]).forEach((r) => {
            switch (r.status) {
              case 'present': hadir++; break;
              case 'sick': sakit++; break;
              case 'permission': izin++; break;
              case 'absent': alpa++; break;
              case 'late': telat++; break;
            }
          });
        }

        return {
          Tanggal: item?.date || "-",
          "Topik/Materi": j?.topic || "-",
          "Ringkasan Kegiatan": j?.activity_summary || "-",
          Refleksi: j?.reflection || "-",
          Hambatan: j?.obstacle || "-",
          "Tindak Lanjut": j?.follow_up || "-",
          Hadir: hadir,
          Sakit: sakit,
          Izin: izin,
          Alpa: alpa,
          Telat: telat,
        };
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `recap_${selectedAssignmentId}_${selectedMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="assignment" className="mb-1.5 block text-sm font-semibold text-slate-900">Pilih Kelas & Mapel</label>
          <div className="relative">
            <select
              id="assignment"
              value={selectedAssignmentId}
              onChange={handleAssignmentChange}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="" disabled>-- Pilih Kelas --</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.class_name} - {a.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="sm:w-48">
          <label htmlFor="month" className="mb-1.5 block text-sm font-semibold text-slate-900">Bulan</label>
          <input
            type="month"
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>

      {selectedAssignmentId && (
        <>
          {/* Tindak Lanjut & Hambatan */}
          {followUps.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-amber-800">
                <AlertTriangle size={18} />
                <h3 className="font-bold">Perlu Perhatian (Tindak Lanjut & Hambatan)</h3>
              </div>
              <ul className="space-y-3">
                {followUps.map(j => (
                  <li key={j.id as string} className="rounded-xl border border-amber-100 bg-white p-3 text-sm shadow-sm">
                    <div className="mb-1 font-semibold text-slate-900">{j.journal_date as string} • {j.topic as string}</div>
                    {!!j.obstacle && <p className="text-slate-600"><span className="font-medium text-amber-700">Hambatan:</span> {j.obstacle as string}</p>}
                    {!!j.follow_up && <p className="text-slate-600"><span className="font-medium text-amber-700">Tindak Lanjut:</span> {j.follow_up as string}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Table Data */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                Data Jurnal & Presensi
              </h3>
              <button
                onClick={handleExportCSV}
                disabled={isExporting || mergedData.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
            
            {mergedData.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                <CheckCircle2 size={32} className="text-slate-300" />
                <p>Belum ada catatan kelas di bulan ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold whitespace-nowrap">Tanggal</th>
                      <th className="p-4 font-semibold">Topik & Kegiatan</th>
                      <th className="p-4 font-semibold whitespace-nowrap text-center">Hadir</th>
                      <th className="p-4 font-semibold whitespace-nowrap text-center">Sakit</th>
                      <th className="p-4 font-semibold whitespace-nowrap text-center">Izin</th>
                      <th className="p-4 font-semibold whitespace-nowrap text-center">Alpa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mergedData.map(item => {
                      const j = item?.journal as Record<string, unknown> | undefined;
                      const s = item?.session as Record<string, unknown> | undefined;
                      
                      let hadir = 0, sakit = 0, izin = 0, alpa = 0;
                      if (s?.attendance_records) {
                        (s.attendance_records as Record<string, unknown>[]).forEach(r => {
                          switch (r.status) {
                            case 'present': hadir++; break;
                            case 'sick': sakit++; break;
                            case 'permission': izin++; break;
                            case 'absent': alpa++; break;
                          }
                        });
                      }

                      return (
                        <tr key={item?.date as string} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-900 whitespace-nowrap align-top">
                            {item?.date as string}
                          </td>
                          <td className="p-4 align-top">
                            {j ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-slate-900">{j.topic as string}</p>
                                <p className="text-slate-600 line-clamp-2">{j.activity_summary as string}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Jurnal belum diisi</span>
                            )}
                          </td>
                          <td className="p-4 align-top text-center font-medium text-slate-700">{s ? hadir : "-"}</td>
                          <td className="p-4 align-top text-center text-slate-700">{s ? sakit : "-"}</td>
                          <td className="p-4 align-top text-center text-slate-700">{s ? izin : "-"}</td>
                          <td className="p-4 align-top text-center text-red-600 font-medium">{s ? alpa : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
