"use client";

import { useTransition, useState } from "react";
import { ArrowLeft, CheckCircle, Circle, Clock, Plus } from "lucide-react";
import { createEventTask } from "./actions";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const initialState = { success: false, message: "" };

type EventTaskItem = Record<string, unknown> & {
  id?: string;
  title?: string;
  status?: string;
};

type EventDetail = Record<string, unknown> & {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  starts_at?: string;
  ends_at?: string | null;
};

export function EventDetailClient({ event, tasks }: { event: EventDetail, tasks: EventTaskItem[] }) {
  const [pending, startTransition] = useTransition();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createEventTask(initialState, formData);
      if (result.success) {
        toast.success(result.message);
        setIsTaskFormOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} className="mr-1" />
        Kembali ke Acara
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">{event.name}</h1>
            <p className="mt-2 text-slate-600">{event.description}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
            event.status === 'draft' ? 'bg-slate-100 text-slate-600' :
            event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
            'bg-indigo-100 text-indigo-700'
          }`}>
            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : ''}
          </span>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-6 text-sm text-slate-600">
          <div>
            <span className="block font-medium text-slate-400">Tanggal Mulai</span>
            <span className="font-semibold text-slate-900">
              {event.starts_at ? new Date(event.starts_at).toLocaleString("id-ID") : "-"}
            </span>
          </div>
          {event.ends_at && (
            <div>
              <span className="block font-medium text-slate-400">Tanggal Selesai</span>
              <span className="font-semibold text-slate-900">
                {new Date(event.ends_at).toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Daftar Tugas (Kepanitiaan)</h2>
          {!isTaskFormOpen && (
            <Button variant="secondary" onClick={() => setIsTaskFormOpen(true)}>
              <Plus size={16} className="mr-1" /> Tambah Tugas
            </Button>
          )}
        </div>

        {isTaskFormOpen && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <input type="hidden" name="event_id" value={event.id} />
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Contoh: Menyiapkan konsumsi"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsTaskFormOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Menyimpan..." : "Simpan Tugas"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Belum ada tugas yang dibuat untuk acara ini.
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle className="text-emerald-500" size={20} />
                  ) : task.status === 'in_progress' ? (
                    <Clock className="text-amber-500" size={20} />
                  ) : (
                    <Circle className="text-slate-300" size={20} />
                  )}
                  <div>
                    <p className={`font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {task.status ? task.status.replace("_", " ") : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
