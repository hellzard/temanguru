"use client";

import { useTransition, useState } from "react";
import { Plus, Presentation, Calendar as CalendarIcon } from "lucide-react";
import { createEvent } from "./actions";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const initialState = { success: false, message: "" };

type EventItem = Record<string, unknown> & {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  starts_at?: string;
};

export function EventsClient({ events }: { events: EventItem[] }) {
  const [pending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createEvent(formData);
      } catch (e: any) {
        if (e?.message?.includes("NEXT_REDIRECT")) throw e;
        toast.error("Terjadi kesalahan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Acara Sekolah</h2>
          <p className="mt-1 text-sm text-slate-500">
            Daftar acara, jadwal kegiatan, dan kepanitiaan.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Buat Acara Baru
          </Button>
        )}
      </div>

      {isFormOpen && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Buat Acara Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                Nama Acara
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="Contoh: Pentas Seni Akhir Tahun"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-800">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="Tujuan atau penjelasan acara"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="starts_at" className="block text-sm font-semibold text-slate-800">
                  Tanggal Mulai
                </label>
                <input
                  type="datetime-local"
                  id="starts_at"
                  name="starts_at"
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="ends_at" className="block text-sm font-semibold text-slate-800">
                  Tanggal Selesai (Opsional)
                </label>
                <input
                  type="datetime-local"
                  id="ends_at"
                  name="ends_at"
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan Acara"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {events.length === 0 && !isFormOpen ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Presentation size={24} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-950">Belum ada acara</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Jadwalkan kegiatan besar sekolah dan kelola kepanitiaan di sini.
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="mt-6">
            <Plus size={18} className="mr-2" />
            Buat Acara Pertama
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((evt) => (
            <Link 
              key={evt.id} 
              href={`/events/${evt.id}`}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Presentation size={20} />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    evt.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                    evt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {evt.status ? evt.status.charAt(0).toUpperCase() + evt.status.slice(1) : ''}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-950 line-clamp-1">{evt.name}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2 min-h-10">
                  {evt.description || "Tidak ada deskripsi"}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarIcon size={16} className="text-slate-400" />
                {evt.starts_at ? new Date(evt.starts_at).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric"
                }) : "-"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
