"use client";

import { useTransition, useState } from "react";
import { Plus, Wrench, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { createMaintenanceTicket } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const initialState = { success: false, message: "" };

type MaintenanceItem = Record<string, unknown> & {
  id?: string;
  code?: string;
  name?: string;
};

type MaintenanceTicketItem = Record<string, unknown> & {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  item_id?: string;
  created_at?: string;
};

export function MaintenanceClient({ tickets, items }: { tickets: MaintenanceTicketItem[], items: MaintenanceItem[] }) {
  const [pending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createMaintenanceTicket(formData);
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
          <h2 className="text-lg font-bold text-slate-950">Laporan Kerusakan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Laporkan kerusakan sarana prasarana agar segera ditangani oleh tim teknisi/sarpras.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Buat Laporan Baru
          </Button>
        )}
      </div>

      {isFormOpen && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Lapor Kerusakan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
                Ringkasan Laporan
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="Contoh: AC Ruang Guru Bocor"
              />
            </div>
            
            <div>
              <label htmlFor="item_id" className="block text-sm font-semibold text-slate-800">
                Terkait Barang Inventaris (Opsional)
              </label>
              <select
                id="item_id"
                name="item_id"
                className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
              >
                <option value="">-- Pilih Barang (Bila ada) --</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-800">
                Detail Kerusakan
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="Jelaskan secara detail masalah yang terjadi..."
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Mengirim..." : "Kirim Laporan"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {tickets.length === 0 && !isFormOpen ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Wrench size={24} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-950">Belum ada laporan kerusakan</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Fasilitas sekolah terpantau aman dan berfungsi dengan baik.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    ticket.status === 'open' ? 'bg-rose-100 text-rose-700' :
                    ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ticket.status === 'open' && <AlertTriangle size={14} className="mr-1" />}
                    {ticket.status === 'in_progress' && <Clock size={14} className="mr-1" />}
                    {ticket.status === 'resolved' && <CheckCircle2 size={14} className="mr-1" />}
                    {ticket.status === 'open' ? 'Menunggu Penanganan' : 
                     ticket.status === 'in_progress' ? 'Sedang Diperbaiki' : 'Selesai Diperbaiki'}
                  </div>
                </div>
                <h3 className="mt-4 font-bold text-slate-950 line-clamp-1" title={ticket.title}>{ticket.title}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                  {ticket.description || "Tidak ada detail tambahan"}
                </p>
              </div>
              
              {ticket.item_id && items.find(i => i.id === ticket.item_id) && (
                <div className="mt-4 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 font-medium">
                  Terkait: {items.find(i => i.id === ticket.item_id)?.name}
                </div>
              )}
              
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400 font-medium">
                {ticket.created_at ? `Dilaporkan pada ${new Date(ticket.created_at).toLocaleDateString("id-ID")}` : "Tanggal tidak diketahui"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
