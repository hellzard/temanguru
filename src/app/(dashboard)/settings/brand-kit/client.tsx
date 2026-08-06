"use client";

import { useTransition, useRef, useState } from "react";
import { saveBrandKit } from "./actions";
import { toast } from "sonner";
import { Paintbrush, Image as ImageIcon, Save, Loader2 } from "lucide-react";

export interface BrandKitData {
  logo_url?: string;
  primary_color?: string;
  letterhead_config?: {
    schoolName?: string;
    address?: string;
    contact?: string;
  };
}

export function BrandKitClient({ initialData, signedLogoUrl }: { initialData: BrandKitData | null, signedLogoUrl: string | null }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(signedLogoUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const action = (formData: FormData) => {
    startTransition(async () => {
      try {
        await saveBrandKit(formData);
      } catch (e: any) {
        if (e?.message?.includes("NEXT_REDIRECT")) throw e;
        toast.error("Terjadi kesalahan.");
      }
    });
  };

  return (
    <form ref={formRef} action={action} className="mt-8 space-y-8 max-w-2xl">
      <input type="hidden" name="current_logo_url" value={initialData?.logo_url || ""} />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <ImageIcon className="text-indigo-600" /> Logo & Warna
        </h2>
        
        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Logo Sekolah</label>
            <div className="mt-2 flex items-center gap-6">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Logo" className="size-full object-contain p-1" />
                ) : (
                  <ImageIcon className="text-slate-400" size={32} />
                )}
              </div>
              <div>
                <label className="cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                  Pilih gambar
                  <input type="file" name="logo" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="mt-2 text-xs text-slate-500">PNG, JPG, atau SVG (Maks. 2MB)</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Warna Utama (Primary Color)</label>
            <div className="mt-2 flex items-center gap-3">
              <input 
                type="color" 
                name="primary_color" 
                defaultValue={initialData?.primary_color || "#4F46E5"}
                className="size-10 cursor-pointer rounded-lg border-0 p-0"
              />
              <input 
                type="text" 
                defaultValue={initialData?.primary_color || "#4F46E5"}
                className="block w-full max-w-xs rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Paintbrush className="text-indigo-600" /> Pengaturan Kop Surat
        </h2>
        
        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nama Instansi / Sekolah</label>
            <input 
              type="text" 
              name="school_name" 
              defaultValue={initialData?.letterhead_config?.schoolName || ""}
              placeholder="Contoh: SMA Negeri 1 Jakarta"
              className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Alamat Lengkap</label>
            <textarea 
              name="address" 
              defaultValue={initialData?.letterhead_config?.address || ""}
              rows={3}
              placeholder="Contoh: Jl. Budi Utomo No. 7, Sawah Besar, Jakarta Pusat 10710"
              className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Kontak (Telepon / Email / Website)</label>
            <input 
              type="text" 
              name="contact" 
              defaultValue={initialData?.letterhead_config?.contact || ""}
              placeholder="Telp: (021) 1234567 | Email: info@sman1jkt.sch.id"
              className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
