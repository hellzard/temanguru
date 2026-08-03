"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importStudentsToClass } from "../../import-actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, UploadCloud } from "lucide-react";

type ParsedStudent = {
  display_name: string;
  local_code: string | null;
  isValid: boolean;
  errors: string[];
};

export function ImportCsvWizard({ classId }: { classId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsParsing(true);
    setSubmitError(null);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, unknown>[];
        const processed: ParsedStudent[] = rows.map((row) => {
          // Flexible column matching
          const displayNameRaw = row["Nama Lengkap"] || row["Nama"] || row["display_name"] || row["nama"] || "";
          const localCodeRaw = row["NIS"] || row["NISN"] || row["local_code"] || row["nis"] || "";

          const displayName = String(displayNameRaw).trim();
          const localCode = String(localCodeRaw).trim() || null;

          const errors: string[] = [];
          if (!displayName) errors.push("Nama tidak boleh kosong");
          if (displayName.length > 150) errors.push("Nama terlalu panjang");
          if (localCode && localCode.length > 50) errors.push("NIS terlalu panjang");

          return {
            display_name: displayName,
            local_code: localCode,
            isValid: errors.length === 0,
            errors,
          };
        });

        // Check for internal duplicates of local_code
        const seenCodes = new Set<string>();
        processed.forEach(p => {
          if (p.local_code && p.isValid) {
            if (seenCodes.has(p.local_code)) {
              p.isValid = false;
              p.errors.push("NIS duplikat di dalam file ini");
            } else {
              seenCodes.add(p.local_code);
            }
          }
        });

        setParsedData(processed);
        setIsParsing(false);
      },
      error: (err) => {
        setSubmitError(`Gagal membaca CSV: ${err.message}`);
        setIsParsing(false);
      }
    });
  };

  const handleConfirm = async () => {
    const validStudents = parsedData.filter(s => s.isValid);
    if (validStudents.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = validStudents.map(s => ({
      display_name: s.display_name,
      local_code: s.local_code,
    }));

    const result = await importStudentsToClass(classId, payload);
    
    if (result.error) {
      setSubmitError(result.error);
      setIsSubmitting(false);
    } else {
      router.push(`/classes/${classId}`);
    }
  };

  const validCount = parsedData.filter(s => s.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">1. Unggah File CSV</h2>
        <p className="mt-1 text-sm text-slate-600 mb-5">
          Pastikan file CSV memiliki kolom header yang mengandung nama (contoh: <code>Nama Lengkap</code>) dan kolom NIS (opsional, contoh: <code>NIS</code>).
        </p>
        
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:bg-slate-100">
          <UploadCloud className="mb-3 text-slate-400" size={32} />
          <span className="text-sm font-medium text-slate-700">
            {file ? file.name : "Klik untuk memilih file CSV"}
          </span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {isParsing && <p className="text-slate-500">Membaca file...</p>}

      {parsedData.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">2. Pratinjau Data</h2>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              <CheckCircle2 size={16} /> {validCount} Siap Import
            </span>
            {invalidCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">
                <AlertCircle size={16} /> {invalidCount} Tidak Valid
              </span>
            )}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                  <th className="px-4 py-3 font-semibold">NIS/NISN</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedData.map((row, idx) => (
                  <tr key={idx} className={row.isValid ? "bg-white" : "bg-red-50"}>
                    <td className="px-4 py-3">{row.display_name || <span className="text-slate-400 italic">Kosong</span>}</td>
                    <td className="px-4 py-3">{row.local_code || "-"}</td>
                    <td className="px-4 py-3">
                      {row.isValid ? (
                        <span className="text-emerald-600">Valid</span>
                      ) : (
                        <span className="text-red-600">{row.errors.join(", ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submitError && (
            <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{submitError}</p>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <Button type="button" variant="primary" disabled={validCount === 0 || isSubmitting} onClick={handleConfirm}>
              {isSubmitting ? "Menyimpan..." : `Konfirmasi Import (${validCount} Murid)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
