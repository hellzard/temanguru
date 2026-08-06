"use client";

import { useState, useTransition } from "react";
import { updateDocument } from "./actions";
import { toast } from "sonner";
import { Save, Printer, Loader2, Send } from "lucide-react";

export interface DocumentData {
  id: string;
  title: string;
  status: string;
  variables: Record<string, string>;
  document_templates?: {
    content_schema: Record<string, unknown>;
    name: string;
  };
}

export function DocumentEditorClient({ doc, brandKit }: { doc: DocumentData, brandKit: Record<string, unknown> | null }) {
  const [variables, setVariables] = useState<Record<string, string>>(doc.variables || {});
  const [isPending, startTransition] = useTransition();

  const blocks = (doc.document_templates?.content_schema as { blocks?: Record<string, unknown>[] })?.blocks || [];
  
  const variableBlocks = blocks.filter((b) => b.type === 'variable');
  
  const handleVarChange = (name: string, value: string) => {
    setVariables(prev => ({ ...prev, [name]: value }));
  };

  const save = (submit: boolean = false) => {
    startTransition(async () => {
      const res = await updateDocument(doc.id, variables, submit ? 'submitted' : 'draft');
      if (res.error) toast.error(res.error);
      else toast.success(submit ? "Dokumen berhasil diajukan." : "Draf disimpan.");
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-8 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6 print:hidden">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Isi Variabel Dokumen</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => save(false)}
                disabled={isPending || doc.status !== 'draft'}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-70"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan
              </button>
              <button
                onClick={() => save(true)}
                disabled={isPending || doc.status !== 'draft'}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-70"
              >
                <Send size={16} />
                Ajukan
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {variableBlocks.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada variabel yang perlu diisi pada templat ini.</p>
            ) : (
              variableBlocks.map((block) => (
                <div key={block.id as string}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{block.name as string}</label>
                  <input
                    type="text"
                    value={variables[block.name as string] || ""}
                    onChange={(e) => handleVarChange(block.name as string, e.target.value)}
                    disabled={doc.status !== 'draft'}
                    className="block w-full rounded-xl border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Aksi Ekspor</h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 w-full justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Printer size={18} />
            Cetak / Ekspor PDF
          </button>
        </div>
      </div>

      <div className="flex-[2] print:m-0 print:p-0 print:w-full">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm min-h-[800px] print:border-0 print:shadow-none print:min-h-0 print:rounded-none">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden; }
              .print-container, .print-container * { visibility: visible; }
              .print-container { position: absolute; left: 0; top: 0; width: 100%; }
              @page { margin: 20mm; size: A4 portrait; }
            }
          `}} />
          
          <div className="print-container">
            {/* Header Kop Surat */}
            <div className="border-b-4 border-slate-900 pb-4 mb-8 flex items-center justify-center text-center gap-6">
              {(brandKit?.logo_url as string) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandKit?.logo_url as string} alt="Logo" className="h-24 w-24 object-contain" />
              )}
              <div>
                <h1 className="font-bold text-2xl uppercase tracking-wider">{(brandKit?.letterhead_config as Record<string, unknown>)?.schoolName as string || "NAMA SEKOLAH"}</h1>
                <p className="text-sm mt-1">{(brandKit?.letterhead_config as Record<string, unknown>)?.address as string || "Alamat Sekolah"}</p>
                <p className="text-sm">{(brandKit?.letterhead_config as Record<string, unknown>)?.contact as string || "Kontak Sekolah"}</p>
              </div>
            </div>
            
            {/* Isi Dokumen */}
            <div className="space-y-6 text-slate-900">
              {blocks.map((block) => {
                if (block.type === 'text') {
                  return <p key={block.id as string} className="text-justify leading-relaxed whitespace-pre-wrap">{block.content as string}</p>;
                }
                if (block.type === 'heading') {
                  return <h3 key={block.id as string} className="font-bold text-lg text-center my-6 uppercase underline">{block.content as string}</h3>;
                }
                if (block.type === 'variable') {
                  return <span key={block.id as string} className="font-semibold">{variables[block.name as string] || `[${block.name as string}]`}</span>;
                }
                if (block.type === 'signature') {
                  return (
                    <div key={block.id as string} className="mt-12 flex justify-end">
                      <div className="text-center w-64">
                        <p className="mb-24">{block.role as string}</p>
                        <p className="font-bold underline">[Nama Penandatangan]</p>
                        <p className="text-sm mt-1">NIP. .........................</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
