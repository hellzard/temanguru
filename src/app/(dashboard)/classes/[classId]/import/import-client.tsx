"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useState, useTransition, type ChangeEvent } from "react";
import { importStudentsFromCsv } from "../actions";

type Row = { display_name: string; local_code: string };

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if ((char === "," || char === ";") && !quoted) {
      cells.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value.trim());
  return cells;
}

function parseCsv(source: string): Row[] {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]).map((value) => value.toLowerCase().replaceAll(" ", "_"));
  const nameIndex = header.findIndex((value) => ["nama", "nama_murid", "display_name"].includes(value));
  const codeIndex = header.findIndex((value) => ["kode", "nis", "nisn", "local_code"].includes(value));
  if (nameIndex < 0) throw new Error("Header wajib memuat kolom nama atau display_name.");
  return lines
    .slice(1)
    .map(parseCsvLine)
    .map((cells) => ({
      display_name: cells[nameIndex]?.trim() ?? "",
      local_code: codeIndex >= 0 ? cells[codeIndex]?.trim() ?? "" : "",
    }))
    .filter((row) => row.display_name);
}

export function ImportClient({ classId }: { classId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setMessage({ ok: false, text: "File CSV maksimal 1,5 MB." });
      return;
    }
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.length) throw new Error("File tidak memiliki baris murid.");
      if (parsed.length > 500) throw new Error("Maksimal 500 murid per impor.");
      setRows(parsed);
      setMessage({ ok: true, text: `${parsed.length} baris siap diperiksa.` });
    } catch (error) {
      setRows([]);
      setMessage({ ok: false, text: error instanceof Error ? error.message : "CSV belum dapat dibaca." });
    }
  }

  function submit() {
    startTransition(async () => {
      const result = await importStudentsFromCsv({ class_id: classId, rows });
      setMessage({ ok: result.success, text: result.message });
      if (result.success) setRows([]);
    });
  }

  return (
    <div>
      <label className="tg-card flex cursor-pointer flex-col items-center justify-center border-dashed p-8 text-center">
        <FileUp size={30} className="text-[var(--tg-primary)]" />
        <span className="mt-3 font-bold">Pilih file CSV</span>
        <span className="mt-1 text-sm tg-muted">Header contoh: nama,kode</span>
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={readFile} />
      </label>
      {message ? <p role={message.ok ? "status" : "alert"} className={`mt-4 rounded-xl border p-3 text-sm ${message.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{message.text}</p> : null}
      {rows.length ? (
        <div className="mt-5">
          <div className="max-h-80 overflow-auto rounded-2xl border border-[var(--tg-border)]">
            <table className="w-full text-left text-sm"><thead className="sticky top-0 bg-[var(--tg-surface-muted)]"><tr><th className="p-3">Nama</th><th className="p-3">Kode</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.display_name}-${index}`} className="border-t border-[var(--tg-border)]"><td className="p-3">{row.display_name}</td><td className="p-3 tg-muted">{row.local_code || "—"}</td></tr>)}</tbody></table>
          </div>
          <button disabled={pending} onClick={submit} className="tg-primary-button mt-4 w-full">{pending ? <Loader2 size={17} className="animate-spin" /> : null}Impor {rows.length} murid</button>
        </div>
      ) : null}
    </div>
  );
}
