"use client";

import { Loader2, PackagePlus, RotateCcw, ShoppingBag } from "lucide-react";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/dashboard/status-pill";
import { borrowItem, createInventoryItem, returnItem } from "./actions";

export type InventoryItemView = Record<string, unknown> & {
  quantity: number;
  activeCount: number;
  availableCount: number;
  ownLoan: Record<string, unknown> | null;
  manageableLoan: Record<string, unknown> | null;
};

type ActionResult = { success: boolean; message: string };
type InventoryAction = (previous: unknown, data: FormData) => Promise<ActionResult>;

export function InventoryClient({
  items,
  canManage,
}: {
  items: InventoryItemView[];
  canManage: boolean;
}) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: InventoryAction, data: FormData, form?: HTMLFormElement) {
    startTransition(async () => {
      const result = await action(null, data);
      setMessage({ ok: result.success, text: result.message });
      if (result.success) form?.reset();
    });
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-black">Inventaris</h1>
        <p className="mt-2 tg-muted">
          Stok dan peminjaman dikunci dalam transaksi agar jumlah tersedia selalu konsisten.
        </p>
      </div>

      {message ? (
        <p
          role={message.ok ? "status" : "alert"}
          className={`mb-5 rounded-xl border p-3 text-sm ${
            message.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {canManage ? (
        <section className="tg-card p-5">
          <div className="flex items-center gap-3">
            <PackagePlus className="text-[var(--tg-primary)]" size={21} />
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Tambah barang</h2>
          </div>
          <form
            className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6"
            onSubmit={(event) => {
              event.preventDefault();
              run(createInventoryItem, new FormData(event.currentTarget), event.currentTarget);
            }}
          >
            <input name="name" required placeholder="Nama barang" className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 xl:col-span-2" />
            <input name="code" required placeholder="Kode unik" className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" />
            <select name="category" className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">
              <option value="electronics">Elektronik</option>
              <option value="furniture">Furnitur</option>
              <option value="sports">Olahraga</option>
              <option value="books">Buku</option>
              <option value="other">Lainnya</option>
            </select>
            <input type="number" min="1" name="quantity" defaultValue="1" aria-label="Jumlah" className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" />
            <button disabled={pending} className="tg-primary-button">
              {pending ? <Loader2 className="animate-spin" size={17} /> : null}
              Simpan
            </button>
            <input name="location" placeholder="Lokasi penyimpanan" className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 xl:col-span-2" />
            <select name="condition" className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">
              <option value="good">Baik</option>
              <option value="fair">Cukup</option>
              <option value="damaged">Rusak</option>
            </select>
          </form>
        </section>
      ) : null}

      {items.length ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const loan = item.manageableLoan;
            const unavailable = item.availableCount <= 0 || String(item.condition) === "damaged";
            return (
              <article key={String(item.id)} className="tg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]">
                    <ShoppingBag size={21} />
                  </span>
                  <StatusPill value={String(item.condition)} />
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">{String(item.name)}</h2>
                <p className="mt-1 text-sm tg-muted">
                  {String(item.code)} · {String(item.location ?? "Lokasi belum diisi")}
                </p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-[var(--tg-surface-muted)] p-2">
                    <dt className="tg-muted">Total</dt>
                    <dd className="mt-1 font-black">{item.quantity}</dd>
                  </div>
                  <div className="rounded-xl bg-[var(--tg-surface-muted)] p-2">
                    <dt className="tg-muted">Dipinjam</dt>
                    <dd className="mt-1 font-black">{item.activeCount}</dd>
                  </div>
                  <div className="rounded-xl bg-[var(--tg-surface-muted)] p-2">
                    <dt className="tg-muted">Tersedia</dt>
                    <dd className="mt-1 font-black">{item.availableCount}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  {loan ? (
                    <button
                      disabled={pending}
                      onClick={() => {
                        const data = new FormData();
                        data.set("loan_id", String(loan.id));
                        run(returnItem, data);
                      }}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--tg-border)] px-3 text-sm font-bold"
                    >
                      <RotateCcw size={16} />
                      {item.ownLoan ? "Kembalikan pinjaman saya" : "Tandai dikembalikan"}
                    </button>
                  ) : null}
                  {!item.ownLoan ? (
                    <button
                      disabled={pending || unavailable}
                      onClick={() => {
                        const data = new FormData();
                        data.set("item_id", String(item.id));
                        run(borrowItem, data);
                      }}
                      className="tg-primary-button min-h-10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {unavailable ? "Tidak tersedia" : "Pinjam"}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="tg-card mt-6 p-8 text-center">
          <p className="font-bold">Belum ada inventaris.</p>
          <p className="mt-2 text-sm tg-muted">Owner atau admin dapat menambahkan barang pertama.</p>
        </div>
      )}
    </div>
  );
}
