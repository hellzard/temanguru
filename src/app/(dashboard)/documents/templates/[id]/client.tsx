"use client";

import { useState, useTransition } from "react";
import { updateTemplate } from "./actions";
import { toast } from "sonner";
import { Plus, GripVertical, Trash2, Save, FileText, Loader2 } from "lucide-react";

export interface TemplateData {
  id: string;
  name: string;
  category: string;
  content_schema: { blocks?: Record<string, unknown>[] };
}

export function TemplateEditorClient({ initialData }: { initialData: TemplateData }) {
  const [name, setName] = useState(initialData.name || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [blocks, setBlocks] = useState<Record<string, unknown>[]>(initialData.content_schema?.blocks || []);
  const [isPending, startTransition] = useTransition();

  const addBlock = (type: string) => {
    const newBlock = { id: Date.now().toString(), type, content: "" };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Record<string, unknown>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const save = () => {
    startTransition(async () => {
      const res = await updateTemplate(initialData.id, name, category, blocks);
      if (res.error) toast.error(res.error);
      else toast.success("Templat berhasil disimpan.");
    });
  };

  return (
    <div className="mt-8 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em] text-slate-900">Pengaturan Utama</h2>
            <button
              onClick={save}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-70"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nama Templat</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-xl border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Kategori</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Surat Keputusan"
                className="mt-1 block w-full rounded-xl border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em] text-slate-900 mb-4">Blok Dokumen</h2>
          
          <div className="space-y-4">
            {blocks.map((block) => (
              <div key={block.id as string} className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 group">
                <GripVertical className="text-slate-400 mt-2 cursor-grab" size={20} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{block.type as string}</span>
                    <button onClick={() => removeBlock(block.id as string)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {block.type === 'text' && (
                    <textarea
                      value={(block.content as string) || ""}
                      onChange={(e) => updateBlock(block.id as string, { content: e.target.value })}
                      placeholder="Masukkan teks paragraf..."
                      rows={3}
                      className="block w-full rounded-xl border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    />
                  )}
                  {block.type === 'heading' && (
                    <input
                      type="text"
                      value={(block.content as string) || ""}
                      onChange={(e) => updateBlock(block.id as string, { content: e.target.value })}
                      placeholder="Masukkan judul..."
                      className="block w-full font-bold rounded-xl border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    />
                  )}
                  {block.type === 'variable' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={(block.name as string) || ""}
                        onChange={(e) => updateBlock(block.id as string, { name: e.target.value })}
                        placeholder="Nama variabel (tanpa spasi)..."
                        className="block w-full font-mono rounded-xl border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>
                  )}
                  {block.type === 'signature' && (
                    <input
                      type="text"
                      value={(block.role as string) || ""}
                      onChange={(e) => updateBlock(block.id as string, { role: e.target.value })}
                      placeholder="Peran penandatangan (Contoh: Kepala Sekolah)..."
                      className="block w-full rounded-xl border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => addBlock('text')} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
              <Plus size={14} /> Paragraf
            </button>
            <button onClick={() => addBlock('heading')} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
              <Plus size={14} /> Judul
            </button>
            <button onClick={() => addBlock('variable')} className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
              <Plus size={14} /> Variabel Input
            </button>
            <button onClick={() => addBlock('signature')} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
              <Plus size={14} /> Tanda Tangan
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="sticky top-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-slate-500">
            <FileText size={20} />
            <h2 className="text-sm font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em] uppercase tracking-wider">Pratinjau Dokumen</h2>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm min-h-[500px] border border-slate-200">
            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
              <h1 className="font-bold text-xl uppercase">[KOP SURAT DARI BRAND KIT]</h1>
            </div>
            
            <div className="space-y-6">
              {blocks.map(block => (
                <div key={block.id as string}>
                  {block.type === 'text' && <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-wrap">{(block.content as string) || "[Teks Kosong]"}</p>}
                  {block.type === 'heading' && <h3 className="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em] text-lg text-center">{(block.content as string) || "[Judul Kosong]"}</h3>}
                  {block.type === 'variable' && <span className="inline-block bg-amber-100 text-amber-800 font-mono text-sm px-2 py-0.5 rounded">{`{{${(block.name as string) || "variabel"}}}`}</span>}
                  {block.type === 'signature' && (
                    <div className="mt-8 flex justify-end">
                      <div className="text-center w-64">
                        <p className="mb-16">{(block.role as string) || "[Peran Penandatangan]"}</p>
                        <p className="font-bold underline">[Nama Penandatangan]</p>
                        <p className="text-sm">NIP. [NIP Penandatangan]</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {blocks.length === 0 && (
                <p className="text-slate-400 text-center italic mt-20">Tambahkan blok untuk mulai merancang dokumen.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
