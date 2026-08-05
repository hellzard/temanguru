"use client";

import { useTransition, useState } from "react";
import { Plus, Archive, Search, QrCode, ArrowRight } from "lucide-react";
import { createInventoryItem, borrowItem } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const initialItemState = { success: false, message: "" };
const initialBorrowState = { success: false, message: "" };

type InventoryItem = Record<string, unknown> & {
  id?: string;
  name?: string;
  code?: string;
  condition?: string;
  location?: string;
  is_available?: boolean;
};

export function InventoryClient({ items }: { items: InventoryItem[] }) {
  const [pendingItem, startTransitionItem] = useTransition();
  const [pendingBorrow, startTransitionBorrow] = useTransition();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionItem(async () => {
      const result = await createInventoryItem(initialItemState, formData);
      if (result.success) {
        toast.success(result.message);
        setIsFormOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleBorrowSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionBorrow(async () => {
      const result = await borrowItem(initialBorrowState, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const filteredItems = items.filter(i => 
    (i.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (i.code?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Inventaris & Sarpras</h2>
          <p className="mt-1 text-sm text-slate-500">
            Katalog barang, peminjaman, dan pencetakan kode QR.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Tambah Barang
          </Button>
        )}
      </div>

      {isFormOpen && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Input Barang Baru</h3>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-slate-800">
                  Kode / Serial Number
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Contoh: INV-2026-001"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                  Nama Barang
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Contoh: Proyektor Epson EB-X05"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-800">
                  Kategori
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
                >
                  <option value="electronics">Elektronik</option>
                  <option value="furniture">Furnitur</option>
                  <option value="sports">Alat Olahraga</option>
                  <option value="books">Buku</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-semibold text-slate-800">
                  Kondisi
                </label>
                <select
                  id="condition"
                  name="condition"
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
                >
                  <option value="good">Baik</option>
                  <option value="fair">Cukup/Layak</option>
                  <option value="damaged">Rusak</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="location" className="block text-sm font-semibold text-slate-800">
                  Lokasi Penyimpanan
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Contoh: Lemari Kaca Ruang Guru"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pendingItem}>
                {pendingItem ? "Menyimpan..." : "Simpan Barang"}
              </Button>
            </div>
          </form>
        </section>
      )}

      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <Search size={20} className="ml-2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kode atau nama barang..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent p-2 text-slate-900 outline-none"
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Archive size={24} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-950">Data tidak ditemukan</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {items.length === 0 ? "Belum ada barang di inventaris sekolah." : "Coba gunakan kata kunci lain."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`grid size-10 place-items-center rounded-xl ${
                    item.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <Archive size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">{item.code}</span>
                    <h4 className="font-bold text-slate-900 line-clamp-1" title={item.name}>{item.name}</h4>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  item.condition === 'good' ? 'bg-slate-100 text-slate-700' :
                  item.condition === 'fair' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  Kondisi: {item.condition}
                </span>
                <span className="text-xs font-medium text-slate-500">{item.location || 'Lokasi tidak diatur'}</span>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="secondary" className="flex-1" title="Cetak Label QR">
                  <QrCode size={16} />
                </Button>
                {item.is_available ? (
                  <form onSubmit={handleBorrowSubmit} className="flex-2 w-full">
                    <input type="hidden" name="item_id" value={item.id} />
                    <Button type="submit" className="w-full" disabled={pendingBorrow}>
                      <ArrowRight size={16} className="mr-1" /> Pinjam
                    </Button>
                  </form>
                ) : (
                  <Button variant="secondary" className="w-full text-slate-500" disabled>
                    Sedang Dipinjam
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
